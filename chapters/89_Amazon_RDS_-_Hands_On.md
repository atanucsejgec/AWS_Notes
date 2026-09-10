# Amazon RDS (Relational Database Service)

## 📚 What is Amazon RDS?

Amazon RDS is a **managed relational database service** that makes it easy to set up, operate, and scale databases in the cloud.

---

## 🤔 Why is RDS Important?

### Without RDS (Self-managed on EC2):
```
You manage EVERYTHING:
❌ Install database software
❌ Patch & update OS
❌ Configure backups manually
❌ Set up high availability yourself
❌ Handle hardware failures
❌ Monitor performance
❌ Scale manually
```

### With RDS (AWS Managed):
```
AWS manages for you:
✅ Automated backups
✅ Software patching
✅ High availability (Multi-AZ)
✅ Read replicas for scaling
✅ Monitoring & alerts
✅ Storage auto-scaling
✅ Security & encryption
```

---

## 🗄️ Supported Database Engines

| Engine | Use Case |
|--------|----------|
| **MySQL** | Web apps, WordPress |
| **PostgreSQL** | Complex queries, JSON |
| **MariaDB** | MySQL alternative |
| **Oracle** | Enterprise apps |
| **SQL Server** | Microsoft ecosystem |
| **Aurora** | AWS optimized (MySQL/PostgreSQL compatible) |

---

## 🏗️ RDS Architecture

```
                    ┌─────────────────────────────┐
                    │         Your VPC            │
                    │                             │
   ┌──────────┐    │  ┌──────────┐               │
   │  Users/  │────│──│   EC2    │               │
   │   App    │    │  │(App Server│               │
   └──────────┘    │  └────┬─────┘               │
                    │       │                      │
                    │       ▼                      │
                    │  ┌─────────────────────┐    │
                    │  │    RDS Instance      │    │
                    │  │  ┌───────────────┐  │    │
                    │  │  │  Primary DB   │  │    │
                    │  │  │  (AZ-1a)      │  │    │
                    │  │  └───────┬───────┘  │    │
                    │  │          │ sync      │    │
                    │  │  ┌───────▼───────┐  │    │
                    │  │  │  Standby DB   │  │    │
                    │  │  │  (AZ-1b)      │  │    │
                    │  │  └───────────────┘  │    │
                    │  │   Multi-AZ Setup    │    │
                    │  └─────────────────────┘    │
                    └─────────────────────────────┘
```

---

## 🛠️ HANDS-ON LABS

---

## Lab 1: Create Your First RDS MySQL Database (Console Only)

### Step 1: Create Security Group for RDS

1. Go to **EC2 Console** → **Security Groups** → **Create Security Group**

```
Name:           rds-mysql-sg
Description:    Security group for RDS MySQL
VPC:            Default VPC

Inbound Rules:
  Type:         MySQL/Aurora
  Protocol:     TCP
  Port:         3306
  Source:       0.0.0.0/0  (for learning only!)
  
  ⚠️  In Production: restrict to your app server's security group
```

2. Click **Create Security Group**

---

### Step 2: Create RDS Subnet Group

1. Go to **RDS Console** → **Subnet Groups** → **Create DB Subnet Group**

```
Name:           my-rds-subnet-group
Description:    Subnet group for RDS
VPC:            Default VPC

Add Subnets:
  Select ALL availability zones
  Select ALL subnets in each AZ
```

2. Click **Create**

---

### Step 3: Create RDS MySQL Instance

1. Go to **RDS Console** → **Databases** → **Create Database**

```
┌─────────────────────────────────────────┐
│         CREATION METHOD                 │
│  ○ Standard create/Full configuration  ← SELECT THIS      │
│  ○ Easy create                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           ENGINE OPTIONS                │
│  Engine: MySQL                          │
│  Version: MySQL 8.0.x (latest)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            TEMPLATES                    │
│  ○ Production                           │
│  ○ Dev/Test                             │
│  ● Free tier  ← SELECT THIS            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           SETTINGS                      │
│  DB Instance ID:  my-first-rds          │
│  Master Username: admin                 │
│  Password:        YourPassword123!      │
│  Confirm Password: YourPassword123!     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       INSTANCE CONFIGURATION            │
│  Class: db.t3.micro (free tier)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│             STORAGE                     │
│  Type:          gp2                     │
│  Size:          20 GB                   │
│  Auto scaling:  ✓ Enable               │
│  Max storage:   100 GB                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           CONNECTIVITY                  │
│  VPC:              Default VPC          │
│  Subnet Group:     my-rds-subnet-group  │
│  Public Access:    YES (for learning)  │
│  Security Group:   rds-mysql-sg         │
│  AZ:               No preference        │
│  Port:             3306                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         DATABASE AUTHENTICATION         │
│  ● Password authentication             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         ADDITIONAL CONFIGURATION        │
│  Initial DB name:    myappdb            │
│  Backup retention:   7 days            │
│  Backup window:      No preference      │
│  Monitoring:         ✓ Enable          │
│  Maintenance:        No preference      │
└─────────────────────────────────────────┘
```

2. Click **Create Database**

⏳ **Wait 5-10 minutes** for the instance to become **Available**

---

### Step 4: Get Your RDS Endpoint

1. Click on your database **my-first-rds**
2. Go to **Connectivity & Security** tab
3. Copy the **Endpoint**

```
Example endpoint:
my-first-rds.xxxxxxxxxx.us-east-1.rds.amazonaws.com
```

---

## Lab 2: Connect to RDS & Create Tables (Using EC2 Instance Connect)

### Step 1: Launch EC2 Instance (if you don't have one)

```
Go to EC2 Console → Launch Instance

Name:     rds-client
AMI:      Amazon Linux 2023
Type:     t2.micro
Key Pair: Proceed without (using EC2 Instance Connect)

Security Group:
  - Allow SSH (port 22) from anywhere
  - Allow all outbound traffic
```

### Step 2: Update EC2 Security Group to Allow RDS Access

**Better approach** - Update RDS security group:

```
Go to Security Groups → rds-mysql-sg → Edit Inbound Rules

Change Source from 0.0.0.0/0 to:
  Source: [EC2 Security Group ID]
  
This way ONLY your EC2 can talk to RDS ✅
```

### Step 3: Connect via EC2 Instance Connect

Go to **EC2 Console** → Select your EC2 → **Connect** → **EC2 Instance Connect**

### Step 4: Install MySQL Client & Connect

```bash
# Update packages
sudo dnf update -y

# Install MySQL client
sudo dnf install mariadb105

sudo dnf install mysql -y

# Verify installation
mysql --version

# Connect to RDS
mysql -h my-first-rds.cgnm0w4ueu3p.us-east-1.rds.amazonaws.com -P 3306 -u admin -p

mysql -h YOUR-RDS-ENDPOINT \
      -u admin \
      -p \
      --port 3306

# Enter password when prompted: YourPassword123!
```

### Step 5: Work with Your Database

```sql
-- Show all databases
SHOW DATABASES;

/*
Output:
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myappdb            |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
*/

-- Use your database
USE myappdb;

-- Create a Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email) VALUES
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com'),
    ('bob_wilson', 'bob@example.com');

INSERT INTO products (name, price, stock) VALUES
    ('Laptop', 999.99, 50),
    ('Mouse', 29.99, 200),
    ('Keyboard', 79.99, 150);

-- Query the data
SELECT * FROM users;
SELECT * FROM products;

-- Join query
SELECT 
    u.username,
    u.email,
    u.created_at as joined_date
FROM users u
ORDER BY u.created_at DESC;

-- Exit MySQL
EXIT;
```

---

## Lab 3: RDS Automated Backups & Snapshots (Console Only)

### Manual Snapshot

1. Go to **RDS Console** → **Databases**
2. Select **my-first-rds**
3. Click **Actions** → **Take Snapshot**

```
Snapshot Name: my-rds-manual-snapshot-v1
```

4. Click **Take Snapshot**

### Restore from Snapshot

1. Go to **RDS Console** → **Snapshots**
2. Select your snapshot
3. Click **Actions** → **Restore Snapshot**

```
DB Instance ID: my-restored-rds
Instance class: db.t3.micro
```

4. Click **Restore DB Instance**

---

## Lab 4: Enable Multi-AZ (High Availability) - Console Only

1. Go to **RDS Console** → Select **my-first-rds**
2. Click **Modify**

```
Multi-AZ Deployment:
  ● Create a standby instance (recommended for production)
```

3. Click **Continue**

```
Scheduling:
  ○ Apply during next scheduled maintenance window
  ● Apply immediately  ← SELECT FOR LAB
```

4. Click **Modify DB Instance**

```
What happens:
┌─────────────────────────────────────┐
│          AZ: us-east-1a            │
│  ┌─────────────────────────────┐   │
│  │  PRIMARY DB (Read + Write)  │   │
│  └─────────────┬───────────────┘   │
│                │                    │
│         Synchronous                 │
│         Replication                 │
│                │                    │
│          AZ: us-east-1b            │
│  ┌─────────────▼───────────────┐   │
│  │  STANDBY DB (automatic      │   │
│  │  failover if primary fails) │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Lab 5: Create Read Replica (Console Only)

Read Replicas help with **READ HEAVY** applications

1. Go to **RDS Console** → Select **my-first-rds**
2. Click **Actions** → **Create Read Replica**

```
DB Instance ID:    my-rds-read-replica
Region:            Same region (or cross-region)
Instance class:    db.t3.micro
Storage:           20 GB
Public Access:     Yes
```

3. Click **Create Read Replica**

```
Architecture with Read Replica:
                    
  Write Operations        Read Operations
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│   PRIMARY   │────────▶│    READ     │
│  (Primary)  │ Async   │   REPLICA   │
│  Read+Write │ Repl.   │  Read Only  │
└─────────────┘         └─────────────┘

Use case: Reports, Analytics, Heavy reads
```

---

## Lab 6: RDS Parameter Groups (Console Only)

Parameter Groups let you customize database settings

1. Go to **RDS Console** → **Parameter Groups** → **Create Parameter Group**

```
Parameter Group Family: mysql8.0
Type:                   DB Parameter Group
Group Name:             my-mysql-params
Description:            Custom MySQL parameters
```

2. Click **Create**

3. Click on **my-mysql-params** → **Edit Parameters**

```
Common parameters to modify:

max_connections     → 200  (default varies by instance size)
slow_query_log      → 1    (enable slow query logging)
long_query_time     → 2    (log queries taking > 2 seconds)
innodb_buffer_pool_size → {DBInstanceClassMemory*3/4}
```

4. **Save Changes**

5. Attach to your RDS instance:
   - Select your RDS → **Modify**
   - Under **Database Options** → **DB Parameter Group** → Select **my-mysql-params**
   - Click **Continue** → **Apply Immediately** → **Modify**

---

## Lab 7: RDS Monitoring & Alerts (Console Only)

### Enable Enhanced Monitoring

1. Select your RDS → **Modify**

```
Monitoring:
  ✓ Enable Enhanced Monitoring
  Granularity: 60 seconds
  IAM Role: Default (auto-create)
```

### Set CloudWatch Alarms

1. Go to **CloudWatch** → **Alarms** → **Create Alarm**
2. Click **Select Metric** → **RDS** → **Per-Database Metrics**

```
Common RDS Alarms to Create:

┌──────────────────┬────────────────┬──────────────────┐
│ Metric           │ Threshold      │ Meaning          │
├──────────────────┼────────────────┼──────────────────┤
│ CPUUtilization   │ > 80%          │ DB overloaded    │
│ FreeStorageSpace │ < 2GB          │ Running out disk │
│ DatabaseConns    │ > 100          │ Too many conns   │
│ ReadLatency      │ > 0.2 seconds  │ Slow reads       │
│ WriteLatency     │ > 0.2 seconds  │ Slow writes      │
└──────────────────┴────────────────┴──────────────────┘
```

---

## 🔑 RDS Key Concepts Summary

```
┌─────────────────────────────────────────────────────┐
│                  RDS CONCEPTS                       │
├─────────────────┬───────────────────────────────────┤
│ Concept         │ What it does                      │
├─────────────────┼───────────────────────────────────┤
│ Multi-AZ        │ Standby in another AZ             │
│                 │ Automatic failover                │
│                 │ High Availability                 │
├─────────────────┼───────────────────────────────────┤
│ Read Replica    │ Copy for READ operations          │
│                 │ Reduce PRIMARY load               │
│                 │ Can be in another region          │
├─────────────────┼───────────────────────────────────┤
│ Snapshots       │ Manual backup (you control)       │
│                 │ Stored until you delete           │
├─────────────────┼───────────────────────────────────┤
│ Auto Backup     │ Daily automated backup            │
│                 │ 1-35 days retention               │
│                 │ Point-in-time recovery            │
├─────────────────┼───────────────────────────────────┤
│ Encryption      │ At rest (KMS keys)                │
│                 │ In transit (SSL/TLS)              │
├─────────────────┼───────────────────────────────────┤
│ Parameter Group │ Database configuration settings   │
├─────────────────┼───────────────────────────────────┤
│ Subnet Group    │ Which subnets RDS can use         │
└─────────────────┴───────────────────────────────────┘
```

---

## 💰 Cost Tips

```
FREE TIER (12 months):
  ✅ db.t3.micro - 750 hours/month
  ✅ 20 GB storage
  ✅ 20 GB backup storage

SAVE MONEY:
  💡 Stop RDS when not using (stops for 7 days max)
  💡 Use Reserved Instances for production (save 40-60%)
  💡 Right-size your instance class
  💡 Delete unused snapshots
```

---

## 🧹 Cleanup (Important to Avoid Charges!)

1. Go to **RDS Console** → **Databases**
2. Select **my-first-rds** → **Actions** → **Delete**

```
Delete options:
  Create final snapshot: NO (for learning)
  ☑ I acknowledge that...
  
Type: delete
```

3. Also delete:
   - Read Replica (delete first before primary)
   - Any other snapshots
   - Subnet groups

---

## 🎯 What You Learned

```
✅ What RDS is and why it's better than self-managed DB
✅ Create RDS MySQL instance from console
✅ Connect from EC2 using MySQL client
✅ Create tables and query data
✅ Manual snapshots & restore
✅ Multi-AZ for High Availability
✅ Read Replicas for performance
✅ Parameter Groups for configuration
✅ Monitoring with CloudWatch
```

---

## 🚀 Next Steps After RDS

```
1. Amazon Aurora     → AWS's own high-performance DB
2. DynamoDB          → NoSQL database
3. ElastiCache       → In-memory caching (Redis/Memcached)
4. RDS Proxy         → Connection pooling for RDS
5. AWS Secrets Manager → Store DB credentials securely
```