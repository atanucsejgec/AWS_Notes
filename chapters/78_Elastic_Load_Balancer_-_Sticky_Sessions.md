# AWS Elastic Load Balancer - Sticky Sessions

## 📚 What are Sticky Sessions?

**Sticky Sessions** (also called **Session Affinity**) is a feature that allows the Load Balancer to **bind a user's session to a specific EC2 instance**.

```
Without Sticky Sessions:          With Sticky Sessions:
─────────────────────             ─────────────────────
User Request 1 → EC2-A            User Request 1 → EC2-A ✓
User Request 2 → EC2-B            User Request 2 → EC2-A ✓  (same instance!)
User Request 3 → EC2-C            User Request 3 → EC2-A ✓  (same instance!)
User Request 4 → EC2-A            User Request 4 → EC2-A ✓  (same instance!)
```

---

## 🤔 Why is it Important?

### Problem Without Sticky Sessions:
```
User logs in → EC2-A stores session data
Next request → EC2-B (no session data!) → User logged out! ❌
```

### Real World Use Cases:
| Scenario | Why Sticky Sessions Needed |
|----------|---------------------------|
| **Shopping Cart** | Cart stored in server memory |
| **User Login Sessions** | Session data on specific server |
| **File Upload (multi-part)** | Parts must go to same server |
| **Legacy Applications** | Old apps not designed for distributed sessions |

### ⚠️ Important Note:
> Modern apps use **external session storage** (Redis, DynamoDB) to avoid needing sticky sessions. But sticky sessions are still widely used!

---

## 🍪 How Sticky Sessions Work?

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                                                      │
│  First Request:  No cookie → Route to any instance  │
│  Response:       Sets cookie "AWSALB=xxxxx"          │
│                                                      │
│  Next Requests:  Cookie present → Route to EC2-A     │
└─────────────────────────────────────────────────────┘
```

### Two Types of Stickiness Cookies:

| Cookie Type | Who Creates It | Cookie Name | Best For |
|-------------|---------------|-------------|----------|
| **Application-based** | Your Application | Custom name | Full control |
| **Duration-based** | Load Balancer | AWSALB / AWSALBAPP | Simple setup |

---

## 🛠️ Hands-On Practice

### Architecture We'll Build:
```
Internet
    │
    ▼
[Application Load Balancer]
    │           │
    ▼           ▼
[EC2-A]      [EC2-B]
"Server A"   "Server B"
```

---

### Step 1: Launch Two EC2 Instances

#### 1.1 - Go to EC2 Console

```
AWS Console → EC2 → Instances → Launch Instance
```

#### 1.2 - Launch First Instance

```
Name: WebServer-A
AMI: Amazon Linux 2023
Instance Type: t2.micro
Key Pair: (your existing key or create new)
```

**Security Group Settings:**
```
Create new Security Group: "WebServer-SG"
Inbound Rules:
  - HTTP (Port 80)  → Source: Anywhere (0.0.0.0/0)
  - SSH (Port 22)   → Source: Anywhere (0.0.0.0/0)
```

**Advanced Details → User Data (paste this):**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Server A</title>
    <style>
        body { 
            font-family: Arial; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background-color: #FF6B6B;
        }
        .box { 
            text-align: center; 
            background: white; 
            padding: 50px; 
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { color: #FF6B6B; font-size: 3em; }
    </style>
</head>
<body>
    <div class="box">
        <h1>🔴 SERVER A</h1>
        <p><strong>Instance ID:</strong> $INSTANCE_ID</p>
        <p><strong>Availability Zone:</strong> $AZ</p>
        <p>You are connected to <strong>Server A</strong></p>
    </div>
</body>
</html>
EOF
```

Click **Launch Instance**

---

#### 1.3 - Launch Second Instance

```
Name: WebServer-B
AMI: Amazon Linux 2023
Instance Type: t2.micro
Key Pair: (same key pair)
Security Group: Select existing → WebServer-SG
```

**Advanced Details → User Data (paste this):**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Get instance metadata
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)

# Create webpage
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Server B</title>
    <style>
        body { 
            font-family: Arial; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background-color: #4ECDC4;
        }
        .box { 
            text-align: center; 
            background: white; 
            padding: 50px; 
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { color: #4ECDC4; font-size: 3em; }
    </style>
</head>
<body>
    <div class="box">
        <h1>🟢 SERVER B</h1>
        <p><strong>Instance ID:</strong> $INSTANCE_ID</p>
        <p><strong>Availability Zone:</strong> $AZ</p>
        <p>You are connected to <strong>Server B</strong></p>
    </div>
</body>
</html>
EOF
```

Click **Launch Instance**

---

### Step 2: Create Target Group

```
EC2 Console → Load Balancing → Target Groups → Create Target Group
```

**Configuration:**
```
Target Type: Instances
Target Group Name: my-web-tg
Protocol: HTTP
Port: 80
VPC: (your default VPC)
Health Check Protocol: HTTP
Health Check Path: /
```

Click **Next**

**Register Targets:**
```
Select both instances:  ✓ WebServer-A
                        ✓ WebServer-B
Port: 80
→ Click "Include as pending below"
```

Click **Create Target Group**

---

### Step 3: Create Application Load Balancer

```
EC2 Console → Load Balancing → Load Balancers → Create Load Balancer
→ Select: Application Load Balancer → Create
```

**Basic Configuration:**
```
Name: my-web-alb
Scheme: Internet-facing
IP address type: IPv4
```

**Network Mapping:**
```
VPC: Default VPC
Availability Zones: Select ALL available AZs ✓
```

**Security Groups:**
```
Create new security group or select existing
Make sure HTTP (port 80) is open from anywhere
```

**Listeners and Routing:**
```
Protocol: HTTP
Port: 80
Default Action: Forward to → my-web-tg
```

Click **Create Load Balancer**

⏳ Wait 2-3 minutes for ALB to become **Active**

---

### Step 4: Test WITHOUT Sticky Sessions (Default Behavior)

#### 4.1 - Get ALB DNS Name
```
Load Balancers → Select your ALB → Copy DNS Name
Example: my-web-alb-123456789.us-east-1.elb.amazonaws.com
```

#### 4.2 - Open Browser and Test

```
1. Open browser
2. Go to: http://[your-alb-dns-name]
3. Keep refreshing (F5) multiple times
```

**Expected Result:**
```
Refresh 1: 🔴 SERVER A  ← Different server each time!
Refresh 2: 🟢 SERVER B
Refresh 3: 🔴 SERVER A
Refresh 4: 🟢 SERVER B
```

> ✅ This confirms load balancing is working (round-robin)
> ✅ This also shows WITHOUT sticky sessions, requests go to different servers

---

### Step 5: Enable Sticky Sessions

```
EC2 Console → Target Groups → Select "my-web-tg"
→ Actions → Edit Attributes
```

**OR:**
```
Target Groups → my-web-tg → Attributes Tab → Edit
```

**Find "Stickiness" section:**
```
☑ Stickiness: Enable

Stickiness Type: Load balancer generated cookie

Stickiness Duration: 1 day (86400 seconds)
                     (for testing, set to 1 minute = 60 seconds)
```

Click **Save Changes** ✅

---

### Step 6: Test WITH Sticky Sessions

#### 6.1 - Open Browser in Normal Mode
```
1. Open browser (or clear cookies first)
2. Go to: http://[your-alb-dns-name]
3. Note which server you see (A or B)
4. Keep refreshing (F5) 10+ times
```

**Expected Result:**
```
Refresh 1:  🔴 SERVER A  ← First request
Refresh 2:  🔴 SERVER A  ✓ Same server!
Refresh 3:  🔴 SERVER A  ✓ Same server!
Refresh 4:  🔴 SERVER A  ✓ Same server!
Refresh 5:  🔴 SERVER A  ✓ Same server!
```

> 🎉 Sticky sessions working! Always goes to same server!

#### 6.2 - See the Cookie!

```
Browser → F12 (Developer Tools)
→ Application Tab (Chrome) or Storage Tab (Firefox)
→ Cookies
→ http://[your-alb-dns-name]
```

**You should see:**
```
Cookie Name:  AWSALB
Cookie Value: xxxxxxxxxxxxxxxxxxxxxxxxxx (encrypted)
Expires:      [duration you set]
```

---

### Step 7: Test Different Users Get Different Servers

```
Browser 1 (Normal):    http://[alb-dns] → 🔴 SERVER A (always)
Browser 2 (Incognito): http://[alb-dns] → 🟢 SERVER B (always)
```

> Different sessions → Different servers → Each "sticks" to their server!

---

### Step 8: Test Cookie Expiration (Optional)

```
1. Set stickiness duration to 1 minute (60 seconds)
2. Go to ALB URL → Note server (e.g., Server A)
3. Wait 1-2 minutes
4. Refresh → You might get Server B now (cookie expired!)
5. Keep refreshing → Now it sticks to Server B
```

---

### Step 9: Clean Up (Important! 💰)

```
1. Delete Load Balancer:
   Load Balancers → Select ALB → Actions → Delete

2. Delete Target Group:
   Target Groups → Select TG → Actions → Delete

3. Terminate EC2 Instances:
   Instances → Select both → Instance State → Terminate
```

---

## 📊 Summary Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STICKY SESSIONS FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User First Visit:                                           │
│  Browser ──────────→ ALB ──────────→ EC2-A                  │
│  Browser ←────────── ALB ←────────── EC2-A                  │
│              Sets Cookie: AWSALB=abc123                      │
│                                                              │
│  User Second Visit:                                          │
│  Browser ──[Cookie: AWSALB=abc123]──→ ALB                   │
│                                        │                     │
│                                        │ Reads Cookie        │
│                                        ▼                     │
│                                  Routes to EC2-A ✓          │
│                                                              │
│  User Third Visit:                                           │
│  Browser ──[Cookie: AWSALB=abc123]──→ ALB                   │
│                                        │                     │
│                                        ▼                     │
│                                  Routes to EC2-A ✓          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

| Topic | Detail |
|-------|--------|
| **What** | Bind user session to specific EC2 instance |
| **How** | Cookie-based (AWSALB cookie) |
| **Duration** | 1 second to 7 days |
| **Works with** | ALB and CLB (not NLB) |
| **Best Practice** | Use external session store (Redis/DynamoDB) instead when possible |
| **When to use** | Legacy apps, stateful applications |

> 💡 **Pro Tip**: Sticky sessions can cause **uneven load distribution** if many users stick to one server. Always monitor CloudWatch metrics when using sticky sessions!