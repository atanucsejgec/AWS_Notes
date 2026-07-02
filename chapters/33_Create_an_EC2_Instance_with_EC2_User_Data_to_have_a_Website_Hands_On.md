# 33. Create an EC2 Instance with EC2 User Data to have a Website Hands On

# EC2 Instance with User Data - Website Hosting

## 🎯 What You'll Learn
- Launch an EC2 Instance
- Use **EC2 User Data** to automatically install a web server
- Access your website from the browser

---

## 📚 Concept First

### What is EC2 User Data?
- A **script that runs automatically** when EC2 instance starts for the **first time**
- Runs as **root user** (no need for `sudo`)
- Used to **automate** software installation, configuration
- Runs **only once** at initial launch

```
EC2 Launches → User Data Script Runs → Web Server Installed → Website Ready!
```

---

## 🛠️ Hands-On Practice

### Step 1: Go to EC2 Console
```
AWS Console → Search "EC2" → Click "EC2"
→ Click "Launch Instance"
```

---

### Step 2: Configure Your Instance

**Name:**
```
MyFirstWebServer
```

**AMI (Amazon Machine Image):**
```
✅ Select: Amazon Linux 2023 AMI
   (Free tier eligible)
```

**Instance Type:**
```
✅ Select: t2.micro
   (Free tier eligible)
```

**Key Pair:**
```
Option 1: Create new key pair → Name it "my-ec2-key"
Option 2: "Proceed without key pair" (OK for this lab)
```

---

### Step 3: Network Settings

```
✅ Allow SSH traffic from: Anywhere (0.0.0.0/0)
✅ Allow HTTP traffic from: Anywhere (0.0.0.0/0)  ← IMPORTANT!
```

> ⚠️ **HTTP must be checked** so browser can reach your website!

---

### Step 4: Add User Data Script ⭐ KEY STEP

```
Scroll down → Find "Advanced Details"
→ Scroll to bottom → Find "User Data" text box
→ Paste this script:
```

```bash
#!/bin/bash
# Update all packages
yum update -y

# Install Apache Web Server
yum install -y httpd

# Start Apache service
systemctl start httpd

# Enable Apache to start on reboot
systemctl enable httpd

# Create a simple HTML webpage
echo "<html>
<head>
    <title>My First AWS Website</title>
    <style>
        body {
            background-color: #232F3E;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }
        h1 { color: #FF9900; font-size: 50px; }
        p  { font-size: 20px; }
        .box {
            background-color: #37475A;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <h1>🚀 Hello from AWS EC2!</h1>
    <div class='box'>
        <p>✅ Web Server is Running!</p>
        <p>📍 Region: us-east-1</p>
        <p>⚡ Powered by Amazon Linux + Apache</p>
        <p>🎓 I am Learning AWS!</p>
    </div>
</body>
</html>" > /var/www/html/index.html
```

---

### Step 5: Launch Instance
```
Click "Launch Instance" → Click "View Instances"
Wait 2-3 minutes for status = ✅ "Running"
```

---

### Step 6: Access Your Website

```
1. Click your Instance
2. Copy "Public IPv4 address"
   Example: 54.123.456.789

3. Open NEW browser tab
4. Type: http://54.123.456.789
          ^^^^
          Use HTTP not HTTPS!
```

> 🎉 You should see your website!

---

## 🔍 Verify User Data Ran Successfully

### Connect via EC2 Instance Connect:
```
Select Instance → Click "Connect" → "EC2 Instance Connect" → Connect
```

### Run these commands to verify:
```bash
# Check if Apache is running
systemctl status httpd

# Check if website file exists
cat /var/www/html/index.html

# Check user data log
cat /var/log/cloud-init-output.log

# Check Apache logs
cat /var/log/httpd/access_log
```

---

## 🗺️ Architecture Overview

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   Your Browser  │
              │  http://IP:80   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Security Group  │
              │  Port 80 = OPEN  │
              └────────┬────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │        EC2 Instance         │
         │  ┌───────────────────────┐  │
         │  │   Apache Web Server   │  │
         │  │   (httpd) Port 80     │  │
         │  └───────────────────────┘  │
         │  ┌───────────────────────┐  │
         │  │  /var/www/html/       │  │
         │  │  index.html           │  │
         │  └───────────────────────┘  │
         └─────────────────────────────┘
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| Website not loading | Check HTTP is allowed in Security Group |
| Using `https://` | Change to `http://` |
| Instance not starting | Check you selected Free Tier region |
| Page loads but empty | Check User Data script was pasted correctly |
| Timeout error | Wait 2-3 more minutes, instance still booting |

---

## 🧪 Extra Practice Challenges

### Challenge 1: Show Instance Metadata
```bash
# Add this to your User Data to show instance info on webpage
EC2_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
EC2_AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)

echo "<p>Instance ID: $EC2_ID</p>" >> /var/www/html/index.html
echo "<p>AZ: $EC2_AZ</p>" >> /var/www/html/index.html
```

### Challenge 2: Install Nginx Instead
```bash
#!/bin/bash
yum update -y
amazon-linux-extras install nginx1 -y   # Amazon Linux 2
systemctl start nginx
systemctl enable nginx
echo "<h1>Hello from Nginx!</h1>" > /usr/share/nginx/html/index.html
```

---

## 💰 Cost Reminder - Clean Up!

```
When done practicing:
EC2 Console → Select Instance
→ Instance State → TERMINATE

✅ Avoids unexpected charges!
```

---

## 📝 Key Takeaways

```
✅ User Data = Bootstrap script (runs once at launch)
✅ Must allow Port 80 (HTTP) in Security Group
✅ Use http:// NOT https://
✅ User Data runs as ROOT user
✅ Check /var/log/cloud-init-output.log for debugging
✅ Apache files live in /var/www/html/
```

---
# How to Stop an EC2 Instance

## 🛑 3 Ways to Stop EC2 Instance

---

## Method 1: AWS Console (Easiest) ✅

```
Step 1: Go to AWS Console → EC2
Step 2: Click "Instances" (left sidebar)
Step 3: Select your Instance (checkbox ✅)
Step 4: Click "Instance State" button (top right)
Step 5: Click "Stop Instance"
Step 6: Confirm → Click "Stop"
```

```
Instance State Changes:
Running ✅ → Stopping ⏳ → Stopped 🔴
(takes about 1-2 minutes)
```

---

## ⚠️ Stop vs Terminate - IMPORTANT DIFFERENCE!

| Action | What Happens | Data Saved? | Can Restart? | Cost |
|--------|-------------|-------------|--------------|------|
| **Stop** | Instance paused | ✅ YES | ✅ YES | No compute cost |
| **Terminate** | Instance DELETED | ❌ NO | ❌ NO | Nothing |
| **Reboot** | Restart instance | ✅ YES | ✅ YES | Still running |

> ⚠️ **NEVER click Terminate** unless you want to DELETE it forever!

---

## Method 2: Right Click

```
EC2 Console → Instances
→ Right Click on your Instance
→ Click "Stop Instance"
→ Confirm
```

---

## Method 3: AWS CLI Command

```bash
# Stop Instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Check Status
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# Start Again
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

---

## 🔄 Start Instance Again

```
Select Stopped Instance
→ Click "Instance State"
→ Click "Start Instance"

Stopped 🔴 → Pending ⏳ → Running ✅
```

> ⚠️ **Note:** Public IP address CHANGES when you restart!
> Get the NEW IP from console each time!

---

## 💰 Cost After Stopping

```
Instance Stopped:
✅ No EC2 compute charges
✅ No CPU charges

Still Charges:
⚠️  EBS Storage (very small cost ~$0.10/GB/month)
⚠️  Elastic IP (if attached but not in use)
```

---

## 🧹 Complete Cleanup (No charges at all)

```
If done practicing completely:
→ Select Instance
→ Instance State
→ TERMINATE ← Deletes everything, zero cost
```

---

## 📝 Quick Summary

```
Just taking a break?    → STOP   ✅
Done forever?           → TERMINATE ✅
Something went wrong?   → REBOOT ✅
```

---

**Remember: STOP = Pause | TERMINATE = Delete Forever! 🎯**




