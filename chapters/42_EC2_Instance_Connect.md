# 42. EC2 Instance Connect

# AWS EC2 Instance Connect - Complete Guide & Hands-On

## 📚 What is EC2 Instance Connect?

EC2 Instance Connect is a **simple and secure way to connect to your EC2 instances** using SSH through:
- **AWS Management Console** (browser-based)
- **AWS CLI**
- **Standard SSH client**

> It uses **IAM policies** for access control instead of managing SSH keys manually.

---

## 🔑 How It Works

```
User → IAM Authentication → EC2 Instance Connect API
                                      ↓
                          Pushes temporary SSH key (60 seconds)
                                      ↓
                          EC2 Instance ← SSH Connection Established
```

**Key Points:**
- Temporary public key is pushed to instance for **60 seconds**
- No need to manage/store SSH key pairs
- Works only with **Linux instances**
- Requires **EC2 Instance Connect package** installed on instance

---

## ✅ Prerequisites

| Requirement | Details |
|-------------|---------|
| OS Support | Amazon Linux 2, Amazon Linux 2023, Ubuntu 16.04+ |
| Security Group | Port **22 (SSH)** must be open |
| IAM Permission | `ec2-instance-connect:SendSSHPublicKey` |
| Instance | Must have Instance Connect agent installed |

---

## 🛠️ HANDS-ON PRACTICE

### **Step 1: Launch an EC2 Instance**

```
AWS Console → EC2 → Launch Instance
```

**Configure:**
```
Name           : MyTestInstance
AMI            : Amazon Linux 2023 (Free Tier)
Instance Type  : t2.micro (Free Tier)
Key Pair       : Proceed without key pair ✅ (we use Instance Connect)
```

**Network Settings:**
```
✅ Allow SSH traffic from: Anywhere (0.0.0.0/0)
   OR
✅ Custom: EC2 Instance Connect IP ranges (more secure)
```

---

### **Step 2: Connect via Browser Console**

```
EC2 Dashboard
    → Select your Instance
    → Click "Connect" button (top right)
    → Choose "EC2 Instance Connect" tab
    → Username: ec2-user (Amazon Linux) or ubuntu (Ubuntu)
    → Click "Connect"
```

**You'll see a browser terminal! 🎉**

---

### **Step 3: Practice Commands After Connecting**

```bash
# Check who you are
whoami

# Check system info
uname -a

# Update packages
sudo yum update -y        # Amazon Linux
# sudo apt update -y      # Ubuntu

# Check disk space
df -h

# Check memory
free -m

# See running processes
top

# Create a test file
echo "Hello from EC2!" > myfile.txt
cat myfile.txt

# Check instance metadata
curl http://169.254.169.254/latest/meta-data/instance-id
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

---

### **Step 4: Connect via AWS CLI**

**Install & Configure AWS CLI first:**
```bash
# Configure CLI
aws configure
# Enter: Access Key, Secret Key, Region, Output format
```

**Connect using CLI:**
```bash
# Method 1: Using EC2 Instance Connect CLI
pip install ec2instanceconnectcli

# Connect command
mssh ec2-user@<instance-id>

# Example
mssh ec2-user@i-1234567890abcdef0
```

**Or using AWS CLI + SSH:**
```bash
# Step 1: Send SSH public key
aws ec2-instance-connect send-ssh-public-key \
    --instance-id i-1234567890abcdef0 \
    --availability-zone us-east-1a \
    --instance-os-user ec2-user \
    --ssh-public-key file://~/.ssh/id_rsa.pub

# Step 2: SSH into instance (within 60 seconds!)
ssh -i ~/.ssh/id_rsa ec2-user@<public-ip>
```

---

### **Step 5: IAM Policy for EC2 Instance Connect**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ec2-instance-connect:SendSSHPublicKey",
            "Resource": "arn:aws:ec2:us-east-1:123456789:instance/i-1234567890abcdef0",
            "Condition": {
                "StringEquals": {
                    "ec2:osuser": "ec2-user"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": "ec2:DescribeInstances",
            "Resource": "*"
        }
    ]
}
```

---

## 🔒 Security Group Rules

### ✅ More Secure - Allow only AWS IP ranges:
```
Type     : SSH
Protocol : TCP
Port     : 22
Source   : 18.206.107.24/29   (us-east-1 example)
```

**Find your region's IP range:**
```bash
# AWS publishes all IP ranges
curl https://ip-ranges.amazonaws.com/ip-ranges.json | \
grep -A2 "EC2_INSTANCE_CONNECT"
```

---

## 📊 EC2 Instance Connect vs Other Methods

| Feature | Instance Connect | SSH Key Pair | Session Manager |
|---------|-----------------|--------------|-----------------|
| Key Management | ❌ Not needed | ✅ Required | ❌ Not needed |
| Port 22 Required | ✅ Yes | ✅ Yes | ❌ No |
| Browser Access | ✅ Yes | ❌ No | ✅ Yes |
| IAM Control | ✅ Yes | ❌ No | ✅ Yes |
| Audit Logging | ⚠️ Limited | ❌ No | ✅ CloudTrail |
| Cost | Free | Free | Free |

---

## 🚨 Common Issues & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| Connection failed | Port 22 blocked | Add SSH rule to Security Group |
| Permission denied | IAM policy missing | Add `SendSSHPublicKey` permission |
| Not supported | Wrong AMI | Use Amazon Linux 2/2023 or Ubuntu |
| Timeout | Instance not running | Check instance state |

---

## 🎯 Practice Challenges

```
Challenge 1: Connect using browser console ✅
Challenge 2: Check instance metadata using curl
Challenge 3: Install Apache web server
Challenge 4: Create IAM user with limited EC2 access
Challenge 5: Try connecting without Port 22 (see error)
Challenge 6: Connect using AWS CLI
```

### **Challenge 3 Solution - Install Apache:**
```bash
# After connecting via Instance Connect
sudo yum install httpd -y
sudo systemctl start httpd
sudo systemctl enable httpd
echo "<h1>Hello from EC2!</h1>" | sudo tee /var/www/html/index.html

# Now open browser: http://<your-public-ip>
# (Make sure port 80 is open in Security Group)
```

---

## 💡 Key Exam Tips (AWS Certification)

```
✅ Instance Connect = Temporary SSH keys (60 sec validity)
✅ No permanent key pair needed
✅ Requires port 22 open
✅ Works with Amazon Linux & Ubuntu
✅ IAM controls who can connect
✅ Different from Session Manager (no port 22 needed for SSM)
```

---

## 🧹 Cleanup (Avoid Charges)

```
EC2 → Instances → Select Instance
    → Instance State → Terminate Instance
```

---

## 📝 Summary

```
EC2 Instance Connect
├── Browser-based SSH (easiest)
├── AWS CLI connection
├── Temporary keys (secure)
├── IAM-controlled access
└── No key pair management needed
```

---


