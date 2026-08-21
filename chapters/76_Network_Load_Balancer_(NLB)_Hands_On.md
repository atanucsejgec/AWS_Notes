# Network Load Balancer (NLB) - Complete Guide

## 🤔 Why NLB is Important?

### NLB vs ALB - Key Differences

| Feature | NLB | ALB |
|---------|-----|-----|
| **Layer** | Layer 4 (Transport) | Layer 7 (Application) |
| **Protocol** | TCP, UDP, TLS | HTTP, HTTPS |
| **Performance** | Ultra-high (millions req/sec) | High |
| **Latency** | ~100ms | ~400ms |
| **Static IP** | ✅ Yes (per AZ) | ❌ No |
| **Elastic IP** | ✅ Supported | ❌ Not supported |
| **Source IP Preservation** | ✅ Yes | ❌ No (needs X-Forwarded-For) |
| **WebSocket** | ✅ Native | ✅ Supported |
| **Price** | Higher | Lower |

### Real World Use Cases
```
✅ Gaming servers (UDP protocol)
✅ IoT applications  
✅ Financial trading (ultra-low latency)
✅ When you need STATIC IP for whitelist/firewall rules
✅ TCP/UDP load balancing
✅ When client needs to see server's real IP
```

---

## 🏗️ Architecture We Will Build

```
                    ┌─────────────────────────────────────┐
                    │           Your Browser               │
                    └──────────────┬──────────────────────┘
                                   │ HTTP Request
                                   ▼
                    ┌─────────────────────────────────────┐
                    │    Network Load Balancer             │
                    │    (Static IP per AZ)               │
                    │    Port 80 → Target Group           │
                    └──────────┬──────────┬───────────────┘
                               │          │
                    ┌──────────▼──┐  ┌────▼────────┐
                    │  EC2 Web-1  │  │  EC2 Web-2  │
                    │ (AZ: us-    │  │ (AZ: us-    │
                    │  east-1a)  │  │  east-1b)  │
                    └─────────────┘  └─────────────┘
```

---

## 📋 Prerequisites

```
✅ AWS Account
✅ Default VPC available
✅ Basic AWS Console knowledge
```

---

## 🚀 HANDS-ON LAB

---

### STEP 1: Create Security Groups

#### 1.1 - Security Group for EC2 Instances

```
Console: EC2 → Security Groups → Create Security Group
```

```
Name:           nlb-ec2-sg
Description:    Security group for NLB backend EC2 instances
VPC:            Default VPC

Inbound Rules:
┌─────────┬──────────┬───────────┬─────────────────────────────┐
│  Type   │ Protocol │   Port    │          Source             │
├─────────┼──────────┼───────────┼─────────────────────────────┤
│  HTTP   │   TCP    │    80     │    0.0.0.0/0                │
│  SSH    │   TCP    │    22     │    My IP (your IP)          │
└─────────┴──────────┴───────────┴─────────────────────────────┘

⚠️  NLB IMPORTANT NOTE:
    NLB does NOT have its own Security Group!
    Traffic comes from NLB with CLIENT's original IP
    So EC2 must allow 0.0.0.0/0 on port 80
    (unlike ALB where you allow ALB security group)

Outbound Rules:
└── All traffic → 0.0.0.0/0 (default)

→ Click "Create Security Group"
```

---

### STEP 2: Launch EC2 Instances

#### 2.1 - Launch EC2 Instance 1 (Web Server 1)

```
Console: EC2 → Instances → Launch Instance
```

```yaml
Name: NLB-Web-Server-1
AMI: Amazon Linux 2023 (Free Tier)
Instance Type: t2.micro (Free Tier)
Key Pair: Create new → "nlb-keypair" → Download .pem

Network Settings:
  VPC: Default VPC
  Subnet: us-east-1a  ← Important! Choose specific AZ
  Auto-assign Public IP: Enable
  Security Group: nlb-ec2-sg (select existing)

Advanced Details → User Data:
```

```bash
#!/bin/bash
# Update system
yum update -y

# Install web server
yum install -y httpd

# Start and enable Apache
systemctl start httpd
systemctl enable httpd

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>NLB Demo - Server 1</title>
    <style>
        body { 
            font-family: Arial; 
            background-color: #1a1a2e; 
            color: white; 
            text-align: center; 
            padding: 50px; 
        }
        .card { 
            background: #16213e; 
            border-radius: 10px; 
            padding: 30px; 
            max-width: 600px; 
            margin: 0 auto; 
            border: 2px solid #0f3460;
        }
        .server { color: #e94560; font-size: 2em; font-weight: bold; }
        .info { background: #0f3460; padding: 10px; margin: 10px; border-radius: 5px; }
        .highlight { color: #00ff88; }
    </style>
</head>
<body>
    <div class="card">
        <div class="server">🖥️ SERVER 1</div>
        <h2>Network Load Balancer Demo</h2>
        <div class="info"><b>Instance ID:</b> <span class="highlight">$INSTANCE_ID</span></div>
        <div class="info"><b>Availability Zone:</b> <span class="highlight">$AZ</span></div>
        <div class="info"><b>Private IP:</b> <span class="highlight">$PRIVATE_IP</span></div>
        <div class="info"><b>Public IP:</b> <span class="highlight">$PUBLIC_IP</span></div>
        <div class="info"><b>Server Color:</b> <span style="color:#e94560">🔴 RED SERVER</span></div>
    </div>
</body>
</html>
EOF

echo "Web Server 1 setup complete!" >> /var/log/setup.log
```

```
→ Click "Launch Instance"
```

#### 2.2 - Launch EC2 Instance 2 (Web Server 2)

```
Console: EC2 → Instances → Launch Instance
```

```yaml
Name: NLB-Web-Server-2
AMI: Amazon Linux 2023 (Free Tier)
Instance Type: t2.micro (Free Tier)
Key Pair: nlb-keypair (use same key)

Network Settings:
  VPC: Default VPC
  Subnet: us-east-1b  ← Different AZ!
  Auto-assign Public IP: Enable
  Security Group: nlb-ec2-sg (select existing)

Advanced Details → User Data:
```

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>NLB Demo - Server 2</title>
    <style>
        body { 
            font-family: Arial; 
            background-color: #0d1b2a; 
            color: white; 
            text-align: center; 
            padding: 50px; 
        }
        .card { 
            background: #1b2838; 
            border-radius: 10px; 
            padding: 30px; 
            max-width: 600px; 
            margin: 0 auto; 
            border: 2px solid #2a475e;
        }
        .server { color: #00b4d8; font-size: 2em; font-weight: bold; }
        .info { background: #2a475e; padding: 10px; margin: 10px; border-radius: 5px; }
        .highlight { color: #00ff88; }
    </style>
</head>
<body>
    <div class="card">
        <div class="server">🖥️ SERVER 2</div>
        <h2>Network Load Balancer Demo</h2>
        <div class="info"><b>Instance ID:</b> <span class="highlight">$INSTANCE_ID</span></div>
        <div class="info"><b>Availability Zone:</b> <span class="highlight">$AZ</span></div>
        <div class="info"><b>Private IP:</b> <span class="highlight">$PRIVATE_IP</span></div>
        <div class="info"><b>Public IP:</b> <span class="highlight">$PUBLIC_IP</span></div>
        <div class="info"><b>Server Color:</b> <span style="color:#00b4d8">🔵 BLUE SERVER</span></div>
    </div>
</body>
</html>
EOF

echo "Web Server 2 setup complete!" >> /var/log/setup.log
```

```
→ Click "Launch Instance"
```

#### 2.3 - Verify Both Instances Running

```
Console: EC2 → Instances

Wait until both show:
✅ Instance State: Running
✅ Status Checks: 2/2 checks passed (takes 2-3 min)

Test each instance directly:
→ Copy Public IP of each instance
→ Open browser: http://<public-ip>
→ You should see Server 1 (Red) and Server 2 (Blue)
```

---

### STEP 3: Create Target Group

```
Console: EC2 → Target Groups → Create Target Group
```

```yaml
Step 1 - Basic Configuration:
  Target Type: Instances  ← Select this
  Target Group Name: nlb-target-group
  Protocol: TCP          ← NLB uses TCP (not HTTP like ALB!)
  Port: 80
  VPC: Default VPC
  
  Health Checks:
    Protocol: TCP        ← Simple TCP health check
    
  Advanced Health Check Settings:
    Healthy Threshold: 3
    Unhealthy Threshold: 3
    Timeout: 10 seconds
    Interval: 30 seconds

→ Click "Next"

Step 2 - Register Targets:
  Available Instances:
  ✅ Select NLB-Web-Server-1 → Port: 80
  ✅ Select NLB-Web-Server-2 → Port: 80
  
  → Click "Include as pending below"
  → Review targets appear in bottom section

→ Click "Create Target Group"
```

---

### STEP 4: Create Network Load Balancer

```
Console: EC2 → Load Balancers → Create Load Balancer
```

```yaml
Step 1 - Select LB Type:
  → Choose "Network Load Balancer"
  → Click "Create"

Step 2 - Basic Configuration:
  Load Balancer Name: my-network-lb
  Scheme: Internet-facing
  IP Address Type: IPv4

Step 3 - Network Mapping:
  VPC: Default VPC
  
  Availability Zones: ← IMPORTANT! Select same AZs as your instances
  ✅ us-east-1a → Subnet: (select public subnet in 1a)
  ✅ us-east-1b → Subnet: (select public subnet in 1b)
  
  Elastic IP (Optional for now):
  → Leave as "AWS assigned" for now
  → (We'll explore Elastic IP in bonus section)

Step 4 - Security Groups:
  ⚠️ NLB DOES NOT HAVE SECURITY GROUPS! 
  (This is different from ALB)
  → This section doesn't exist for NLB
  → Traffic flows directly to EC2 instances

Step 5 - Listeners and Routing:
  Listener 1:
    Protocol: TCP
    Port: 80
    Default Action: Forward to → nlb-target-group

→ Click "Create Load Balancer"
```

---

### STEP 5: Wait for NLB to Become Active

```
Console: EC2 → Load Balancers

Monitor Status:
┌──────────────────┬──────────────────┐
│      Time        │      Status      │
├──────────────────┼──────────────────┤
│  0 - 2 min      │  Provisioning    │
│  2 - 5 min      │  Active          │
└──────────────────┴──────────────────┘

→ Wait until State = "Active" ✅
→ Note the DNS name:
  my-network-lb-xxxx.elb.amazonaws.com
```

---

### STEP 6: Verify Target Group Health

```
Console: EC2 → Target Groups → nlb-target-group → Targets tab

Expected:
┌─────────────────┬──────────┬──────────┬───────────┐
│    Instance     │   Port   │   Zone   │  Health   │
├─────────────────┼──────────┼──────────┼───────────┤
│ NLB-Web-Server-1│    80    │ us-east-1a│  healthy ✅│
│ NLB-Web-Server-2│    80    │ us-east-1b│  healthy ✅│
└─────────────────┴──────────┴──────────┴───────────┘

If showing "initial" → wait 1-2 more minutes
If showing "unhealthy" → check security group allows port 80
```

---

### STEP 7: Test the NLB

#### 7.1 - Test from Browser

```
Copy NLB DNS Name from Load Balancers page

Open browser:
http://my-network-lb-xxxx.elb.amazonaws.com

🔄 Refresh multiple times (Ctrl+F5 for hard refresh)

Expected behavior:
Refresh 1 → 🔴 Shows SERVER 1 (Red)
Refresh 2 → 🔵 Shows SERVER 2 (Blue)  
Refresh 3 → 🔴 Shows SERVER 1 (Red)

⚠️ Note: NLB uses connection-based routing (not request-based)
   Browser keeps same connection → might see same server
   Use different browsers or incognito to see switching
```

#### 7.2 - Test Load Balancing (EC2 Instance Connect)

```
Console: EC2 → Instances → NLB-Web-Server-1
→ Connect → EC2 Instance Connect → Connect
```

```bash
# Test NLB from EC2 instance using curl
# curl creates new connections each time

NLB_DNS="my-network-lb-xxxx.elb.amazonaws.com"

# Test 10 times to see load balancing
echo "=== Testing NLB Load Balancing ==="
for i in {1..10}; do
    RESPONSE=$(curl -s http://$NLB_DNS | grep -o "SERVER [12]")
    echo "Request $i: $RESPONSE"
    sleep 1
done
```

```
Expected Output:
=== Testing NLB Load Balancing ===
Request 1:  SERVER 1
Request 2:  SERVER 2
Request 3:  SERVER 1
Request 4:  SERVER 2
Request 5:  SERVER 1
...
```

#### 7.3 - Check Source IP (Key NLB Feature!)

```bash
# On EC2 Instance Connect - NLB-Web-Server-1

# Check Apache access log
# NLB PRESERVES CLIENT IP (unlike ALB!)
tail -f /var/log/httpd/access_log
```

```
# While tailing log, access NLB from your browser
# You should see YOUR REAL IP ADDRESS in logs!

Expected log format:
YOUR.REAL.IP.HERE - - [01/Jan/2024:12:00:00 +0000] "GET / HTTP/1.1" 200 1234

# With ALB, you would see ALB's IP, not your real IP
# With NLB, you see the CLIENT's REAL IP ← This is important!
```

---

### STEP 8: Test High Availability - Simulate Failure

#### 8.1 - Stop One Instance

```
Console: EC2 → Instances
→ Select NLB-Web-Server-1
→ Instance State → Stop Instance → Stop
```

#### 8.2 - Watch Health Check

```
Console: EC2 → Target Groups → nlb-target-group → Targets

Watch the health status change:
┌─────────────────┬───────────────┐
│    Instance     │    Status     │
├─────────────────┼───────────────┤
│ NLB-Web-Server-1│  unhealthy ❌ │
│ NLB-Web-Server-2│  healthy   ✅ │
└─────────────────┴───────────────┘

Time for health check to detect failure:
= Unhealthy Threshold × Interval
= 3 × 30 seconds = ~90 seconds
```

#### 8.3 - Test Traffic Goes to Healthy Instance Only

```
Browser: http://my-network-lb-xxxx.elb.amazonaws.com

Refresh multiple times:
→ Always shows SERVER 2 (Blue) now
→ NLB automatically routes around failed instance! ✅
```

#### 8.4 - Recover Instance

```
Console: EC2 → Instances
→ Select NLB-Web-Server-1
→ Instance State → Start Instance → Start

Watch Target Group:
→ After ~90 seconds, Server 1 shows "healthy" again
→ Traffic automatically balanced again ✅
```

---

### STEP 9: Explore NLB Static IP Feature

```
This is a KEY advantage of NLB over ALB!
```

#### 9.1 - Check NLB IPs

```
Console: EC2 → Load Balancers → my-network-lb
→ Description tab
→ Look for: DNS name & Network Interfaces
```

```bash
# In EC2 Instance Connect, resolve NLB DNS
nslookup my-network-lb-xxxx.elb.amazonaws.com

# OR
dig my-network-lb-xxxx.elb.amazonaws.com

Expected Output:
Server 1: 54.x.x.x  (Static IP for AZ 1)
Server 2: 52.x.x.x  (Static IP for AZ 2)

# These IPs DON'T CHANGE!
# This is why companies whitelist NLB IPs in their firewalls
# ALB IPs change dynamically - you can't whitelist them!
```

#### 9.2 - Assign Elastic IP to NLB (Console)

```
⚠️ Note: Elastic IP can only be assigned at NLB CREATION time
You cannot add EIP to existing NLB

To demonstrate (create new NLB with EIP):

Step 1: Create Elastic IP
Console: EC2 → Elastic IPs → Allocate Elastic IP
  → AWS IPv4 address pool
  → Click Allocate
  → Note: eipalloc-xxxx

Step 2: Create new NLB with EIP
EC2 → Load Balancers → Create Load Balancer → Network LB
  Name: my-nlb-with-eip
  Network Mapping:
    us-east-1a: Use Elastic IP → select your EIP
    us-east-1b: Use Elastic IP or AWS assigned

This gives you FULLY STATIC, PREDICTABLE IP!
Clients/firewalls can whitelist this specific IP forever!
```

---

### STEP 10: Add TLS/HTTPS Listener (Bonus)

```
Console: EC2 → Load Balancers → my-network-lb
→ Listeners tab → Add Listener
```

```yaml
Protocol: TLS  ← Layer 4 TLS termination
Port: 443

Default Actions:
  Forward to: nlb-target-group

Security Policy: ELBSecurityPolicy-2016-08

Default SSL/TLS Certificate:
  → From ACM (AWS Certificate Manager)
  → Or Import certificate

→ Add
```

```
Concept: NLB can do TLS TERMINATION at Layer 4
- NLB decrypts TLS
- Sends plain TCP to backend EC2
- EC2 doesn't need to handle SSL
- This is called "TLS Offloading"
```

---

### STEP 11: Monitoring & Metrics

```
Console: EC2 → Load Balancers → my-network-lb
→ Monitoring tab
```

```
Key NLB CloudWatch Metrics:

┌─────────────────────────────────┬─────────────────────────────────┐
│           Metric                │          Description            │
├─────────────────────────────────┼─────────────────────────────────┤
│ ActiveFlowCount                 │ Current active TCP connections   │
│ NewFlowCount                    │ New TCP connections per second   │
│ ProcessedBytes                  │ Total bytes processed           │
│ HealthyHostCount                │ Healthy targets count           │
│ UnHealthyHostCount              │ Unhealthy targets count         │
│ TCP_Client_Reset_Count          │ RST packets from client         │
│ TCP_Target_Reset_Count          │ RST packets from target         │
└─────────────────────────────────┴─────────────────────────────────┘

Note: NLB uses "Flows" not "Requests"
(Because it's Layer 4 - connection based, not request based)
```

---

## 🧹 Cleanup (Important to Avoid Charges!)

### Order of Deletion Matters!

```
Step 1: Delete Load Balancer
Console: EC2 → Load Balancers
→ Select my-network-lb → Actions → Delete
→ Confirm delete

Step 2: Delete Target Group
Console: EC2 → Target Groups
→ Select nlb-target-group → Actions → Delete
→ Confirm

Step 3: Terminate EC2 Instances
Console: EC2 → Instances
→ Select NLB-Web-Server-1 → Instance State → Terminate
→ Select NLB-Web-Server-2 → Instance State → Terminate

Step 4: Release Elastic IP (if created)
Console: EC2 → Elastic IPs
→ Select EIP → Actions → Release Elastic IP

Step 5: Delete Security Group
Console: EC2 → Security Groups
→ Select nlb-ec2-sg → Actions → Delete
(Wait a few minutes after instances terminate)

Step 6: Delete Key Pair (Optional)
Console: EC2 → Key Pairs
→ Select nlb-keypair → Actions → Delete
```

---

## 📚 Summary - What You Learned

```
✅ Created EC2 instances with web servers in different AZs
✅ Created Target Group with TCP protocol
✅ Created Network Load Balancer (Layer 4)
✅ Tested load balancing across instances
✅ Verified NLB preserves CLIENT SOURCE IP
✅ Tested High Availability by stopping an instance
✅ Understood NLB's STATIC IP advantage
✅ Learned about TLS termination at Layer 4
✅ Monitored NLB metrics in CloudWatch
```

## 🎯 Key Concepts to Remember

```
NLB = Layer 4 (TCP/UDP)          ALB = Layer 7 (HTTP/HTTPS)
NLB = Static IP                   ALB = Dynamic IP
NLB = Preserves Source IP         ALB = Changes Source IP  
NLB = No Security Group           ALB = Has Security Group
NLB = Ultra-low latency           ALB = More features
NLB = Connection-based routing    ALB = Request-based routing
NLB = ~millions req/sec           ALB = High but lower
```