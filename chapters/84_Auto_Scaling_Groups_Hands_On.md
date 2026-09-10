# AWS Auto Scaling Groups (ASG) - Complete Guide

## 🤔 Why Auto Scaling Groups Are Important

### The Problem Without ASG
```
Normal Traffic:    [Server] ✅ handles fine
Traffic Spike:     [Server] 💥 crashes / slow
Low Traffic:       [Server] 💸 paying for unused capacity
Server Crash:      [Server] ❌ website goes down
```

### What ASG Solves
```
High Traffic  →  ASG automatically ADDS more EC2 instances
Low Traffic   →  ASG automatically REMOVES EC2 instances  
Instance Dies →  ASG automatically REPLACES it
```

### Real Business Benefits
| Problem | ASG Solution |
|---------|-------------|
| 💥 App crashes under load | Auto scale OUT (add instances) |
| 💸 Paying for idle servers | Auto scale IN (remove instances) |
| ❌ Single point of failure | Auto replace failed instances |
| 🌍 Multi-AZ outage | Spread instances across AZs |
| 👷 Manual server management | Fully automated |

---

## 🏗️ How ASG Works - Architecture

```
                    ┌─────────────────────────────────┐
                    │        Auto Scaling Group        │
                    │                                  │
                    │  Min: 1  Desired: 2  Max: 5      │
                    │                                  │
                    │  ┌──────────┐  ┌──────────┐     │
                    │  │  EC2 #1  │  │  EC2 #2  │     │
                    │  │  AZ: a   │  │  AZ: b   │     │
                    │  └──────────┘  └──────────┘     │
                    └─────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        CPU > 70%?      Instance died?   CPU < 30%?
        Scale OUT ➕     Replace it 🔄   Scale IN ➖
        Add instance    New instance     Remove instance
```

---

## 📋 Key Concepts Before Hands-On

| Concept | Description |
|---------|-------------|
| **Launch Template** | Blueprint for EC2 (AMI, type, security group) |
| **Minimum capacity** | Least number of instances always running |
| **Maximum capacity** | Most instances ASG can create |
| **Desired capacity** | How many instances you want RIGHT NOW |
| **Scaling Policy** | Rules that trigger scale in/out |
| **Health Check** | ASG monitors instance health |

---

## 🛠️ HANDS-ON LAB

### Overview of What We'll Build
```
Internet → Load Balancer → Auto Scaling Group (2-4 EC2s)
                              ↑
                         CloudWatch Alarm
                         (CPU > 50% = add more)
```

---

## STEP 1: Create a Launch Template

> **Console:** EC2 → Launch Templates → Create Launch Template

### 1.1 Basic Settings
```
Launch template name: my-asg-template
Template version description: Version 1 - Web Server
```

### 1.2 AMI Selection
```
✅ Select: Amazon Linux 2023 AMI (Free tier eligible)
```

### 1.3 Instance Type
```
Instance type: t2.micro (Free tier)
```

### 1.4 Key Pair
```
Key pair: Select existing OR "Proceed without key pair"
(We'll use EC2 Instance Connect if needed)
```

### 1.5 Network Settings
```
Security Group: Create new security group
  Name: asg-web-sg
  
  Inbound Rules:
  ┌─────────────┬──────────┬─────────────┐
  │ Type        │ Port     │ Source      │
  ├─────────────┼──────────┼─────────────┤
  │ HTTP        │ 80       │ 0.0.0.0/0   │
  │ SSH         │ 22       │ 0.0.0.0/0   │
  └─────────────┴──────────┴─────────────┘
```

### 1.6 Advanced Details → User Data
> Scroll down to "Advanced details" → "User data"
```bash
# ❌ This FAILS on Amazon Linux 2023 (IMDSv2)
curl -s http://169.254.169.254/latest/meta-data/instance-id

# ✅ This WORKS (IMDSv2 with token)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id

```

```bash
#!/bin/bash
# Update system
yum update -y

# Install Apache web server
yum install -y httpd

# Start Apache
systemctl start httpd
systemctl enable httpd

# ✅ Get IMDSv2 Token first
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# ✅ Use token to fetch metadata
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

TYPE=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-type)

# ✅ Write HTML with actual values
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ASG Demo</title>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            margin-top: 100px;
            background: #232f3e;
            color: white;
        }
        .box {
            background: #ff9900;
            padding: 30px;
            border-radius: 10px;
            display: inline-block;
        }
        h1 { color: #232f3e; }
        p { font-size: 18px; }
        span { 
            background: #232f3e; 
            color: #ff9900; 
            padding: 3px 10px; 
            border-radius: 5px; 
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>🚀 AWS Auto Scaling Demo</h1>
        <p><strong>Instance ID:</strong> <span>$INSTANCE_ID</span></p>
        <p><strong>Availability Zone:</strong> <span>$AZ</span></p>
        <p><strong>Instance Type:</strong> <span>$TYPE</span></p>
    </div>
</body>
</html>
EOF
```

### Click: **"Create launch template"** ✅

---

## STEP 2: Create Application Load Balancer (ALB)

> **Console:** EC2 → Load Balancers → Create Load Balancer

### 2.1 Choose Type
```
✅ Application Load Balancer → Create
```

### 2.2 Basic Config
```
Name: my-asg-alb
Scheme: Internet-facing
IP address type: IPv4
```

### 2.3 Network Mapping
```
VPC: Default VPC
Availability Zones: ✅ Select ALL available AZs
(e.g., us-east-1a ✅, us-east-1b ✅, us-east-1c ✅)
```

### 2.4 Security Group
```
Create new security group: alb-sg
  Inbound: HTTP port 80 from 0.0.0.0/0
```

### 2.5 Listeners and Routing
```
Listener: HTTP : 80

Target Group: Create target group
  ├── Target type: Instances
  ├── Name: my-asg-tg
  ├── Protocol: HTTP
  ├── Port: 80
  ├── Health check path: /
  └── Click: Next → Create target group
          (Don't add targets manually - ASG will do it!)
```

### 2.6 Back on ALB page
```
Select the target group: my-asg-tg
Click: Create load balancer ✅
```

---

## STEP 3: Create Auto Scaling Group

> **Console:** EC2 → Auto Scaling Groups → Create Auto Scaling Group

### 3.1 Choose Launch Template
```
Name: my-first-asg
Launch template: my-asg-template ← (one we created)
Version: Latest (1)
Click: Next
```

### 3.2 Choose Instance Launch Options
```
VPC: Default VPC

Availability Zones and Subnets:
✅ us-east-1a
✅ us-east-1b  
✅ us-east-1c
(Select ALL - this ensures high availability!)

Click: Next
```

### 3.3 Configure Advanced Options (Load Balancer)
```
Load balancing: ✅ Attach to an existing load balancer

Attach to existing:
✅ Choose from your load balancer target groups
Target group: my-asg-tg

Health checks:
✅ Turn on Elastic Load Balancing health checks
Health check grace period: 300 seconds

Click: Next
```

### 3.4 Configure Group Size and Scaling
```
┌─────────────────────────────────────────┐
│  Group Size                             │
│  Desired capacity:  2  ← start with 2  │
│  Minimum capacity:  1  ← never below 1 │
│  Maximum capacity:  4  ← never above 4 │
└─────────────────────────────────────────┘

Scaling policies:
✅ Target tracking scaling policy

Policy name: cpu-target-tracking
Metric type: Average CPU utilization
Target value: 50

(This means: if CPU > 50% → add instances)
(If CPU < 50% → remove instances)

Click: Next
```

### 3.5 Add Notifications (Optional but Good Practice)
```
Add notification: (skip for now or add SNS)
Click: Next
```

### 3.6 Add Tags
```
Key: Name
Value: asg-web-instance
✅ Tag new instances
Click: Next
```

### 3.7 Review and Create
```
Review everything → Click: Create Auto Scaling Group ✅
```

---

## STEP 4: Verify It's Working

### 4.1 Check Instances Were Created
```
EC2 → Instances

You should see:
✅ asg-web-instance (running) - AZ: us-east-1a
✅ asg-web-instance (running) - AZ: us-east-1b
```

### 4.2 Check ASG Activity
```
EC2 → Auto Scaling Groups → my-first-asg
→ Activity tab

You should see:
✅ "Launching a new EC2 instance" × 2
```

### 4.3 Test the Load Balancer
```
EC2 → Load Balancers → my-asg-alb
→ Copy DNS name

Example: my-asg-alb-123456789.us-east-1.elb.amazonaws.com

Open in browser → You should see your webpage!
Refresh multiple times → Notice DIFFERENT Instance IDs!
```

```
Refresh 1: Instance ID: i-0abc123  AZ: us-east-1a  🔄
Refresh 2: Instance ID: i-0xyz789  AZ: us-east-1b  🔄
```

---

## STEP 5: Test Auto Scaling - Simulate High CPU

> **Console:** EC2 Instance Connect to test scaling

### 5.1 Connect to an Instance
```
EC2 → Instances → Select one asg-web-instance
→ Connect → EC2 Instance Connect → Connect
```

### 5.2 Simulate High CPU Load
```bash
# Install stress tool
sudo yum install stress -y

# Create 100% CPU load for 5 minutes
# This will trigger the scaling alarm!
stress --cpu 4 --timeout 300
```

### 5.3 Watch the Magic Happen! (In Console)

**Terminal 1** - Keep stress running

**Browser Console** - Watch these:
```
CloudWatch → Alarms
→ You'll see: "TargetTracking-my-first-asg-AlarmHigh"
→ Status changes: OK → ALARM 🚨

EC2 → Auto Scaling Groups → my-first-asg → Activity
→ New entry: "Launching a new EC2 instance" 

EC2 → Instances
→ New instance appears! (3rd instance added)
```

### 5.4 Stop the Stress Test
```bash
# Press Ctrl+C to stop stress
# OR wait for 300 seconds timeout
```

### 5.5 Watch Scale IN
```
After ~5-10 minutes of low CPU:

CloudWatch Alarm → changes back to OK ✅
ASG → Terminates one instance (back to desired: 2)
```

---

## STEP 6: Test Self-Healing (Terminate an Instance)

> This is done entirely from Console!

```
EC2 → Instances
→ Select one of the asg-web-instance
→ Instance State → Terminate Instance → Confirm

Now watch:
EC2 → Auto Scaling Groups → Activity Tab

ASG detects: "Instance i-0abc123 is unhealthy"
ASG responds: "Launching replacement instance"
New instance appears within 2-3 minutes! 🔄
```

---

## STEP 7: Manual Scaling (Change Desired Capacity)

> Done entirely from Console

```
EC2 → Auto Scaling Groups → my-first-asg
→ Details tab → Edit

Change:
Desired capacity: 3  (was 2)
→ Update

Result: ASG immediately launches 1 more instance!
```

---

## 📊 Monitoring Your ASG

### CloudWatch Metrics to Watch
```
EC2 → Auto Scaling Groups → my-first-asg
→ Monitoring tab

Key Metrics:
📊 GroupDesiredCapacity    - What you want
📊 GroupInServiceInstances - Actually running
📊 GroupPendingInstances   - Being launched
📊 GroupTerminatingInstances - Being removed
```

---

## 🧹 CLEANUP (Important to avoid charges!)

> Done entirely from Console - Delete in this ORDER:

```
Step 1: Delete Auto Scaling Group
EC2 → Auto Scaling Groups → my-first-asg
→ Actions → Delete → Type "delete" → Delete
⚠️ This automatically terminates all EC2 instances!

Step 2: Delete Load Balancer
EC2 → Load Balancers → my-asg-alb
→ Actions → Delete

Step 3: Delete Target Group
EC2 → Target Groups → my-asg-tg
→ Actions → Delete

Step 4: Delete Launch Template
EC2 → Launch Templates → my-asg-template
→ Actions → Delete template

Step 5: Delete Security Groups
EC2 → Security Groups
→ Delete: alb-sg, asg-web-sg
```

---

## 📚 Summary - What You Learned

```
┌─────────────────────────────────────────────────────┐
│              AUTO SCALING GROUP RECAP                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Launch Template → Blueprint for new instances      │
│                                                      │
│  ASG Settings:                                       │
│  ├── Min: Always keep at least X instances          │
│  ├── Max: Never go above X instances                │
│  └── Desired: How many you want now                 │
│                                                      │
│  Scaling Policies:                                   │
│  ├── Target Tracking → Keep CPU at 50%              │
│  ├── Step Scaling → Scale by steps                  │
│  └── Simple Scaling → Basic threshold               │
│                                                      │
│  Benefits Demonstrated:                              │
│  ✅ Auto scales OUT when CPU high                   │
│  ✅ Auto scales IN when CPU low (saves money)       │
│  ✅ Self-heals when instance dies                   │
│  ✅ Spreads across multiple AZs                     │
│  ✅ Works with Load Balancer seamlessly             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

| Feature | What it means for you |
|---------|----------------------|
| **Self-healing** | Never worry about crashed servers |
| **Auto scaling** | Handle any traffic spike automatically |
| **Cost optimization** | Pay only for what you need |
| **Multi-AZ** | Survive data center failures |
| **Load balancer integration** | Traffic distributed evenly |