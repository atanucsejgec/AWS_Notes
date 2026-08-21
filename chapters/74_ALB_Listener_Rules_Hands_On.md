# ALB Listener Rules - Complete Guide

## 🤔 What is a Listener?

```
Client Request
      │
      ▼
┌─────────────────────────────────┐
│     Application Load Balancer   │
│                                 │
│  ┌──────────────────────────┐  │
│  │    LISTENER (Port 80)    │  │  ← "I listen on port 80"
│  │                          │  │
│  │  Rule 1: /api/* → TG-1  │  │  ← Check rules in order
│  │  Rule 2: /web/* → TG-2  │  │
│  │  Default: → TG-3        │  │  ← If no rule matches
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

> 💡 **Listener** = Someone standing at the door checking "who are you and where should I send you?"

---

## 🎯 Listener Rule Components

```
┌─────────────────────────────────────────────┐
│              LISTENER RULE                   │
│                                             │
│  PRIORITY: 1  (Lower = checked first)       │
│                                             │
│  CONDITIONS (IF):                           │
│  ┌─────────────────────────────────────┐   │
│  │ Path Pattern  /api/*                │   │
│  │ Host Header   api.example.com       │   │
│  │ HTTP Method   GET / POST            │   │
│  │ Query String  ?version=2            │   │
│  │ HTTP Header   X-Custom: value       │   │
│  │ Source IP     1.2.3.4/32            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ACTIONS (THEN):                            │
│  ┌─────────────────────────────────────┐   │
│  │ Forward       → Send to Target Group│   │
│  │ Redirect      → Send to another URL │   │
│  │ Fixed Response→ Return custom msg   │   │
│  │ Authenticate  → Cognito/OIDC auth   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 📋 Rule Conditions Explained

| Condition | Example | Use Case |
|-----------|---------|----------|
| **Path Pattern** | `/api/*` | Route by URL path |
| **Host Header** | `api.mysite.com` | Route by domain name |
| **HTTP Method** | `GET`, `POST` | Route by request method |
| **Query String** | `?env=prod` | Route by query parameter |
| **HTTP Header** | `X-Version: 2` | Route by custom header |
| **Source IP** | `10.0.0.0/8` | Route by IP address |

---

## 📋 Rule Actions Explained

| Action | Description | Example |
|--------|-------------|---------|
| **Forward** | Send to Target Group | `/api` → API servers |
| **Redirect** | Send to different URL | `http://` → `https://` |
| **Fixed Response** | Return static response | Return 404 with custom message |
| **Authenticate** | Verify user identity | Login required |

---

## 🏗️ What We'll Build

```
                    ┌─────────────────────┐
                    │   my-app-alb        │
                    │   Listener: Port 80  │
                    └─────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        Rule 1 (P:1)    Rule 2 (P:2)    Default Rule
        /api/*          /web/*          everything else
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  api-tg  │   │  web-tg  │   │ main-tg  │
        │          │   │          │   │          │
        │ Server-2 │   │ Server-3 │   │ Server-1 │
        └──────────┘   └──────────┘   └──────────┘

Extra Rules We'll Test:
- /old-page → Redirect to /new-page
- /maintenance → Fixed Response (503 message)
```

---

## 🛠️ HANDS-ON LAB

---

## STEP 1: Create Security Groups

### SG for ALB:
```
EC2 → Security Groups → Create Security Group
```
| Field | Value |
|-------|-------|
| **Name** | `alb-listener-sg` |
| **VPC** | Default VPC |

**Inbound Rules:**
| Type | Port | Source |
|------|------|--------|
| HTTP | 80 | 0.0.0.0/0 |

---

### SG for EC2:
```
EC2 → Security Groups → Create Security Group
```
| Field | Value |
|-------|-------|
| **Name** | `ec2-listener-sg` |
| **VPC** | Default VPC |

**Inbound Rules:**
| Type | Port | Source |
|------|------|--------|
| HTTP | 80 | alb-listener-sg |

---

## STEP 2: Launch 3 EC2 Instances

### Instance 1 - Main Server:
```
EC2 → Launch Instance
```
| Field | Value |
|-------|-------|
| **Name** | `Main-Server` |
| **AMI** | Amazon Linux 2023 |
| **Type** | t2.micro |
| **Key Pair** | No key pair |
| **SG** | ec2-listener-sg |

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial; 
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 60px; 
            margin: 0;
        }
        .card {
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 40px;
            display: inline-block;
            backdrop-filter: blur(10px);
        }
        .badge {
            background: #FFD700;
            color: #333;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🏠 MAIN SERVER</h1>
        <p><span class="badge">DEFAULT ROUTE</span></p>
        <h3>Instance: $INSTANCE_ID</h3>
        <p>You reached here because no specific rule matched</p>
        <p>Try visiting: <br>
           <b>/api/data</b> or <b>/web/home</b></p>
    </div>
</body>
</html>
EOF
```

---

### Instance 2 - API Server:
| Field | Value |
|-------|-------|
| **Name** | `API-Server` |
| **AMI** | Amazon Linux 2023 |
| **Type** | t2.micro |
| **Key Pair** | No key pair |
| **SG** | ec2-listener-sg |

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

# Create main API page
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial;
            text-align: center;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 60px;
            margin: 0;
        }
        .card {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 40px;
            display: inline-block;
        }
        .badge {
            background: #FF4500;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        pre {
            background: rgba(0,0,0,0.4);
            padding: 15px;
            border-radius: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>⚡ API SERVER</h1>
        <p><span class="badge">PATH: /api/*</span></p>
        <h3>Instance: $INSTANCE_ID</h3>
        <p>You reached here because your URL starts with <b>/api/</b></p>
        <pre>
{
  "status": "success",
  "server": "API-Server",
  "instance": "$INSTANCE_ID",
  "message": "API is running!"
}
        </pre>
    </div>
</body>
</html>
EOF

# Create API subdirectory
mkdir -p /var/www/html/api
cat > /var/www/html/api/index.html << EOF
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#333;color:#00ff00;padding:30px;">
    <h2>🔌 API Endpoint Response</h2>
    <pre>{ "endpoint": "/api/", "status": "OK", "server": "$INSTANCE_ID" }</pre>
</body>
</html>
EOF
```

---

### Instance 3 - Web Server:
| Field | Value |
|-------|-------|
| **Name** | `Web-Server` |
| **AMI** | Amazon Linux 2023 |
| **Type** | t2.micro |
| **Key Pair** | No key pair |
| **SG** | ec2-listener-sg |

**User Data:**
```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial;
            text-align: center;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 60px;
            margin: 0;
        }
        .card {
            background: rgba(0,0,0,0.2);
            border-radius: 15px;
            padding: 40px;
            display: inline-block;
        }
        .badge {
            background: #0066CC;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .menu {
            background: rgba(0,0,0,0.2);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🌐 WEB SERVER</h1>
        <p><span class="badge">PATH: /web/*</span></p>
        <h3>Instance: $INSTANCE_ID</h3>
        <p>You reached here because your URL starts with <b>/web/</b></p>
        <div class="menu">
            <p>📄 Web Server is serving your frontend!</p>
            <p>Instance ID: $INSTANCE_ID</p>
        </div>
    </div>
</body>
</html>
EOF

# Create web subdirectory
mkdir -p /var/www/html/web
cat > /var/www/html/web/index.html << EOF
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#4facfe;color:white;padding:30px;text-align:center;">
    <h2>🌐 Web Page Content</h2>
    <p>This is served from /web/ path</p>
    <p>Server: $INSTANCE_ID</p>
</body>
</html>
EOF
```

---

## STEP 3: Create Target Groups

### Target Group 1 - Main:
```
EC2 → Target Groups → Create Target Group
```
| Field | Value |
|-------|-------|
| **Target Type** | Instances |
| **Name** | `main-tg` |
| **Protocol** | HTTP |
| **Port** | 80 |
| **VPC** | Default VPC |
| **Health check path** | `/` |

**Register:** `Main-Server` → Include as pending → Create

---

### Target Group 2 - API:
| Field | Value |
|-------|-------|
| **Name** | `api-tg` |
| **Protocol** | HTTP |
| **Port** | 80 |
| **Health check path** | `/` |

**Register:** `API-Server` → Include as pending → Create

---

### Target Group 3 - Web:
| Field | Value |
|-------|-------|
| **Name** | `web-tg` |
| **Protocol** | HTTP |
| **Port** | 80 |
| **Health check path** | `/` |

**Register:** `Web-Server` → Include as pending → Create

---

## STEP 4: Create Application Load Balancer

```
EC2 → Load Balancers → Create Load Balancer
→ Application Load Balancer → Create
```

| Field | Value |
|-------|-------|
| **Name** | `listener-rules-alb` |
| **Scheme** | Internet-facing |
| **VPC** | Default VPC |
| **Mappings** | Select ALL AZs ✅ |
| **Security Group** | `alb-listener-sg` |

**Listener:**
| Protocol | Port | Default Action |
|----------|------|----------------|
| HTTP | 80 | Forward to `main-tg` |

Click **Create Load Balancer**

---

## STEP 5: Add Listener Rules ⭐ (Most Important Part!)

```
EC2 → Load Balancers → listener-rules-alb
→ Listeners and rules tab
→ Click "HTTP:80"
→ Manage rules → Add rule
```

---

### Rule 1: Route /api/* to API Server

Click **Add rule**

**Name:** `api-routing`

**Add Condition:**
```
Click "Add condition"
Select: Path
Value: /api/*
```

**Add Action:**
```
Action type: Forward to target groups
Target group: api-tg
```

**Priority:** `1`

Click **Save** ✅

---

### Rule 2: Route /web/* to Web Server

Click **Add rule**

**Name:** `web-routing`

**Add Condition:**
```
Click "Add condition"  
Select: Path
Value: /web/*
```

**Add Action:**
```
Action type: Forward to target groups
Target group: web-tg
```

**Priority:** `2`

Click **Save** ✅

---

### Rule 3: Redirect /old-page to /new-page

Click **Add rule**

**Name:** `redirect-old-to-new`

**Add Condition:**
```
Select: Path
Value: /old-page
```

**Add Action:**
```
Action type: Redirect to URL
Protocol: HTTP
Port: 80
Path: /new-page
Query: (leave empty)
Status code: 301 - Permanently moved
```

**Priority:** `3`

Click **Save** ✅

---

### Rule 4: Fixed Response for /maintenance

Click **Add rule**

**Name:** `maintenance-response`

**Add Condition:**
```
Select: Path
Value: /maintenance
```

**Add Action:**
```
Action type: Return fixed response
Response code: 503
Content-Type: text/html
Response body:
```
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            background: #FF6B35;
            color: white;
            padding: 80px;
        }
        .box {
            background: rgba(0,0,0,0.3);
            padding: 40px;
            border-radius: 15px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>🔧 Under Maintenance</h1>
        <p>We'll be back soon!</p>
        <p>Expected: 2 hours</p>
    </div>
</body>
</html>
```

**Priority:** `4`

Click **Save** ✅

---

## STEP 6: View All Rules

```
EC2 → Load Balancers → listener-rules-alb
→ Listeners and rules tab → HTTP:80
```

**You should see:**
```
┌──────────┬─────────────────┬──────────────────────────┐
│ Priority │ Condition        │ Action                   │
├──────────┼─────────────────┼──────────────────────────┤
│    1     │ Path: /api/*    │ Forward → api-tg         │
│    2     │ Path: /web/*    │ Forward → web-tg         │
│    3     │ Path: /old-page │ Redirect → /new-page     │
│    4     │ Path:/maintenance│ Fixed Response 503       │
│ Default  │ (everything)    │ Forward → main-tg        │
└──────────┴─────────────────┴──────────────────────────┘
```

---

## STEP 7: TEST Everything! 🧪

### Get ALB DNS:
```
EC2 → Load Balancers → listener-rules-alb
Copy: DNS name
```

### Test 1: Default Route
```
http://YOUR-ALB-DNS/
```
```
Expected: 🟣 Purple page - MAIN SERVER
Reason: No rule matched → Default rule → main-tg
```

---

### Test 2: API Path Routing
```
http://YOUR-ALB-DNS/api/anything
http://YOUR-ALB-DNS/api/users
http://YOUR-ALB-DNS/api/products
```
```
Expected: 🔴 Pink page - API SERVER
Reason: Path matches /api/* → Rule 1 → api-tg
```

---

### Test 3: Web Path Routing
```
http://YOUR-ALB-DNS/web/home
http://YOUR-ALB-DNS/web/about
http://YOUR-ALB-DNS/web/anything
```
```
Expected: 🔵 Blue page - WEB SERVER
Reason: Path matches /web/* → Rule 2 → web-tg
```

---

### Test 4: Redirect
```
http://YOUR-ALB-DNS/old-page
```
```
Expected: Browser automatically goes to /new-page
          Shows 404 (because /new-page doesn't exist)
          But notice URL CHANGED in browser! ✅
          
Check in Browser DevTools (F12 → Network):
  /old-page → 301 Redirect → /new-page
```

---

### Test 5: Fixed Response (Maintenance)
```
http://YOUR-ALB-DNS/maintenance
```
```
Expected: 🟠 Orange maintenance page
          Shows: "Under Maintenance - We'll be back soon!"
          Status Code: 503
          
Note: This never reaches any EC2 instance!
      ALB directly returns this response! ✅
```

---

## STEP 8: Test Priority (How Rules Work)

### Understanding Priority:

```
Request: GET /api/web/data

Rule Check Order:
├── Priority 1: /api/* ← MATCHES FIRST! ✅
│   → Goes to API server
│   (Stops checking other rules)
├── Priority 2: /web/* (never checked)
├── Priority 3: /old-page (never checked)  
└── Default (never reached)
```

### Change Priority Test:
```
EC2 → Load Balancers → listener-rules-alb
→ Listeners and rules tab → HTTP:80
→ Manage rules → Edit priority

Change:
  Rule: web-routing → Priority: 1
  Rule: api-routing → Priority: 2
```

**Now test:** `http://YOUR-ALB-DNS/api/web/data`
```
Now goes to WEB SERVER (because /web/* is checked first!)
Shows priority matters! ✅
```

**Change back** to original priorities after testing.

---

## STEP 9: Add Query String Condition (Bonus!)

```
EC2 → Load Balancers → listener-rules-alb
→ HTTP:80 → Add rule
```

**Name:** `query-string-test`

**Add Condition:**
```
Select: Query string
Key: version
Value: 2
```

**Add Action:**
```
Forward to: api-tg
```

**Priority:** `1` ← Higher than existing rules!

**Test:**
```
http://YOUR-ALB-DNS/?version=2      → Goes to API Server
http://YOUR-ALB-DNS/?version=1      → Goes to Main Server (default)
http://YOUR-ALB-DNS/web/?version=2  → Goes to API Server (query wins!)
```

---

## 📊 Complete Test Summary

| URL | Rule Hit | Server | Expected Result |
|-----|----------|--------|-----------------|
| `/` | Default | Main Server | 🟣 Purple page |
| `/api/users` | Rule 1 | API Server | 🔴 Pink page |
| `/api/orders` | Rule 1 | API Server | 🔴 Pink page |
| `/web/home` | Rule 2 | Web Server | 🔵 Blue page |
| `/web/about` | Rule 2 | Web Server | 🔵 Blue page |
| `/old-page` | Rule 3 | No server | 301 Redirect |
| `/maintenance` | Rule 4 | No server | 503 Fixed Response |
| `/random` | Default | Main Server | 🟣 Purple page |
| `/?version=2` | Rule 1(new) | API Server | 🔴 Pink page |

---

## 🧠 Key Concepts Summary

```
┌─────────────────────────────────────────────────┐
│           LISTENER RULES FLOW                   │
│                                                 │
│  Request arrives at ALB                         │
│         │                                       │
│         ▼                                       │
│  Check Rule Priority 1                          │
│  Does condition match? ──Yes──→ Execute Action  │
│         │ No                                    │
│         ▼                                       │
│  Check Rule Priority 2                          │
│  Does condition match? ──Yes──→ Execute Action  │
│         │ No                                    │
│         ▼                                       │
│  Check Rule Priority 3...                       │
│         │ No match found                        │
│         ▼                                       │
│  Execute DEFAULT Rule                           │
└─────────────────────────────────────────────────┘
```

---

## 🧹 Cleanup

```
1. EC2 → Load Balancers → listener-rules-alb → Delete
2. EC2 → Target Groups → Delete (main-tg, api-tg, web-tg)
3. EC2 → Instances → Terminate (all 3 servers)
4. EC2 → Security Groups → Delete (alb-listener-sg, ec2-listener-sg)
```

---

## 💡 Real World Use Cases

```
E-commerce Website:
├── /api/*       → Backend API servers
├── /images/*    → Image/CDN servers  
├── /admin/*     → Admin servers (with IP restriction)
├── /shop        → Shopping servers
└── default      → Homepage servers

Multi-tenant SaaS:
├── company1.app.com → Company1 servers
├── company2.app.com → Company2 servers
└── app.com          → Main servers
```