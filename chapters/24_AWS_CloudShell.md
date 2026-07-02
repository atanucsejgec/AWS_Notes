# 24. AWS CloudShell

# AWS CloudShell - Complete Guide with Hands-On Practice

## 📌 What is AWS CloudShell?

```
AWS CloudShell is a FREE browser-based shell environment
provided by AWS directly in the AWS Console.

No Installation Needed!
No Configuration Needed!
Already authenticated with your AWS account!
```

---

## 🌟 Why Use CloudShell?

| Feature | CloudShell | Local CLI |
|---------|-----------|-----------|
| Installation | ❌ Not needed | ✅ Required |
| Configuration | ❌ Not needed | ✅ Required |
| Cost | ✅ FREE | ✅ FREE |
| Access Keys | ❌ Not needed | ✅ Required |
| Internet Access | ✅ Yes | ✅ Yes |
| Storage | ✅ 1GB Free | Unlimited |
| Pre-installed Tools | ✅ Many | ❌ Manual |

---

## 🚀 STEP 1: How to Open CloudShell

```
Method 1: AWS Console → Top Navigation Bar → CloudShell Icon (>_)
Method 2: AWS Console → Search "CloudShell"
Method 3: Direct URL → https://console.aws.amazon.com/cloudshell
```

### CloudShell Icon Location:
```
┌─────────────────────────────────────────────┐
│ AWS Console                    🔔 ⚙️ >_  👤 │
│                                      ↑       │
│                               CloudShell     │
└─────────────────────────────────────────────┘
```

---

## 🛠️ STEP 2: CloudShell Environment

### Pre-installed Tools:
```bash
# Check AWS CLI version
aws --version

# Check Python version
python3 --version

# Check Node.js version
node --version

# Check Git version
git --version

# Check pip version
pip3 --version

# Check bash version
bash --version
```

### Check Your Identity (Already Authenticated!):
```bash
aws sts get-caller-identity
```
Output:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourName"
}
```

---

## 🎯 STEP 3: CloudShell Interface

```
┌────────────────────────────────────────────────────┐
│  AWS CloudShell                    [Actions ▼] [+] │
├────────────────────────────────────────────────────┤
│                                                    │
│  [cloudshell-user@ip ~]$                          │
│                                                    │
│                                                    │
│                                                    │
│                                                    │
└────────────────────────────────────────────────────┘

Actions Menu:
├── New Tab
├── Split into rows
├── Split into columns
├── Download file
├── Upload file
└── Restart CloudShell
```

---

## 🧪 STEP 4: Hands-On Practice

---

### ✅ PRACTICE 1: Basic CloudShell Commands

```bash
# Who am I?
aws sts get-caller-identity

# What region am I in?
aws configure get region

# List all regions
aws ec2 describe-regions --output table

# Check available disk space
df -h

# Check home directory
ls -la ~

# CloudShell home directory (1GB persistent storage)
pwd
# Output: /home/cloudshell-user
```

---

### ✅ PRACTICE 2: S3 Operations

```bash
# List all S3 buckets
aws s3 ls

# Create a new S3 bucket
aws s3 mb s3://my-cloudshell-bucket-$(date +%s)

# Create a test file in CloudShell
echo "Hello from CloudShell!" > cloudshell-test.txt
cat cloudshell-test.txt

# Upload file to S3
aws s3 cp cloudshell-test.txt s3://my-cloudshell-bucket-12345/

# List files in bucket
aws s3 ls s3://my-cloudshell-bucket-12345/

# Create multiple files
for i in {1..5}; do
  echo "File $i content" > file$i.txt
  aws s3 cp file$i.txt s3://my-cloudshell-bucket-12345/
done

# List all uploaded files
aws s3 ls s3://my-cloudshell-bucket-12345/

# Download file from S3
aws s3 cp s3://my-cloudshell-bucket-12345/cloudshell-test.txt downloaded.txt
cat downloaded.txt

# Delete all files and bucket
aws s3 rb s3://my-cloudshell-bucket-12345 --force
```

---

### ✅ PRACTICE 3: EC2 Operations

```bash
# List all EC2 instances
aws ec2 describe-instances --output table

# List only running instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name]" \
  --output table

# Get latest Amazon Linux 2 AMI ID
aws ec2 describe-images \
  --owners amazon \
  --filters \
    "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
    "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text

# List all key pairs
aws ec2 describe-key-pairs --output table

# Create a key pair
aws ec2 create-key-pair \
  --key-name CloudShellKey \
  --query "KeyMaterial" \
  --output text > CloudShellKey.pem

chmod 400 CloudShellKey.pem
ls -la CloudShellKey.pem

# List security groups
aws ec2 describe-security-groups \
  --query "SecurityGroups[*].[GroupId,GroupName,Description]" \
  --output table

# List VPCs
aws ec2 describe-vpcs \
  --query "Vpcs[*].[VpcId,CidrBlock,IsDefault]" \
  --output table

# List Subnets
aws ec2 describe-subnets \
  --query "Subnets[*].[SubnetId,VpcId,CidrBlock,AvailabilityZone]" \
  --output table
```

---

### ✅ PRACTICE 4: IAM Operations

```bash
# List all IAM users
aws iam list-users \
  --query "Users[*].[UserName,UserId,CreateDate]" \
  --output table

# List all IAM roles
aws iam list-roles \
  --query "Roles[*].[RoleName,RoleId]" \
  --output table

# List all IAM groups
aws iam list-groups \
  --query "Groups[*].[GroupName,GroupId]" \
  --output table

# List all policies
aws iam list-policies \
  --scope Local \
  --output table

# Get current user details
aws iam get-user

# List access keys
aws iam list-access-keys

# Check password policy
aws iam get-account-password-policy
```

---

### ✅ PRACTICE 5: File Upload/Download in CloudShell

```bash
# Upload file TO CloudShell:
# Actions → Upload file → Select file from your computer

# Download file FROM CloudShell:
# Actions → Download file → Enter file path

# Example - Create a file and download it
echo "This is my report" > my-report.txt
# Then: Actions → Download → /home/cloudshell-user/my-report.txt

# View all files in home directory
ls -la ~/
```

---

### ✅ PRACTICE 6: Writing Scripts in CloudShell

```bash
# Create a script file
cat > aws-report.sh << 'EOF'
#!/bin/bash
echo "==============================="
echo "    AWS ACCOUNT REPORT"
echo "==============================="
echo ""

echo "📋 Account Identity:"
aws sts get-caller-identity
echo ""

echo "🪣 S3 Buckets:"
aws s3 ls
echo ""

echo "💻 EC2 Instances:"
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]" \
  --output table
echo ""

echo "👤 IAM Users:"
aws iam list-users \
  --query "Users[*].UserName" \
  --output table
echo ""

echo "==============================="
echo "    REPORT COMPLETE"
echo "==============================="
EOF

# Make it executable
chmod +x aws-report.sh

# Run the script
./aws-report.sh
```

---

### ✅ PRACTICE 7: Install Additional Tools

```bash
# Install Python packages
pip3 install boto3

# Test boto3
python3 << 'EOF'
import boto3

s3 = boto3.client('s3')
response = s3.list_buckets()
print("S3 Buckets:")
for bucket in response['Buckets']:
    print(f"  - {bucket['Name']}")
EOF

# Install jq (JSON processor)
sudo yum install -y jq    # Amazon Linux
# or
sudo apt install -y jq    # Ubuntu

# Use jq to format output
aws s3api list-buckets | jq '.Buckets[].Name'

# Install wget
sudo yum install -y wget
```

---

### ✅ PRACTICE 8: Multiple Tabs & Split Screen

```bash
# Tab 1 - Work with S3
aws s3 ls

# Tab 2 - Work with EC2
aws ec2 describe-instances

# Split Screen - Monitor while working
# Actions → Split into rows
# OR
# Actions → Split into columns
```

---

### ✅ PRACTICE 9: CloudShell with Different Regions

```bash
# Check current region
aws configure get region

# Use different region temporarily
aws s3 ls --region us-west-2
aws ec2 describe-instances --region eu-west-1
aws ec2 describe-instances --region ap-south-1

# List EC2 instances in ALL regions
for region in $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text); do
  echo "=== Region: $region ==="
  aws ec2 describe-instances \
    --region $region \
    --query "Reservations[*].Instances[*].[InstanceId,State.Name]" \
    --output text
done
```

---

### ✅ PRACTICE 10: CloudShell Persistent Storage

```bash
# CloudShell gives 1GB persistent storage
# Files in home directory PERSIST between sessions!

# Create a folder structure
mkdir -p ~/projects/aws-practice
mkdir -p ~/scripts
mkdir -p ~/configs

# Save your work
echo "My AWS notes" > ~/projects/notes.txt

# Next time you open CloudShell, files are still there!
ls ~/projects/
```

---

## 📊 CloudShell vs CloudShell Features

```
┌─────────────────────────────────────────┐
│           CloudShell Features           │
├─────────────────────────────────────────┤
│  ✅ Free to use                         │
│  ✅ 1GB persistent storage              │
│  ✅ Pre-authenticated                   │
│  ✅ AWS CLI pre-installed               │
│  ✅ Python, Node.js, Git included       │
│  ✅ Multiple tabs support               │
│  ✅ Split screen support                │
│  ✅ File upload/download                │
│  ✅ Available in most regions           │
│  ❌ No sudo for some operations         │
│  ❌ Session timeout after inactivity    │
│  ❌ Limited compute resources           │
└─────────────────────────────────────────┘
```

---

## ⚡ Useful CloudShell Shortcuts

```bash
# Clear screen
clear
# or Ctrl + L

# Command history
history

# Search history
Ctrl + R

# Auto complete
Tab key

# Cancel command
Ctrl + C

# Previous command
↑ Arrow key
```

---

## 🎯 Quick Practice Challenge

```bash
# Challenge: Do all these in CloudShell!

# 1. Check your account ID
aws sts get-caller-identity --query Account --output text

# 2. Create an S3 bucket with your name
aws s3 mb s3://yourname-cloudshell-$(date +%s)

# 3. Upload a file
echo "CloudShell Practice" > practice.txt
aws s3 cp practice.txt s3://your-bucket-name/

# 4. List EC2 instances
aws ec2 describe-instances --output table

# 5. List IAM users
aws iam list-users --output table

# 6. Clean up
aws s3 rb s3://your-bucket-name --force
```

---

## ⚠️ Important Notes

```
✅ CloudShell is FREE (no extra charges)
✅ Charges only for AWS resources you CREATE
✅ Session expires after 20 mins of inactivity
✅ 1GB storage is FREE and persistent
✅ Available in specific AWS regions only
⚠️ Don't store sensitive data in CloudShell
⚠️ Storage is per-region (not shared across regions)
```

---




