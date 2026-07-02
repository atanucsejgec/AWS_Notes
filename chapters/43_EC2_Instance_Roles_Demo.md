# 43. EC2 Instance Roles Demo


# AWS EC2 Instance Roles - Complete Guide & Hands-On Practice

## 🎯 What is an EC2 Instance Role?

An **EC2 Instance Role** is an IAM Role attached to an EC2 instance that grants the instance **temporary credentials** to access AWS services **without hardcoding Access Keys**.

---

## 📊 Why Use EC2 Instance Roles?

```
❌ BAD WAY (Never do this!)
EC2 Instance → Hardcoded Access Keys → AWS Services

✅ GOOD WAY (Best Practice)
EC2 Instance → IAM Role → Temporary Credentials → AWS Services
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           EC2 Instance                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     IAM Instance Profile        │   │
│  │   ┌─────────────────────────┐   │   │
│  │   │      IAM Role           │   │   │
│  │   │  ┌─────────────────┐    │   │   │
│  │   │  │  IAM Policies   │    │   │   │
│  │   │  │  - S3 Access    │    │   │   │
│  │   │  │  - DynamoDB     │    │   │   │
│  │   │  │  - etc...       │    │   │   │
│  │   │  └─────────────────┘    │   │   │
│  │   └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         ▼
   AWS Services (S3, DynamoDB, etc.)
```

---

## 🛠️ HANDS-ON PRACTICE

### **Step 1: Create an IAM Role for EC2**

#### Go to IAM Console
```
AWS Console → IAM → Roles → Create Role
```

#### Configure the Role
```
Step 1: Select Trusted Entity
├── Trusted entity type: AWS Service
├── Service: EC2
└── Click "Next"

Step 2: Add Permissions
├── Search: "AmazonS3ReadOnlyAccess"
├── ✅ Check the policy
└── Click "Next"

Step 3: Name the Role
├── Role name: MyEC2-S3-ReadOnly-Role
├── Description: Allows EC2 to read S3
└── Click "Create Role"
```

---

### **Step 2: Launch an EC2 Instance**

```
AWS Console → EC2 → Launch Instance

Configuration:
├── Name: MyEC2-Role-Demo
├── AMI: Amazon Linux 2023
├── Instance Type: t2.micro (Free Tier)
├── Key Pair: Create new or use existing
├── Security Group: Allow SSH (port 22)
└── Advanced Details:
    └── IAM Instance Profile: MyEC2-S3-ReadOnly-Role ← IMPORTANT!
```

---

### **Step 3: Connect to EC2 Instance**

```bash
# Option 1: SSH from your terminal
ssh -i "your-key.pem" ec2-user@<your-ec2-public-ip>

# Option 2: Use EC2 Instance Connect (Browser)
AWS Console → EC2 → Select Instance → Connect → EC2 Instance Connect
```

---

### **Step 4: Test the IAM Role**

```bash
# ✅ Check AWS CLI is installed
aws --version

# ✅ Check who you are (should show the role!)
aws sts get-caller-identity

# Expected Output:
# {
#     "UserId": "AROAXXXXXXXXXX:i-1234567890abcdef0",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/MyEC2-S3-ReadOnly-Role/i-1234567890"
# }

# ✅ List S3 Buckets (should work!)
aws s3 ls

# ✅ Try to list IAM Users (should FAIL - no permission!)
aws iam list-users
# Error: Access Denied ← This is correct behavior!
```

---

### **Step 5: Check Temporary Credentials**

```bash
# See the temporary credentials provided by the role
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Get the role name
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/MyEC2-S3-ReadOnly-Role

# Output shows:
# {
#   "Code" : "Success",
#   "LastUpdated" : "2024-01-15T10:00:00Z",
#   "Type" : "AWS-HMAC",
#   "AccessKeyId" : "ASIA...",      ← Temporary!
#   "SecretAccessKey" : "xxx...",   ← Temporary!
#   "Token" : "xxx...",             ← Session Token
#   "Expiration" : "2024-01-15T16:00:00Z"  ← Auto-rotated!
# }
```

---

### **Step 6: Attach Role to Existing Instance**

```
# If you forgot to attach role during launch:

AWS Console → EC2 → Select Instance
→ Actions → Security → Modify IAM Role
→ Select Role → Update IAM Role
```

---

## 🔄 Compare: With Role vs Without Role

```bash
# ❌ WITHOUT ROLE (Bad Practice)
# You would need to run:
aws configure
# AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG
# These keys are STATIC and DANGEROUS!

# ✅ WITH ROLE (Best Practice)
# No configuration needed!
# Just run AWS commands directly:
aws s3 ls
# Works automatically with temporary credentials!
```

---

## 📋 Practice Exercises

### **Exercise 1: Basic Role Testing**
```bash
# Test what you CAN do
aws s3 ls                                    # ✅ Should work
aws s3 ls s3://your-bucket-name              # ✅ Should work

# Test what you CANNOT do  
aws s3 mb s3://test-bucket-12345             # ❌ Should fail
aws ec2 describe-instances                   # ❌ Should fail
aws iam list-users                           # ❌ Should fail
```

### **Exercise 2: Add More Permissions**
```
IAM → Roles → MyEC2-S3-ReadOnly-Role
→ Add Permissions → Attach Policies
→ Add: AmazonEC2ReadOnlyAccess
→ Now test: aws ec2 describe-instances  ✅
```

### **Exercise 3: Create Custom Policy**
```json
// IAM → Policies → Create Policy
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::my-specific-bucket",
                "arn:aws:s3:::my-specific-bucket/*"
            ]
        }
    ]
}
```

---

## 🎯 Key Concepts Summary

| Concept | Details |
|---------|---------|
| **IAM Role** | Permission set for EC2 |
| **Instance Profile** | Container that holds the Role |
| **Temp Credentials** | Auto-rotated every few hours |
| **Metadata URL** | `169.254.169.254` - Internal only |
| **No Config Needed** | AWS CLI auto-detects role |

---

## ⚠️ Important Rules

```
✅ DO:
├── Always use IAM Roles for EC2
├── Follow Least Privilege Principle
├── Use specific resource ARNs in policies
└── Regularly audit role permissions

❌ NEVER:
├── Store Access Keys on EC2 instances
├── Run "aws configure" on EC2
├── Give Admin access to EC2 roles
└── Share credentials between instances
```

---

## 🧹 Cleanup (Avoid Charges!)

```
1. Terminate EC2 Instance
   EC2 → Instances → Select → Instance State → Terminate

2. Delete IAM Role (Optional)
   IAM → Roles → MyEC2-S3-ReadOnly-Role → Delete
```

---

## 💡 Quick Reference Commands

```bash
# Check current identity
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# List EC2 instances
aws ec2 describe-instances --region us-east-1

# Check instance metadata
curl http://169.254.169.254/latest/meta-data/

# Check IAM role name on instance
curl http://169.254.169.254/latest/meta-data/iam/info
```

---

## 🎓 What You Learned

```
1. ✅ What EC2 Instance Roles are
2. ✅ Why roles are better than Access Keys
3. ✅ How to create IAM Role for EC2
4. ✅ How to attach role to EC2 instance
5. ✅ How to test permissions
6. ✅ How temporary credentials work
7. ✅ Security best practices
```

---
