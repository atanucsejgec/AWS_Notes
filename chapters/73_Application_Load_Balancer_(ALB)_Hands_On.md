# Application Load Balancer (ALB) - Complete Guide

## 🤔 Why ALB is Important?

### Problems Without ALB:
```
Users → Single EC2 Instance
         ↓
    If it crashes → Website DOWN ❌
    If traffic spikes → Server overloaded ❌
    No way to distribute load ❌
```

### With ALB:
```
Users → ALB → EC2 Instance 1 (Healthy ✅)
           → EC2 Instance 2 (Healthy ✅)
           → EC2 Instance 3 (Healthy ✅)
    
    If Instance 1 crashes → ALB automatically routes to 2 & 3 ✅
    Traffic spikes → Load distributed across all instances ✅
```

---

## 🎯 Key Benefits

| Feature | Description |
|---------|-------------|
| **High Availability** | Routes traffic only to healthy instances |
| **Scalability** | Distribute load across multiple instances |
| **Path-based Routing** | /api → backend servers, /images → image servers |
| **Host-based Routing** | api.example.com → API servers |
| **Health Checks** | Auto-detects unhealthy instances |
| **SSL Termination** | Handle HTTPS at load balancer level |
| **Layer 7** | Can read HTTP headers, paths, methods |

---

## 🏗️ ALB Architecture

```
Internet
   │
   ▼
┌─────────────────────────────────┐
│     Application Load Balancer   │
│  ┌─────────────────────────┐   │
│  │      Listener :80        │   │
│  │  (Rules & Conditions)    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
         │              │
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│ Target Group │  │ Target Group │
│      1       │  │      2       │
│  /api/*      │  │  /web/*      │
├──────────────┤  ├──────────────┤
│   EC2 - 1    │  │   EC2 - 3    │
│   EC2 - 2    │  │   EC2 - 4    │
└──────────────┘  └──────────────┘
```

---

## 🛠️ HANDS-ON LAB

### What We'll Build:
```
Internet → ALB → 2 EC2 Instances
                  (Each shows different message)
                  ALB will distribute traffic between them
```

---

## STEP 1: Create Security Groups

### 1A: Security Group for ALB
```
Console → EC2 → Security Groups → Create Security Group
```

| Field | Value |
|-------|-------|
| **Name** | `alb-sg` |
| **Description** | Security group for ALB |
| **VPC** | Default VPC |

**Inbound Rules:**
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | 0.0.0.0/0 (Anywhere) |

**Outbound Rules:** Leave default (All traffic)

Click **Create Security Group**

---

### 1B: Security Group for EC2 Instances
```
Console → EC2 → Security Groups → Create Security Group
```

| Field | Value |
|-------|-------|
| **Name** | `ec2-web-sg` |
| **Description** | Security group for Web Servers |
| **VPC** | Default VPC |

**Inbound Rules:**
| Type | Protocol | Port | Source |
|------|----------|------|--------|
| HTTP | TCP | 80 | **alb-sg** (select the SG we created) |

> ⚠️ Important: EC2 only accepts traffic FROM the ALB, not from internet directly!

Click **Create Security Group**

---

## STEP 2: Launch EC2 Instances

### Launch Instance 1:
```
Console → EC2 → Instances → Launch Instance
```

| Field | Value |
|-------|-------|
| **Name** | `Web-Server-1` |
| **AMI** | Amazon Linux 2023 |
| **Instance Type** | t2.micro (free tier) |
| **Key Pair** | No key pair needed (using connect) |
| **Security Group** | Select `ec2-web-sg` |

**Expand Advanced Details → User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Get instance metadata
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Web Server 1</title>
    <style>
        body { 
            font-family: Arial; 
            text-align: center; 
            background-color: #FF6B6B; 
            color: white;
            padding: 50px;
        }
        .box {
            background: rgba(0,0,0,0.3);
            padding: 30px;
            border-radius: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>🔴 Web Server 1</h1>
        <h2>Instance ID: $INSTANCE_ID</h2>
        <h2>Availability Zone: $AZ</h2>
        <p>This request was served by Server 1</p>
    </div>
</body>
</html>
EOF
```

Click **Launch Instance**

---

### Launch Instance 2:
```
Console → EC2 → Instances → Launch Instance
```

| Field | Value |
|-------|-------|
| **Name** | `Web-Server-2` |
| **AMI** | Amazon Linux 2023 |
| **Instance Type** | t2.micro |
| **Key Pair** | No key pair needed |
| **Security Group** | Select `ec2-web-sg` |

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Get instance metadata
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Web Server 2</title>
    <style>
        body { 
            font-family: Arial; 
            text-align: center; 
            background-color: #4ECDC4; 
            color: white;
            padding: 50px;
        }
        .box {
            background: rgba(0,0,0,0.3);
            padding: 30px;
            border-radius: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>🟢 Web Server 2</h1>
        <h2>Instance ID: $INSTANCE_ID</h2>
        <h2>Availability Zone: $AZ</h2>
        <p>This request was served by Server 2</p>
    </div>
</body>
</html>
EOF
```

Click **Launch Instance**

---

## STEP 3: Create Target Group

```
Console → EC2 → Target Groups → Create Target Group
```

### Configuration:
| Field | Value |
|-------|-------|
| **Target Type** | Instances |
| **Target Group Name** | `web-servers-tg` |
| **Protocol** | HTTP |
| **Port** | 80 |
| **VPC** | Default VPC |
| **Protocol Version** | HTTP1 |

### Health Check Settings:
| Field | Value |
|-------|-------|
| **Health check protocol** | HTTP |
| **Health check path** | `/` |
| **Healthy threshold** | 2 |
| **Unhealthy threshold** | 2 |
| **Timeout** | 5 seconds |
| **Interval** | 10 seconds |

Click **Next**

### Register Targets:
- Select both `Web-Server-1` and `Web-Server-2`
- Click **Include as pending below**
- Click **Create Target Group**

---

## STEP 4: Create Application Load Balancer

```
Console → EC2 → Load Balancers → Create Load Balancer
→ Application Load Balancer → Create
```

### Basic Configuration:
| Field | Value |
|-------|-------|
| **Name** | `my-app-alb` |
| **Scheme** | Internet-facing |
| **IP Address Type** | IPv4 |

### Network Mapping:
| Field | Value |
|-------|-------|
| **VPC** | Default VPC |
| **Mappings** | ✅ Select ALL Availability Zones |

> ⚠️ Select at least 2 AZs for high availability!

### Security Groups:
- Remove the default security group
- Select `alb-sg`

### Listeners and Routing:
| Field | Value |
|-------|-------|
| **Protocol** | HTTP |
| **Port** | 80 |
| **Default Action** | Forward to `web-servers-tg` |

Click **Create Load Balancer**

---

## STEP 5: Wait & Verify

### Check ALB Status:
```
EC2 → Load Balancers → my-app-alb
State: Should change from "Provisioning" → "Active"
(Takes 2-3 minutes)
```

### Check Target Health:
```
EC2 → Target Groups → web-servers-tg → Targets tab

✅ Web-Server-1: healthy
✅ Web-Server-2: healthy
```

---

## STEP 6: TEST the Load Balancer

### Get ALB DNS Name:
```
EC2 → Load Balancers → my-app-alb
Copy DNS Name: my-app-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com
```

### Test in Browser:
```
http://my-app-alb-XXXXXXXXX.us-east-1.elb.amazonaws.com
```

**🔄 Keep refreshing the page!**
```
Refresh 1: 🔴 Red page - Web Server 1
Refresh 2: 🟢 Green page - Web Server 2  
Refresh 3: 🔴 Red page - Web Server 1
Refresh 4: 🟢 Green page - Web Server 2
```

This shows ALB is distributing traffic (Round Robin)!

---

## STEP 7: Test High Availability (IMPORTANT!)

### Simulate Server Failure:
```
EC2 → Instances → Web-Server-1 → Stop Instance
```

### What Happens:
```
ALB Health Check detects Web-Server-1 is DOWN
                ↓
ALB automatically routes ALL traffic to Web-Server-2
                ↓
Users see NO downtime! ✅
```

### Verify:
```
Refresh browser multiple times
→ Only 🟢 Green page (Server 2) appears
→ Website still works! ✅
```

### Bring Server Back:
```
EC2 → Instances → Web-Server-1 → Start Instance
→ Wait 1-2 minutes for health check to pass
→ Traffic distributes again between both servers
```

---

## STEP 8: Path-Based Routing (Advanced)

### Create another Target Group for API:
```
EC2 → Target Groups → Create Target Group
Name: api-servers-tg
(Register Web-Server-2 only)
```

### Add Routing Rule to ALB:
```
EC2 → Load Balancers → my-app-alb → Listeners tab
→ Click on "HTTP:80" listener
→ Manage Rules → Add Rule
```

**Rule Configuration:**
```
IF:
  Path is: /api*

THEN:
  Forward to: api-servers-tg
```

**Default rule:**
```
All other traffic → web-servers-tg
```

### Test Path Routing:
```
http://ALB-DNS/          → Goes to web-servers-tg (both servers)
http://ALB-DNS/api/test  → Goes ONLY to api-servers-tg (Server 2)
```

---

## 🧹 Cleanup (Save Money!)

```
1. EC2 → Load Balancers → my-app-alb → Delete
   (Wait for deletion to complete)

2. EC2 → Target Groups → web-servers-tg → Delete
                       → api-servers-tg → Delete

3. EC2 → Instances → Web-Server-1 → Terminate
                   → Web-Server-2 → Terminate

4. EC2 → Security Groups → alb-sg → Delete
                         → ec2-web-sg → Delete
```

---

## 📊 What You Learned

```
┌─────────────────────────────────────┐
│           ALB Components            │
├─────────────────────────────────────┤
│ Load Balancer  → Entry point        │
│ Listener       → Port & Protocol    │
│ Rules          → Routing logic      │
│ Target Group   → Group of servers   │
│ Health Check   → Monitor instances  │
│ Security Group → Traffic control    │
└─────────────────────────────────────┘
```

| Concept | Learned |
|---------|---------|
| High Availability | ✅ Traffic continues when server fails |
| Load Distribution | ✅ Round-robin between servers |
| Health Checks | ✅ Auto-detect unhealthy instances |
| Security | ✅ EC2 only accepts traffic from ALB |
| Path Routing | ✅ Route based on URL path |

---

## 💡 Common Interview Questions

**Q: What's difference between ALB and NLB?**
```
ALB = Layer 7 (HTTP/HTTPS) - Can route by path/host/headers
NLB = Layer 4 (TCP/UDP) - Extreme performance, low latency
```

**Q: What happens when all targets are unhealthy?**
```
ALB returns 503 Service Unavailable error
```

**Q: Can ALB route to targets in different AZs?**
```
Yes! This is the main benefit - cross-zone load balancing
```