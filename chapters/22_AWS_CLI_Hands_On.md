# 22. AWS CLI Hands On

# AWS CLI - Complete Learning Guide with Hands-On Practice

## 📌 What is AWS CLI?
AWS CLI (Command Line Interface) is a tool that lets you **interact with AWS services using commands** in your terminal instead of using the AWS Console.

---

## 🛠️ STEP 1: Installation

### Windows
```bash
# Download and run the installer
https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify installation
aws --version
```

### Mac
```bash
brew install awscli

# Verify
aws --version
```

### Linux
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

---

## 🔐 STEP 2: Configure AWS CLI

```bash
aws configure
```

### It will ask 4 things:
```
AWS Access Key ID     : YOUR_ACCESS_KEY
AWS Secret Access Key : YOUR_SECRET_KEY
Default region name   : us-east-1
Default output format : json
```

### Where to get Access Keys?
```
AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key
```

### Check your configuration:
```bash
aws configure list
cat ~/.aws/credentials
cat ~/.aws/config
```

---

## 🧪 STEP 3: Hands-On Practice

---

### ✅ PRACTICE 1: Basic Commands

```bash
# Check your identity
aws sts get-caller-identity

# List all regions
aws ec2 describe-regions --output table

# List available services
aws help
```

---

### ✅ PRACTICE 2: S3 (Simple Storage Service)

```bash
# Create a bucket
aws s3 mb s3://my-practice-bucket-12345

# List all buckets
aws s3 ls

# Create a test file
echo "Hello AWS CLI" > test.txt

# Upload file to S3
aws s3 cp test.txt s3://my-practice-bucket-12345/

# List files in bucket
aws s3 ls s3://my-practice-bucket-12345/

# Download file from S3
aws s3 cp s3://my-practice-bucket-12345/test.txt downloaded.txt

# Sync a folder to S3
aws s3 sync ./my-folder s3://my-practice-bucket-12345/my-folder

# Delete a file from S3
aws s3 rm s3://my-practice-bucket-12345/test.txt

# Delete the bucket (must be empty first)
aws s3 rb s3://my-practice-bucket-12345 --force
```

---

### ✅ PRACTICE 3: EC2 (Virtual Machines)

```bash
# List all EC2 instances
aws ec2 describe-instances

# List instances in table format
aws ec2 describe-instances --output table

# List only running instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --output table

# List available AMIs (Amazon Linux)
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=amzn2-ami-hvm-*" \
  --query "Images[0].ImageId" \
  --output text

# Create a Key Pair
aws ec2 create-key-pair \
  --key-name MyKeyPair \
  --query "KeyMaterial" \
  --output text > MyKeyPair.pem

# Set permissions for key
chmod 400 MyKeyPair.pem

# Launch an EC2 instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t2.micro \
  --key-name MyKeyPair \
  --count 1

# Stop an instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start an instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Terminate (delete) an instance
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Describe instance status
aws ec2 describe-instance-status --instance-ids i-1234567890abcdef0
```

---

### ✅ PRACTICE 4: IAM (Identity and Access Management)

```bash
# List all users
aws iam list-users

# List all groups
aws iam list-groups

# List all roles
aws iam list-roles

# Create a new user
aws iam create-user --user-name TestUser

# Create access key for user
aws iam create-access-key --user-name TestUser

# Attach a policy to user
aws iam attach-user-policy \
  --user-name TestUser \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# List attached policies
aws iam list-attached-user-policies --user-name TestUser

# Delete a user
aws iam delete-user --user-name TestUser
```

---

### ✅ PRACTICE 5: Output Formats

```bash
# JSON output (default)
aws s3 ls --output json

# Table output (easy to read)
aws s3 ls --output table

# Text output
aws s3 ls --output text

# YAML output
aws s3 ls --output yaml
```

---

### ✅ PRACTICE 6: Query & Filter (Very Important!)

```bash
# Get only instance IDs
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text

# Get instance ID and State
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name]" \
  --output table

# Get S3 bucket names only
aws s3api list-buckets \
  --query "Buckets[*].Name" \
  --output text

# Filter running instances only
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text
```

---

### ✅ PRACTICE 7: Multiple Profiles

```bash
# Configure a second profile
aws configure --profile myprofile

# Use a specific profile
aws s3 ls --profile myprofile

# Set default profile
export AWS_PROFILE=myprofile

# List all profiles
aws configure list-profiles
```

---

## 📊 Common CLI Structure

```
aws  <service>  <command>  [options]
 |       |          |
 |       |          └── --output table
 |       └──────────── s3, ec2, iam, rds...
 └──────────────────── always "aws"
```

---

## 🎯 Quick Reference Cheat Sheet

| Service | Command | Purpose |
|---------|---------|---------|
| S3 | `aws s3 ls` | List buckets |
| S3 | `aws s3 cp` | Copy files |
| EC2 | `aws ec2 describe-instances` | List instances |
| IAM | `aws iam list-users` | List users |
| STS | `aws sts get-caller-identity` | Who am I? |
| CLI | `aws configure` | Setup credentials |

---

## 🚀 Practice Projects

### Project 1 - Simple Backup Script
```bash
#!/bin/bash
# backup.sh
BUCKET="my-backup-bucket-$(date +%Y%m%d)"
aws s3 mb s3://$BUCKET
aws s3 sync ./important-files s3://$BUCKET/
echo "Backup completed to $BUCKET"
```

### Project 2 - List all resources
```bash
#!/bin/bash
echo "=== S3 Buckets ==="
aws s3 ls

echo "=== EC2 Instances ==="
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]" \
  --output table

echo "=== IAM Users ==="
aws iam list-users --query "Users[*].UserName" --output table
```

---

## ⚠️ Important Tips

```
✅ Always use --dry-run for EC2 operations to test first
✅ Use --output table for easy reading
✅ Use --query to filter specific data
✅ Never share your Access Keys
✅ Use IAM roles instead of access keys when possible
✅ Set up MFA for security
```

---




