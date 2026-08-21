# AWS Elastic Load Balancer - Cross Zone Load Balancing

## 📚 What is Cross Zone Load Balancing?

### Without Cross Zone Load Balancing
```
AZ-1 (1 EC2)          AZ-2 (3 EC2)
┌─────────────┐        ┌─────────────┐
│   EC2-1     │        │   EC2-2     │
│  gets 50%   │        │  gets 17%   │
│  of traffic │        │             │
└─────────────┘        │   EC2-3     │
                       │  gets 17%   │
                       │             │
                       │   EC2-4     │
                       │  gets 17%   │
└─────────────────────────────────────┘
     Each AZ gets 50% → Split within AZ only
```

### With Cross Zone Load Balancing
```
AZ-1 (1 EC2)          AZ-2 (3 EC2)
┌─────────────┐        ┌─────────────┐
│   EC2-1     │        │   EC2-2     │
│  gets 25%   │        │  gets 25%   │
└─────────────┘        │             │
                       │   EC2-3     │
                       │  gets 25%   │
                       │             │
                       │   EC2-4     │
                       │  gets 25%   │
└─────────────────────────────────────┘
     Traffic distributed EVENLY across ALL instances
```

---

## 🎯 Why is it Important?

| Scenario | Without Cross Zone | With Cross Zone |
|----------|-------------------|-----------------|
| Uneven instances per AZ | Overload in 1 AZ | Even distribution |
| AZ scaling differences | Hotspots | Balanced load |
| Cost efficiency | Wasted resources | Optimal usage |
| Response time | Inconsistent | Consistent |

---

## 📋 Default Behavior by LB Type

| Load Balancer | Default | Can Change? | Inter-AZ Cost |
|---------------|---------|-------------|---------------|
| **ALB** | ✅ Enabled | Yes (target group level) | Free |
| **NLB** | ❌ Disabled | Yes | 💰 Charged |
| **CLB** | ❌ Disabled | Yes | Free |
| **GWLB** | ❌ Disabled | Yes | 💰 Charged |

---

## 🛠️ HANDS-ON LAB

### Architecture We'll Build
```
Internet
    │
    ▼
┌─────────────────────────────────────┐
│         Application Load Balancer    │
│              (ALB)                   │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────┐
    ▼                     ▼
  AZ-1a                 AZ-1b
┌────────┐           ┌────────┐
│ EC2 #1 │           │ EC2 #2 │
│        │           │ EC2 #3 │
└────────┘           └────────┘
(1 instance)         (2 instances)
```

---

### STEP 1: Create Security Groups

#### 1.1 - Security Group for Load Balancer
```
Navigation: EC2 → Security Groups → Create Security Group
```

| Field | Value |
|-------|-------|
| Name | `SG-ALB-CrossZone` |
| Description | `Security group for ALB` |
| VPC | Default VPC |

**Inbound Rules:**
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | 0.0.0.0/0 |

```
Click: Create Security Group
```

#### 1.2 - Security Group for EC2 Instances
```
Navigation: EC2 → Security Groups → Create Security Group
```

| Field | Value |
|-------|-------|
| Name | `SG-EC2-CrossZone` |
| Description | `Security group for EC2 instances` |
| VPC | Default VPC |

**Inbound Rules:**
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | SG-ALB-CrossZone |

```
✅ Source = the ALB security group (not 0.0.0.0/0)
Click: Create Security Group
```

---

### STEP 2: Launch EC2 Instances

#### 2.1 - Launch Instance in AZ-1a
```
Navigation: EC2 → Instances → Launch Instances
```

| Field | Value |
|-------|-------|
| Name | `WebServer-AZ1a` |
| AMI | Amazon Linux 2023 |
| Instance Type | t2.micro |
| Key Pair | Proceed without key pair |
| Subnet | Select your **AZ-1a** subnet |
| Auto-assign Public IP | Enable |
| Security Group | SG-EC2-CrossZone |

**Advanced Details → User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Get instance metadata
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Cross Zone Demo</title>
  <style>
    body { font-family: Arial; text-align: center; margin-top: 100px; }
    .az1 { background-color: #3498db; color: white; padding: 20px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="az1">
    <h1>🔵 Server in AZ: $AZ</h1>
    <h2>Instance ID: $INSTANCE_ID</h2>
    <h3>Instance: WebServer-AZ1a</h3>
    <p>Availability Zone 1a - 1 Instance</p>
  </div>
</body>
</html>
EOF
```

```
Click: Launch Instance
```

#### 2.2 - Launch Instance #2 in AZ-1b
```
Navigation: EC2 → Instances → Launch Instances
```

| Field | Value |
|-------|-------|
| Name | `WebServer-AZ1b-1` |
| AMI | Amazon Linux 2023 |
| Instance Type | t2.micro |
| Key Pair | Proceed without key pair |
| Subnet | Select your **AZ-1b** subnet |
| Auto-assign Public IP | Enable |
| Security Group | SG-EC2-CrossZone |

**Advanced Details → User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>Cross Zone Demo</title>
  <style>
    body { font-family: Arial; text-align: center; margin-top: 100px; }
    .az2 { background-color: #e74c3c; color: white; padding: 20px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="az2">
    <h1>🔴 Server in AZ: $AZ</h1>
    <h2>Instance ID: $INSTANCE_ID</h2>
    <h3>Instance: WebServer-AZ1b-1</h3>
    <p>Availability Zone 1b - Instance #1 of 2</p>
  </div>
</body>
</html>
EOF
```

#### 2.3 - Launch Instance #3 in AZ-1b
```
Same as 2.2 but change:
- Name: WebServer-AZ1b-2
- In User Data change text:
  - "Instance: WebServer-AZ1b-2"
  - "Instance #2 of 2"
```

---

### STEP 3: Create Target Group

```
Navigation: EC2 → Target Groups → Create Target Group
```

| Field | Value |
|-------|-------|
| Target type | Instances |
| Target group name | `TG-CrossZone-Demo` |
| Protocol | HTTP |
| Port | 80 |
| VPC | Default VPC |
| Health check protocol | HTTP |
| Health check path | / |

```
Click: Next
```

**Register Targets:**
```
Select ALL 3 instances:
✅ WebServer-AZ1a
✅ WebServer-AZ1b-1  
✅ WebServer-AZ1b-2

Click: Include as pending below
Click: Create Target Group
```

---

### STEP 4: Create Application Load Balancer

```
Navigation: EC2 → Load Balancers → Create Load Balancer
→ Choose: Application Load Balancer → Create
```

| Field | Value |
|-------|-------|
| Name | `ALB-CrossZone-Demo` |
| Scheme | Internet-facing |
| IP address type | IPv4 |

**Network Mapping:**
```
Select BOTH AZs:
✅ us-east-1a → select subnet
✅ us-east-1b → select subnet
```

**Security Groups:**
```
Remove default
Add: SG-ALB-CrossZone
```

**Listeners and routing:**
```
Protocol: HTTP  Port: 80
Default action: Forward to → TG-CrossZone-Demo
```

```
Click: Create Load Balancer
⏳ Wait 2-3 minutes for Active state
```

---

### STEP 5: Test Current Behavior (Cross Zone ON by Default)

#### 5.1 - Get ALB DNS Name
```
Navigation: EC2 → Load Balancers → ALB-CrossZone-Demo
Copy: DNS name
Example: ALB-CrossZone-Demo-123456.us-east-1.elb.amazonaws.com
```

#### 5.2 - Test in Browser
```
Open browser → paste DNS name → refresh multiple times

Expected Results with Cross Zone ON (ALB default):
🔵 AZ1a - 33% of requests
🔴 AZ1b-1 - 33% of requests  
🔴 AZ1b-2 - 33% of requests

✅ Even distribution across ALL instances!
```

#### 5.3 - Test with curl (multiple requests)
```bash
# Run this in your local terminal or CloudShell
for i in {1..9}; do
  curl -s http://YOUR-ALB-DNS-NAME | grep "Instance:"
done
```

**Expected Output:**
```
WebServer-AZ1a
WebServer-AZ1b-1
WebServer-AZ1b-2
WebServer-AZ1a
WebServer-AZ1b-1
WebServer-AZ1b-2
WebServer-AZ1a
WebServer-AZ1b-1
WebServer-AZ1b-2
```

---

### STEP 6: Check Cross Zone Setting on ALB

```
Navigation: EC2 → Load Balancers → ALB-CrossZone-Demo
Tab: Attributes
```

```
Look for:
┌─────────────────────────────────────────┐
│ Load balancing algorithm                 │
│ Cross-zone load balancing               │
│ ✅ On  ← Default for ALB               │
└─────────────────────────────────────────┘
```

---

### STEP 7: Check at Target Group Level

```
Navigation: EC2 → Target Groups → TG-CrossZone-Demo
Tab: Attributes
```

```
Look for:
┌─────────────────────────────────────────────┐
│ Target selection configuration               │
│ Load balancing algorithm: Round robin        │
│                                              │
│ Cross-zone load balancing:                   │
│ ○ Use load balancer setting                  │
│ ○ On                                         │  
│ ○ Off                                        │
└─────────────────────────────────────────────┘
```

---

### STEP 8: Turn OFF Cross Zone - See the Difference

#### 8.1 - Disable at Target Group Level
```
Navigation: EC2 → Target Groups → TG-CrossZone-Demo
Tab: Attributes → Edit
```

```
Cross-zone load balancing:
● Off  ← Select this

Click: Save changes
```

#### 8.2 - Test Again
```bash
for i in {1..9}; do
  curl -s http://YOUR-ALB-DNS-NAME | grep "Instance:"
done
```

**Expected Output WITHOUT Cross Zone:**
```
WebServer-AZ1a      ← AZ1a gets 50% (1 instance handles it all)
WebServer-AZ1a
WebServer-AZ1a
WebServer-AZ1a
WebServer-AZ1b-1    ← AZ1b gets 50% (split between 2 instances)
WebServer-AZ1b-2
WebServer-AZ1b-1
WebServer-AZ1b-2
WebServer-AZ1a

AZ1a instance: ~50% load 😰 OVERLOADED
AZ1b instances: ~25% each 😊 UNDERLOADED
```

**This shows the PROBLEM without Cross Zone!**

---

### STEP 9: Re-Enable Cross Zone

```
Navigation: EC2 → Target Groups → TG-CrossZone-Demo
Tab: Attributes → Edit

Cross-zone load balancing:
● Use load balancer setting  ← Back to default (ON)

Click: Save changes
```

---

### STEP 10: Verify NLB Behavior (Optional - Bonus)

```
Create NLB and check default is OFF:

Navigation: EC2 → Load Balancers → Create Load Balancer
→ Network Load Balancer

After creation:
Tab: Attributes

Cross-zone load balancing: ❌ OFF (default for NLB)
⚠️ Note: Enabling NLB cross-zone = COSTS MONEY (inter-AZ data transfer)
```

---

## 📊 Summary of What We Learned

```
┌─────────────────────────────────────────────────────────┐
│              CROSS ZONE LOAD BALANCING                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  OFF: Traffic stays within AZ                           │
│  ├── AZ-1 (1 instance) → gets 50%  😰                  │
│  └── AZ-2 (2 instances) → gets 25% each 😊             │
│                                                          │
│  ON: Traffic distributed across ALL instances           │
│  ├── AZ-1 (1 instance) → gets 33%  😊                  │
│  └── AZ-2 (2 instances) → gets 33% each 😊             │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  ALB: ON by default  → FREE                             │
│  NLB: OFF by default → Costs money if enabled           │
│  GLB: OFF by default → Costs money if enabled           │
└─────────────────────────────────────────────────────────┘
```

---

## 🧹 Cleanup (To Avoid Charges!)

```
Order matters! Delete in this sequence:

1. EC2 → Load Balancers → ALB-CrossZone-Demo → Delete
   ⏳ Wait for deletion

2. EC2 → Target Groups → TG-CrossZone-Demo → Delete

3. EC2 → Instances → Select all 3 → Terminate

4. EC2 → Security Groups → Delete both SGs
   (Delete SG-EC2-CrossZone first, then SG-ALB-CrossZone)
```

---

## 💡 Key Exam Tips

| Question | Answer |
|----------|--------|
| ALB cross-zone default? | ✅ ON |
| NLB cross-zone default? | ❌ OFF |
| Cross-zone with ALB = extra cost? | No, FREE |
| Cross-zone with NLB = extra cost? | Yes, 💰 Charged |
| Where to configure in ALB? | LB level OR Target Group level |
| Target Group overrides LB setting? | Yes! TG setting takes priority |