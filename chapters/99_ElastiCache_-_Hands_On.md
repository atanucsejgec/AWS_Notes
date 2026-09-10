# AWS ElastiCache - Complete Learning Guide

## What is ElastiCache?

ElastiCache is a **fully managed in-memory caching service** that supports two engines:
- **Redis** - Feature-rich, persistent, supports data structures
- **Memcached** - Simple, multi-threaded, pure caching

---

## Why ElastiCache is Important?

```
WITHOUT ElastiCache:
┌─────────┐    Every Request    ┌─────────┐
│  User   │ ──────────────────► │   DB    │ ← Slow + Expensive
└─────────┘                     └─────────┘
     ↑ Response in 100-500ms

WITH ElastiCache:
┌─────────┐   Cache Hit (80%)   ┌──────────────┐
│  User   │ ──────────────────► │ ElastiCache  │ ← Fast + Cheap
└─────────┘                     └──────────────┘
                                       │ Cache Miss (20%)
                                       ▼
                                ┌─────────┐
                                │   DB    │
                                └─────────┘
     ↑ Response in 1-5ms
```

### Real World Use Cases:
| Use Case | Example |
|----------|---------|
| **Session Storage** | Store user login sessions |
| **Database Caching** | Cache frequent SQL query results |
| **Real-time Analytics** | Leaderboards, counters |
| **Rate Limiting** | API throttling |
| **Pub/Sub Messaging** | Chat applications |

---

## Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| Data Structures | Strings, Lists, Sets, Hashes, Sorted Sets | Strings only |
| Persistence | Yes (snapshots) | No |
| Replication | Yes (Multi-AZ) | No |
| Pub/Sub | Yes | No |
| Multi-threading | No (single) | Yes |
| Use When | Complex data, HA needed | Simple cache, speed |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    VPC                          │
│                                                 │
│  ┌──────────┐    ┌─────────────────────────┐   │
│  │          │    │     ElastiCache         │   │
│  │   EC2    │───►│  ┌─────────────────┐   │   │
│  │  (App)   │    │  │  Primary Node   │   │   │
│  │          │    │  └────────┬────────┘   │   │
│  └──────────┘    │           │ Replication │   │
│                  │  ┌────────▼────────┐   │   │
│                  │  │  Replica Node   │   │   │
│                  │  └─────────────────┘   │   │
│                  └─────────────────────────┘   │
│                                                 │
│  ┌──────────┐                                  │
│  │   RDS    │ ← Source of truth                │
│  └──────────┘                                  │
└─────────────────────────────────────────────────┘
```

---

# HANDS-ON LABS

---

## LAB 1: Create ElastiCache Redis Cluster (Console)

### Step 1: Create Security Group for ElastiCache

1. Go to **EC2 Console** → **Security Groups** → **Create Security Group**

```
Name:           elasticache-sg
Description:    Security group for ElastiCache Redis
VPC:            Default VPC

Inbound Rules:
  Type:         Custom TCP
  Port:         6379
  Source:       your-ec2-security-group (or 0.0.0.0/0 for testing)
```

2. Click **Create Security Group**

---

### Step 2: Create ElastiCache Subnet Group

1. Go to **ElastiCache Console**
2. Left menu → **Subnet Groups** → **Create Subnet Group**

```
Name:           my-cache-subnet-group
Description:    Subnet group for ElastiCache
VPC:            Default VPC
Subnets:        Select ALL available subnets
```

3. Click **Create**

---

### Step 3: Create Redis Cluster

1. ElastiCache Console → **Redis clusters** → **Create Redis cluster**

```
Cluster Mode:        Disabled (for learning)
Name:                my-redis-cluster
Description:         Learning ElastiCache Redis

Engine Version:      7.x (latest)
Port:                6379
Parameter Group:     default.redis7

Node Type:           cache.t3.micro (Free tier eligible)
Number of Replicas:  0 (for learning, save cost)

Subnet Group:        my-cache-subnet-group
Security Groups:     elasticache-sg

Automatic Backups:   Disabled (for learning)
```

2. Click **Create** → Wait 5-10 minutes

---

### Step 4: Note the Endpoint

```
After cluster is available:
Cluster Details → Primary Endpoint

Example:
my-redis-cluster.xxxxxx.0001.use1.cache.amazonaws.com:6379
                  ↑ Note this endpoint
```

---

## LAB 2: Connect to Redis from EC2

### Step 1: Launch EC2 Instance

1. Launch **Amazon Linux 2023** EC2 instance
2. Attach a **Security Group** that is allowed in ElastiCache SG (port 6379)
3. Use **EC2 Instance Connect** to connect

---

### Step 2: Install Redis CLI on EC2

```bash
# Connect via EC2 Instance Connect, then run:

# Update packages
sudo dnf update -y

# Install Redis CLI
sudo dnf install -y redis6

# Verify installation
redis-cli --version
```

---

### Step 3: Connect to ElastiCache Redis

```bash
# Replace with YOUR endpoint from Step 4 above
REDIS_ENDPOINT="my-redis-cluster.xxxxxx.0001.use1.cache.amazonaws.com"

# Connect to Redis
redis-cli -h $REDIS_ENDPOINT -p 6379

# You should see:
# my-redis-cluster.xxxxxx.0001.use1.cache.amazonaws.com:6379>
```

---

### Step 4: Basic Redis Commands Practice

```bash
# ============ STRING COMMANDS ============

# Set a simple key-value
SET username "JohnDoe"

# Get value
GET username
# Output: "JohnDoe"

# Set with expiry (TTL = 30 seconds)
SET session:user123 "logged_in" EX 30

# Check TTL (Time To Live)
TTL session:user123
# Output: 29 (counting down)

# Set only if NOT exists
SETNX unique_key "value1"
SETNX unique_key "value2"   # Won't overwrite!
GET unique_key
# Output: "value1"

# Increment counter (perfect for rate limiting)
SET page_views 0
INCR page_views
INCR page_views
INCR page_views
GET page_views
# Output: "3"

# ============ HASH COMMANDS ============
# Perfect for storing objects/user profiles

HSET user:1 name "Alice" age "30" city "New York"
HGET user:1 name
# Output: "Alice"

HGETALL user:1
# Output: all fields and values

HMSET user:2 name "Bob" age "25" city "London"
HGETALL user:2

# ============ LIST COMMANDS ============
# Perfect for queues, activity feeds

# Push to list
LPUSH activity:feed "User logged in"
LPUSH activity:feed "User viewed product"
LPUSH activity:feed "User added to cart"

# Get all items
LRANGE activity:feed 0 -1
# Output: last pushed items first

# Queue (FIFO) - push left, pop right
RPUSH queue:jobs "job1"
RPUSH queue:jobs "job2"
RPUSH queue:jobs "job3"
LPOP queue:jobs
# Output: "job1" (First In, First Out)

# ============ SET COMMANDS ============
# Unique collections - no duplicates

SADD online:users "user1" "user2" "user3" "user1"  # user1 won't duplicate
SMEMBERS online:users
SCARD online:users    # Count members

# Check membership
SISMEMBER online:users "user1"
# Output: 1 (true)

# ============ SORTED SET ============
# Perfect for LEADERBOARDS!

ZADD leaderboard 1000 "Alice"
ZADD leaderboard 850 "Bob"
ZADD leaderboard 1200 "Charlie"
ZADD leaderboard 950 "Diana"

# Get top players (highest score first)
ZREVRANGE leaderboard 0 -1 WITHSCORES

# Get rank
ZREVRANK leaderboard "Alice"
# Output: 1 (0-based, so Alice is #2)

# ============ EXPIRY COMMANDS ============

SET temp_data "expires soon"
EXPIRE temp_data 10     # Expires in 10 seconds
TTL temp_data           # Check remaining time
PERSIST temp_data       # Remove expiry

# ============ UTILITY COMMANDS ============

# List all keys
KEYS *

# Delete keys
DEL username

# Check if key exists
EXISTS username

# Get key type
TYPE leaderboard

# Server info
INFO server
INFO memory
INFO stats
```

---

## LAB 3: Simulate Caching Pattern (Python)

### Install Python Redis Library

```bash
# On EC2 instance
sudo dnf install -y python3-pip
pip3 install redis
```

### Create Cache-Aside Pattern Demo

```bash
# Create the Python file
cat > cache_demo.py << 'EOF'
import redis
import time
import json
import random

# ======================================
# Configuration
# ======================================
REDIS_ENDPOINT = "YOUR-ELASTICACHE-ENDPOINT-HERE"
REDIS_PORT = 6379

# Connect to ElastiCache
cache = redis.Redis(
    host=REDIS_ENDPOINT,
    port=REDIS_PORT,
    decode_responses=True
)

# ======================================
# Simulated Database (slow)
# ======================================
FAKE_DATABASE = {
    "1": {"id": "1", "name": "Alice", "email": "alice@example.com", "score": 1500},
    "2": {"id": "2", "name": "Bob",   "email": "bob@example.com",   "score": 1200},
    "3": {"id": "3", "name": "Charlie","email":"charlie@example.com","score": 1800},
}

def get_user_from_db(user_id):
    """Simulate slow database query"""
    print(f"  🗄️  Hitting DATABASE for user {user_id}...")
    time.sleep(0.5)  # Simulate DB latency
    return FAKE_DATABASE.get(user_id)

# ======================================
# PATTERN 1: Cache-Aside (Lazy Loading)
# ======================================
def get_user(user_id):
    """
    Cache-Aside Pattern:
    1. Check cache first
    2. If miss, get from DB
    3. Store in cache for next time
    """
    cache_key = f"user:{user_id}"

    # Step 1: Check Cache
    cached_data = cache.get(cache_key)

    if cached_data:
        print(f"  ✅ CACHE HIT for user {user_id}")
        return json.loads(cached_data)

    # Step 2: Cache Miss - Go to Database
    print(f"  ❌ CACHE MISS for user {user_id}")
    user_data = get_user_from_db(user_id)

    if user_data:
        # Step 3: Store in Cache (TTL = 60 seconds)
        cache.setex(cache_key, 60, json.dumps(user_data))
        print(f"  💾 Stored in cache with 60s TTL")

    return user_data

# ======================================
# PATTERN 2: Session Storage
# ======================================
def create_session(user_id):
    session_id = f"sess_{random.randint(10000, 99999)}"
    session_data = {
        "user_id": user_id,
        "logged_in_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "expires": "30 minutes"
    }
    # Store session for 30 minutes
    cache.setex(f"session:{session_id}", 1800, json.dumps(session_data))
    return session_id

def get_session(session_id):
    data = cache.get(f"session:{session_id}")
    return json.loads(data) if data else None

# ======================================
# PATTERN 3: Rate Limiting
# ======================================
def check_rate_limit(user_id, max_requests=5, window_seconds=60):
    key = f"ratelimit:{user_id}"
    current = cache.get(key)

    if current is None:
        cache.setex(key, window_seconds, 1)
        remaining = max_requests - 1
    else:
        count = int(current)
        if count >= max_requests:
            ttl = cache.ttl(key)
            return False, 0, ttl
        cache.incr(key)
        remaining = max_requests - count - 1

    return True, remaining, cache.ttl(key)

# ======================================
# PATTERN 4: Leaderboard
# ======================================
def update_leaderboard(username, score):
    cache.zadd("game:leaderboard", {username: score})

def get_top_players(n=5):
    return cache.zrevrange("game:leaderboard", 0, n-1, withscores=True)

# ======================================
# RUN DEMO
# ======================================
print("=" * 50)
print("  AWS ElastiCache Redis Demo")
print("=" * 50)

# Test connection
cache.ping()
print("✅ Connected to ElastiCache Redis!\n")

# --- Demo 1: Cache-Aside ---
print("📌 DEMO 1: Cache-Aside Pattern")
print("-" * 40)

for attempt in range(3):
    print(f"\n[Attempt {attempt+1}] Fetching user 1:")
    start = time.time()
    user = get_user("1")
    elapsed = time.time() - start
    print(f"  👤 Got: {user['name']}")
    print(f"  ⏱️  Time: {elapsed:.3f}s")

# --- Demo 2: Session Storage ---
print("\n\n📌 DEMO 2: Session Storage")
print("-" * 40)

session_id = create_session("user_123")
print(f"Created session: {session_id}")

session = get_session(session_id)
print(f"Session data: {json.dumps(session, indent=2)}")
print(f"TTL: {cache.ttl(f'session:{session_id}')} seconds")

# --- Demo 3: Rate Limiting ---
print("\n\n📌 DEMO 3: Rate Limiting (5 requests/minute)")
print("-" * 40)

for i in range(7):
    allowed, remaining, ttl = check_rate_limit("user_456", max_requests=5)
    if allowed:
        print(f"Request {i+1}: ✅ ALLOWED | Remaining: {remaining}")
    else:
        print(f"Request {i+1}: 🚫 BLOCKED | Try again in {ttl}s")

# --- Demo 4: Leaderboard ---
print("\n\n📌 DEMO 4: Real-time Leaderboard")
print("-" * 40)

players = [
    ("Alice", 1500), ("Bob", 1200), ("Charlie", 1800),
    ("Diana", 950), ("Eve", 2100), ("Frank", 1650)
]

for player, score in players:
    update_leaderboard(player, score)

print("🏆 Top 5 Leaderboard:")
top_players = get_top_players(5)
for rank, (player, score) in enumerate(top_players, 1):
    print(f"  #{rank} {player}: {int(score)} points")

# --- Summary ---
print("\n\n📊 Cache Statistics:")
print("-" * 40)
info = cache.info("stats")
print(f"  Total commands processed: {info['total_commands_processed']}")
print(f"  Cache hits:   {info['keyspace_hits']}")
print(f"  Cache misses: {info['keyspace_misses']}")

hits = info['keyspace_hits']
misses = info['keyspace_misses']
if hits + misses > 0:
    hit_rate = (hits / (hits + misses)) * 100
    print(f"  Hit Rate: {hit_rate:.1f}%")

print("\n✅ Demo Complete!")
EOF

# Edit the endpoint in the file
nano cache_demo.py
# Replace YOUR-ELASTICACHE-ENDPOINT-HERE with actual endpoint

# Run the demo
python3 cache_demo.py
```

---

## LAB 4: Monitor ElastiCache (Console)

### View CloudWatch Metrics

1. Go to **ElastiCache Console** → Your Cluster → **Metrics** tab

```
Key Metrics to Watch:
┌────────────────────────┬──────────────────────────────────────┐
│ Metric                 │ What it means                        │
├────────────────────────┼──────────────────────────────────────┤
│ CacheHits              │ Requests served from cache           │
│ CacheMisses            │ Requests that went to DB             │
│ CacheHitRate           │ % of requests served from cache      │
│ CurrConnections        │ Number of active connections         │
│ DatabaseMemoryUsage%   │ Memory used (alert if > 80%)         │
│ CPUUtilization         │ CPU usage of cache node              │
│ NetworkBytesIn/Out     │ Data transfer                        │
│ Evictions              │ Keys removed due to memory pressure  │
└────────────────────────┴──────────────────────────────────────┘
```

---

### Set Up CloudWatch Alarm

1. **CloudWatch Console** → **Alarms** → **Create Alarm**

```
Metric:     ElastiCache → Per-Cache Metrics → DatabaseMemoryUsagePercentage
Cluster:    my-redis-cluster

Conditions:
  Threshold:  Greater than 80 (%)
  Period:     5 minutes

Actions:
  Create SNS topic: elasticache-alerts
  Email: your@email.com

Alarm Name: ElastiCache-High-Memory
```

---

## LAB 5: ElastiCache Memcached (Console)

### Create Memcached Cluster

1. ElastiCache Console → **Memcached clusters** → **Create**

```
Name:           my-memcached
Engine:         Memcached
Version:        1.6.x

Node Type:      cache.t3.micro
Number of Nodes: 1

Subnet Group:   my-cache-subnet-group
Security Group: elasticache-sg
```

### Test Memcached from EC2

```bash
# Install Memcached client
sudo dnf install -y nc  # netcat

# Connect and test using telnet protocol
MEMCACHED_ENDPOINT="your-memcached-endpoint"

# Test with basic commands via netcat
echo -e "set mykey 0 60 5\r\nhello\r\nquit\r\n" | nc $MEMCACHED_ENDPOINT 11211

# Install Python memcache
pip3 install pymemcache

# Quick Python test
python3 << 'PYEOF'
from pymemcache.client import base

client = base.Client(('YOUR-MEMCACHED-ENDPOINT', 11211))

# Set value
client.set('name', 'AWS ElastiCache')

# Get value
result = client.get('name')
print(f"Got from Memcached: {result.decode()}")

# Set with expiry
client.set('temp', 'expires soon', expire=30)

# Delete
client.delete('name')
print("Deleted key")

print("Memcached test complete!")
PYEOF
```

---

## Key Differences Summary

```
ElastiCache Redis:
├── Port: 6379
├── Best for: Sessions, Leaderboards, Pub/Sub, Complex data
├── Persistence: Yes (can survive restart)
├── Multi-AZ: Yes (with replica)
└── Data types: Strings, Hashes, Lists, Sets, Sorted Sets

ElastiCache Memcached:
├── Port: 11211
├── Best for: Simple caching, High throughput
├── Persistence: No (data lost on restart)
├── Multi-AZ: No
└── Data types: Strings only
```

---

## Cost Cleanup ⚠️

```
To avoid charges - DELETE after learning:

1. ElastiCache Console
   → Select your clusters
   → Actions → Delete
   → Uncheck "Create final backup"
   → Confirm DELETE

2. Delete Subnet Group
   → Subnet Groups → Select → Delete

3. Delete Security Group
   → EC2 → Security Groups → Delete

4. Terminate EC2 instance
```

---

## ElastiCache Exam Tips (AWS Certified)

```
Remember:
✅ ElastiCache = In-memory caching (not a database replacement)
✅ Redis supports persistence, Memcached does NOT
✅ Redis supports Multi-AZ with automatic failover
✅ Use Redis for sessions, leaderboards, pub/sub
✅ ElastiCache lives inside your VPC (not public internet)
✅ Can NOT be accessed from outside VPC without special config
✅ Cache-Aside (Lazy Loading) = Most common caching pattern
✅ Write-Through = Update cache when DB updates (no stale data)
✅ TTL = Always set TTL to prevent stale data
```

---

## What You Learned

```
✅ What ElastiCache is and why it matters
✅ Redis vs Memcached differences
✅ Created ElastiCache Redis cluster
✅ Connected from EC2 and ran Redis commands
✅ Implemented 4 real caching patterns:
   - Cache-Aside (most common)
   - Session Storage
   - Rate Limiting
   - Leaderboards
✅ Monitored with CloudWatch
✅ Tested Memcached cluster
✅ Cost cleanup
```