# 36. Security Groups Hands On

# AWS EC2 Security Groups - Complete Guide & Hands-On

## 📚 What is a Security Group?

A **Security Group** acts as a **virtual firewall** for your EC2 instances to control inbound and outbound traffic.

```
Internet → [Security Group Rules] → EC2 Instance
                ↑
         (Allow/Deny Traffic)
```

---

## 🔑 Key Concepts

### Important Characteristics
```
✅ Security Groups are STATEFUL
   - If inbound traffic is allowed, response is automatically allowed
   
✅ Only ALLOW rules (no deny rules)
   - Everything is DENIED by default
   
✅ Applied at INSTANCE level (not subnet level)

✅ One instance can have MULTIPLE security groups

✅ One security group can be attached to MULTIPLE instances

✅ Specific to a VPC/Region
```

---

## 📋 Security Group Rules Structure

| Field | Description | Example |
|-------|-------------|---------|
| **Type** | Protocol type | SSH, HTTP, HTTPS, Custom |
| **Protocol** | TCP, UDP, ICMP | TCP |
| **Port Range** | Port number | 22, 80, 443 |
| **Source/Destination** | IP or Security Group | 0.0.0.0/0, 10.0.0.1/32 |
| **Description** | Rule description | "Allow SSH from office" |

---

## 🎯 Hands-On Practice

---

### ✅ LAB 1: Create Your First Security Group

**Step 1: Go to Security Groups**
```
AWS Console → EC2 → Network & Security → Security Groups → Create Security Group
```

**Step 2: Fill in Details**
```
Name:        my-first-sg
Description: My first security group for learning
VPC:         [Select your default VPC]
```

**Step 3: Add Inbound Rules**
```
Rule 1:
├── Type: SSH
├── Protocol: TCP
├── Port: 22
├── Source: My IP (auto-detects your IP)
└── Description: Allow SSH from my computer

Rule 2:
├── Type: HTTP
├── Protocol: TCP
├── Port: 80
├── Source: 0.0.0.0/0 (anywhere)
└── Description: Allow HTTP from anywhere
```

**Step 4: Outbound Rules (keep default)**
```
All traffic → 0.0.0.0/0 (allow all outbound - default)
```

**Step 5: Click "Create Security Group"**

---

### ✅ LAB 2: Launch EC2 with Security Group

**Step 1: Launch Instance**
```
EC2 → Instances → Launch Instance
├── Name: test-sg-instance
├── AMI: Amazon Linux 2023
├── Instance Type: t2.micro (free tier)
├── Key Pair: Create new or select existing
└── Security Group: Select "my-first-sg"
```

**Step 2: Verify Instance is Running**
```
Wait for Status: Running ✅
Status Checks: 2/2 passed ✅
```

---

### ✅ LAB 3: Test Inbound Rules

**Test 1: Test SSH Connection**
```bash
# Download your key pair (.pem file)
# Change permissions
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ec2-user@<PUBLIC-IP>

# Expected Result: ✅ SUCCESS - SSH is allowed
```

**Test 2: Test HTTP (Install web server first)**
```bash
# After SSH into instance, run:
sudo yum update -y
sudo yum install httpd -y
sudo systemctl start httpd
sudo systemctl enable httpd

# Create a test page
echo "<h1>Security Group Test - SUCCESS!</h1>" | sudo tee /var/www/html/index.html
```

**Test 3: Access from Browser**
```
Open browser → http://<YOUR-EC2-PUBLIC-IP>

Expected Result: ✅ Shows "Security Group Test - SUCCESS!"
```

---

### ✅ LAB 4: Test Blocking Traffic (See Deny in Action)

**Step 1: Remove HTTP Rule**
```
Security Groups → my-first-sg → Inbound Rules → Edit
→ DELETE the HTTP rule → Save
```

**Step 2: Test Again**
```
Browser → http://<YOUR-EC2-PUBLIC-IP>

Expected Result: ❌ Connection Timeout (BLOCKED!)
```

**Step 3: Add Rule Back**
```
Add HTTP rule again → Save

Browser → http://<YOUR-EC2-PUBLIC-IP>

Expected Result: ✅ Works again!
```

---

### ✅ LAB 5: Security Group Referencing (Advanced)

**Real-world scenario: Web Server → Database Server**

```
[Internet] → [Web-SG] → [Web Server]
                              ↓
                         [DB-SG] → [Database Server]
```

**Step 1: Create Database Security Group**
```
Name: db-security-group
Description: Database security group

Inbound Rules:
├── Type: MySQL/Aurora
├── Protocol: TCP
├── Port: 3306
├── Source: [SELECT "web-security-group" ID]  ← Security Group Reference!
└── Description: Allow MySQL from web servers only
```

**Why this is BETTER than using IP addresses:**
```
❌ Using IP:  Source: 10.0.1.5/32  → Breaks if IP changes
✅ Using SG:  Source: web-sg-id    → Works for ALL instances with that SG
```

---

### ✅ LAB 6: Multiple Security Groups on One Instance

**Step 1: Create Additional Security Group**
```
Name: https-security-group

Inbound Rules:
├── Type: HTTPS
├── Port: 443
└── Source: 0.0.0.0/0
```

**Step 2: Attach to Existing Instance**
```
EC2 → Instances → Select Instance
→ Actions → Security → Change Security Groups
→ Add "https-security-group"
→ Save
```

**Result:**
```
Instance now has BOTH security groups:
├── my-first-sg     (allows SSH + HTTP)
└── https-security-group  (allows HTTPS)

Combined effect = Union of ALL rules ✅
```

---

## 📊 Common Security Group Patterns

### Web Server
```
INBOUND:
├── HTTP    (80)   → 0.0.0.0/0
├── HTTPS   (443)  → 0.0.0.0/0
└── SSH     (22)   → YOUR-IP/32

OUTBOUND:
└── All Traffic → 0.0.0.0/0
```

### Database Server
```
INBOUND:
└── MySQL (3306) → web-server-sg (SG reference)

OUTBOUND:
└── All Traffic → 0.0.0.0/0
```

### Bastion Host (Jump Server)
```
INBOUND:
└── SSH (22) → YOUR-OFFICE-IP/32

OUTBOUND:
└── SSH (22) → private-instances-sg
```

---

## ⚠️ Common Mistakes & Fixes

```
❌ Problem: Can't SSH to instance
   Fix: Check if port 22 is open in inbound rules
        Check if source is YOUR correct IP
        Check key pair is correct

❌ Problem: Website not loading
   Fix: Check if port 80/443 is open
        Check if web server is actually running

❌ Problem: Security group changes not working
   Fix: Changes apply IMMEDIATELY - no restart needed
        Check you saved the rules

❌ Problem: Using 0.0.0.0/0 for SSH
   Risk: Security risk! Anyone can try to SSH
   Fix: Always restrict SSH to YOUR IP only
```

---

## 🧪 Quick Practice Challenges

```
Challenge 1: 
Create SG that allows ONLY HTTPS (443), block HTTP (80)
Test: HTTP should fail, HTTPS should work

Challenge 2:
Create 2 instances - allow ping (ICMP) between them
but NOT from internet

Challenge 3:
Create a 3-tier architecture:
├── Public SG  → allows 80, 443 from internet
├── App SG     → allows 8080 from Public SG only  
└── DB SG      → allows 3306 from App SG only
```

---

## 🧹 Cleanup (Avoid Charges!)

```
1. Terminate EC2 instances
   EC2 → Instances → Select → Instance State → Terminate

2. Delete Security Groups
   EC2 → Security Groups → Select → Actions → Delete
   (Note: Cannot delete if still attached to instance)
```

---

## 📝 Summary Cheat Sheet

```
Security Groups = Virtual Firewall for EC2

KEY RULES:
├── STATEFUL (return traffic auto-allowed)
├── ALLOW only (no explicit deny)
├── Default: Block ALL inbound, Allow ALL outbound
├── Changes take effect IMMEDIATELY
└── Can reference other Security Groups as source

BEST PRACTICES:
├── Least privilege (open minimum ports)
├── Never open SSH to 0.0.0.0/0
├── Use SG references instead of IPs
├── Add descriptions to all rules
└── Use separate SGs for different tiers
```

---
