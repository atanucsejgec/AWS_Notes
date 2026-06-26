# 12. IAM Users & Groups Hands On

# AWS IAM Users & Groups - Complete Guide & Hands-On

## 📚 Theory First

### What is IAM?
**IAM = Identity and Access Management**
- Controls **WHO** can access AWS resources
- Controls **WHAT** they can do
- **FREE service** - no additional cost
- **Global service** - not region specific

---

### Key Concepts

```
IAM Components:
├── Users      → Individual people/applications
├── Groups     → Collection of users
├── Policies   → JSON documents defining permissions
├── Roles      → For AWS services or temporary access
└── Root User  → Master account (use minimally!)
```

### Users
- Represents a **real person** or **application**
- Has credentials (password / access keys)
- By default → **NO permissions**

### Groups
- Collection of **IAM Users**
- Apply **policies to group** → all users inherit
- User can belong to **multiple groups**
- Groups **CANNOT contain other groups**

### Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "*"
    }
  ]
}
```

---

## 🛠️ HANDS-ON PRACTICE

---

### ✅ Step 1: Login to AWS Console

```
1. Go to → https://console.aws.amazon.com
2. Login with ROOT account
3. Search "IAM" in search bar
4. Click on IAM service
```

> ⚠️ **Best Practice:** Never use Root account for daily work!

---

### ✅ Step 2: Create IAM Groups

**Group 1: Admins**
```
IAM Console → User Groups → Create Group

Group Name  : Admins
Policy      : AdministratorAccess (AWS Managed)
Click       : Create Group
```

**Group 2: Developers**
```
IAM Console → User Groups → Create Group

Group Name  : Developers
Policy      : AmazonEC2FullAccess
              AmazonS3FullAccess
Click       : Create Group
```

**Group 3: ReadOnly**
```
IAM Console → User Groups → Create Group

Group Name  : ReadOnly
Policy      : ReadOnlyAccess (AWS Managed)
Click       : Create Group
```

---

### ✅ Step 3: Create IAM Users

**User 1: admin-user**
```
IAM Console → Users → Create User

Step 1 - User Details:
  Username          : admin-user
  ✅ Check          : Provide console access
  Password          : Custom → Set your password
  ✅ Uncheck        : Must reset password

Step 2 - Permissions:
  Add to Group      : Admins

Step 3 - Review → Create User

💾 SAVE: Download CSV or copy credentials!
```

**User 2: dev-user**
```
IAM Console → Users → Create User

Username          : dev-user
Console access    : Yes
Add to Group      : Developers
Create User
```

**User 3: readonly-user**
```
IAM Console → Users → Create User

Username          : readonly-user
Console access    : Yes
Add to Group      : ReadOnly
Create User
```

---

### ✅ Step 4: Test User Permissions

**Test readonly-user:**
```
1. Open Incognito/Private browser window
2. Go to AWS Console
3. Login as readonly-user
4. Try to create an EC2 instance → ❌ Should FAIL
5. Try to VIEW EC2 instances  → ✅ Should WORK
```

**Test dev-user:**
```
1. Open another Incognito window
2. Login as dev-user
3. Try to create S3 bucket    → ✅ Should WORK
4. Try to create IAM user     → ❌ Should FAIL
```

---

### ✅ Step 5: Create Custom Policy

```
IAM → Policies → Create Policy

Choose: JSON tab

Paste this policy:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEC2ReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:List*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyEC2Delete",
      "Effect": "Deny",
      "Action": [
        "ec2:DeleteInstance",
        "ec2:TerminateInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

```
Policy Name : MyCustomEC2Policy
Description : Allow EC2 read, Deny delete
Click       : Create Policy
```

---

### ✅ Step 6: Set Account Alias

```
IAM Dashboard → Right side panel
→ "Create Alias"
→ Enter: mycompany-aws (unique name)
→ Save

Now Login URL becomes:
https://mycompany-aws.signin.aws.amazon.com/console
```

---

### ✅ Step 7: Enable MFA for Security

```
IAM → Users → admin-user
→ Security Credentials tab
→ Multi-factor authentication (MFA)
→ Assign MFA device
→ Choose: Authenticator App
→ Scan QR with Google Authenticator
→ Enter two consecutive codes
→ Add MFA
```

---

### ✅ Step 8: Check Password Policy

```
IAM → Account Settings → Password Policy

Set:
✅ Minimum length        : 8 characters
✅ Require uppercase
✅ Require lowercase
✅ Require numbers
✅ Require symbols
✅ Password expiration   : 90 days
Save Changes
```

---

### ✅ Step 9: IAM Credential Report

```
IAM → Credential Reports → Download Report

This CSV shows:
- All users
- Password last used
- Access keys status
- MFA enabled or not
```

---

### ✅ Step 10: Cleanup (Important!)

```
Delete in this order:
1. Remove users from groups
2. Delete Users
3. Delete Groups
4. Delete Custom Policies
```

---

## 📊 Summary Table

| Feature | Details |
|---------|---------|
| Root User | Full access, use minimally |
| IAM User | Individual, no permission by default |
| IAM Group | Collection of users |
| Policy | JSON, defines Allow/Deny |
| MFA | Extra security layer |
| Alias | Custom login URL |

---

## 🎯 Key Rules to Remember

```
✅ DO:
- Enable MFA on Root & Admin accounts
- Use Groups to assign permissions
- Follow Least Privilege Principle
- Use password policy
- Review Credential Reports regularly

❌ DON'T:
- Share Root account credentials
- Give more permissions than needed
- Use Root account for daily tasks
- Create access keys for Root user
```

---

## 🧪 Practice Scenarios

```
Scenario 1: New Developer joins team
→ Create User → Add to Developers group
→ Done! ✅

Scenario 2: Developer moves to Manager role
→ Remove from Developers group
→ Add to Admins group
→ Done! ✅

Scenario 3: Employee leaves company
→ Disable/Delete IAM User
→ Done! ✅
```

---

## 📝 Quick Reference Commands (AWS CLI)

```bash
# List all users
aws iam list-users

# List all groups
aws iam list-groups

# Create a user
aws iam create-user --user-name new-user

# Add user to group
aws iam add-user-to-group \
  --user-name new-user \
  --group-name Developers

# List user's groups
aws iam list-groups-for-user --user-name dev-user
```

---

## ✨ What You Learned

```
✅ IAM Basics (Users, Groups, Policies)
✅ Created 3 Groups with different permissions
✅ Created 3 Users with different access levels
✅ Tested permissions in different browsers
✅ Created Custom Policy with JSON
✅ Set Account Alias
✅ Enabled MFA
✅ Set Password Policy
✅ Generated Credential Report
```

---



# 15. IAM Policies Hands On
# AWS IAM Policies - Complete Guide & Hands-On Practice

## 📚 What is an IAM Policy?

An IAM Policy is a **JSON document** that defines **permissions** - what actions are allowed or denied on which AWS resources.

---

## 🏗️ Policy Structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StatementID",
      "Effect": "Allow or Deny",
      "Action": "what actions",
      "Resource": "on which resources",
      "Condition": "when (optional)"
    }
  ]
}
```

### Key Elements Explained:

| Element | Description | Example |
|---------|-------------|---------|
| **Version** | Policy language version | `"2012-10-17"` |
| **Sid** | Statement identifier (optional) | `"AllowS3Read"` |
| **Effect** | Allow or Deny | `"Allow"` |
| **Action** | AWS service actions | `"s3:GetObject"` |
| **Resource** | ARN of resources | `"arn:aws:s3:::my-bucket"` |
| **Condition** | Extra conditions | MFA required, IP range |

---

## 🎯 Types of IAM Policies

```
┌─────────────────────────────────────────────┐
│           IAM Policy Types                  │
├─────────────────┬───────────────────────────┤
│ AWS Managed     │ Created by AWS            │
│                 │ e.g: AdministratorAccess  │
├─────────────────┼───────────────────────────┤
│ Customer Managed│ You create & manage       │
│                 │ Full control              │
├─────────────────┼───────────────────────────┤
│ Inline Policy   │ Attached to single        │
│                 │ user/group/role only      │
└─────────────────┴───────────────────────────┘
```

---

## 🛠️ HANDS-ON PRACTICE

---

### ✅ Lab 1: Create Your First Custom Policy

**Goal:** Create a policy that allows READ-ONLY access to S3

#### Step 1 - Go to IAM Console
```
AWS Console → IAM → Policies → Create Policy
```

#### Step 2 - Use JSON Editor, paste this:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::*",
        "arn:aws:s3:::*/*"
      ]
    }
  ]
}
```

#### Step 3 - Name it
```
Name: MyS3ReadOnlyPolicy
Description: Allows read-only access to all S3 buckets
```

#### Step 4 - Create Policy ✅

---

### ✅ Lab 2: Allow Access to SPECIFIC S3 Bucket Only

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSpecificBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
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

> 💡 Replace `my-specific-bucket` with your actual bucket name

---

### ✅ Lab 3: DENY Policy Example

**Goal:** Allow all EC2 actions BUT deny deleting instances

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAllEC2",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    },
    {
      "Sid": "DenyEC2Delete",
      "Effect": "Deny",
      "Action": [
        "ec2:TerminateInstances",
        "ec2:DeleteSecurityGroup",
        "ec2:DeleteKeyPair"
      ],
      "Resource": "*"
    }
  ]
}
```

> ⚠️ **DENY always wins over ALLOW**

---

### ✅ Lab 4: Policy with CONDITIONS

**Goal:** Allow S3 access ONLY when MFA is enabled

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3WithMFA",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    }
  ]
}
```

---

### ✅ Lab 5: Attach Policy to a User (Practice)

```
Step 1: IAM → Users → Create User
        Name: test-user

Step 2: IAM → Users → test-user
        → Add Permissions
        → Attach Policies Directly
        → Search: MyS3ReadOnlyPolicy
        → Attach ✅

Step 3: Test the user permissions
        → Login with test-user
        → Try to access S3 (should work)
        → Try to delete S3 bucket (should fail)
```

---

### ✅ Lab 6: Policy Simulator (Very Useful!)

```
IAM Console → Policy Simulator
URL: https://policysim.aws.amazon.com

Steps:
1. Select a User/Role
2. Select Service (e.g., S3)
3. Select Action (e.g., DeleteBucket)
4. Click "Run Simulation"
5. See if ALLOWED or DENIED ✅
```

---

## 📋 Common Policy Examples

### EC2 Read Only
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ec2:Describe*",
      "ec2:Get*"
    ],
    "Resource": "*"
  }]
}
```

### Allow User to Change Own Password
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "iam:ChangePassword",
      "iam:GetUser"
    ],
    "Resource": "arn:aws:iam::*:user/${aws:username}"
  }]
}
```

### Restrict to Specific AWS Region
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {
        "aws:RequestedRegion": "us-east-1"
      }
    }
  }]
}
```

---

## 🔑 Key Rules to Remember

```
1. Default = DENY everything
2. Explicit DENY > Explicit ALLOW
3. You need both Action + Resource
4. Use * for wildcards
5. Test with Policy Simulator always!
```

---

## 📝 Practice Tasks for You

```
Task 1: ✍️ Create policy - only list EC2 instances
Task 2: ✍️ Create policy - full access to DynamoDB only
Task 3: ✍️ Create policy - S3 access from specific IP only
Task 4: ✍️ Attach policy to user and test it
Task 5: ✍️ Use Policy Simulator to verify
```

---

## 🎯 Quick Reference - Common Actions

| Service | Action Examples |
|---------|----------------|
| S3 | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` |
| EC2 | `ec2:StartInstances`, `ec2:StopInstances`, `ec2:Describe*` |
| IAM | `iam:CreateUser`, `iam:DeleteUser`, `iam:AttachPolicy` |
| Lambda | `lambda:InvokeFunction`, `lambda:CreateFunction` |
| RDS | `rds:CreateDBInstance`, `rds:DeleteDBInstance` |

---





# 17. IAM MFA Hands On
# AWS IAM MFA - Complete Learning Guide & Hands-On Practice

## 📚 What is MFA?

**Multi-Factor Authentication (MFA)** adds an extra layer of security by requiring:
- **Something you know** → Password
- **Something you have** → MFA device (phone/hardware key)

---

## 🔐 MFA Device Types in AWS

| Type | Example | Description |
|------|---------|-------------|
| **Virtual MFA** | Google Authenticator, Authy | App on your phone |
| **Hardware TOTP** | Gemalto token | Physical device |
| **FIDO Security Key** | YubiKey | USB/NFC key |
| **SMS MFA** | Phone number | Text message (not recommended) |

---

## 🛠️ HANDS-ON PRACTICE

### ✅ Prerequisites
- AWS Account (Free Tier)
- Smartphone with **Google Authenticator** or **Authy** app installed

---

## 📋 STEP 1 - Enable MFA for ROOT Account

### Why Root Account First?
> Root account has **unlimited access** - most important to protect!

**Steps:**
```
1. Login to AWS Console as ROOT user
2. Click your Account Name (top right)
3. Click "Security Credentials"
4. Scroll to "Multi-factor authentication (MFA)"
5. Click "Assign MFA device"
```

```
6. Enter Device Name → example: "my-root-mfa"
7. Select "Authenticator app"
8. Click "Next"
```

```
9. Open Google Authenticator on phone
10. Click "+" → "Scan QR code"
11. Scan the QR code shown on screen
12. Enter TWO consecutive codes from app
13. Click "Add MFA"
```

**✅ Root MFA is now enabled!**

---

## 📋 STEP 2 - Create IAM User (Best Practice)

> Never use Root for daily tasks!

```
1. Go to IAM Console
   → Services → IAM

2. Click "Users" → "Create User"

3. Enter username: "admin-user"

4. Check ✅ "Provide user access to AWS Console"

5. Select "I want to create an IAM user"

6. Set password → "Custom password" → Enter password

7. Uncheck "User must create new password"

8. Click "Next"
```

```
9. Attach Policy:
   → "Attach policies directly"
   → Search "AdministratorAccess"
   → Check ✅ AdministratorAccess

10. Click "Next" → "Create User"

11. SAVE the credentials shown!
```

---

## 📋 STEP 3 - Enable MFA for IAM User

### Method 1: Admin enables for User
```
1. Go to IAM → Users
2. Click on "admin-user"
3. Go to "Security Credentials" tab
4. Find "Multi-factor authentication (MFA)"
5. Click "Assign MFA device"
6. Name: "admin-user-mfa"
7. Select "Authenticator app"
8. Scan QR code with phone app
9. Enter 2 consecutive codes
10. Click "Add MFA"
```

---

## 📋 STEP 4 - TEST MFA Login

```
1. Open Incognito/Private browser window
2. Go to: https://console.aws.amazon.com
3. Enter Account ID (12 digit number)
4. Enter IAM username: admin-user
5. Enter password
6. AWS will ask for MFA code
7. Open Google Authenticator
8. Enter the 6-digit code
9. Click "Submit"
```

**✅ Successfully logged in with MFA!**

---

## 📋 STEP 5 - Create MFA Enforcement Policy (Advanced)

### Force Users to use MFA

**Create this Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowViewAccountInfo",
      "Effect": "Allow",
      "Action": [
        "iam:GetAccountPasswordPolicy",
        "iam:ListVirtualMFADevices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowManageOwnMFA",
      "Effect": "Allow",
      "Action": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ResyncMFADevice"
      ],
      "Resource": [
        "arn:aws:iam::*:mfa/${aws:username}",
        "arn:aws:iam::*:user/${aws:username}"
      ]
    },
    {
      "Sid": "DenyAllWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ResyncMFADevice",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
```

### Apply this Policy:
```
1. Go to IAM → Policies → "Create Policy"
2. Click "JSON" tab
3. Paste above JSON
4. Click "Next"
5. Policy Name: "Force-MFA-Policy"
6. Click "Create Policy"

7. Go to IAM → Users → your-user
8. Click "Add permissions"
9. "Attach policies directly"
10. Search "Force-MFA-Policy"
11. Attach it
```

---

## 📋 STEP 6 - Deactivate/Delete MFA (Important to Know)

```
1. Go to IAM → Users → select user
2. Security Credentials tab
3. Find MFA device
4. Click "Revoke" or "Remove"
5. Confirm removal
```

---

## 🔍 How to Check MFA Status

```
IAM Console → Users → Check "MFA" column
→ ✅ Green = MFA Enabled
→ ❌ Red/Empty = No MFA
```

---

## 📊 Practice Checklist

```
□ Installed Google Authenticator on phone
□ Enabled MFA on Root Account
□ Created IAM User
□ Enabled MFA on IAM User
□ Tested login with MFA
□ Created Force-MFA Policy (optional)
□ Know how to remove MFA device
```

---

## ⚠️ Important Tips

```
✅ DO's:
→ Always enable MFA on Root account
→ Use virtual MFA for practice
→ Save backup codes
→ Use hardware key for production

❌ DON'TS:
→ Never share MFA codes
→ Don't lose your MFA device
→ Don't use same device for all accounts
```

---

## 🆘 What if you lose MFA device?

```
Root Account:
→ Use account recovery process
→ Contact AWS Support
→ Verify identity with email + phone

IAM User:
→ Admin can remove MFA from console
→ Login without MFA
→ Set up new MFA device
```

---

## 📝 Quick Summary

```
MFA = Password + One Time Code
Types = Virtual App | Hardware Key | FIDO Key
Best Practice = Enable on ALL accounts
Root Account = Most Critical to protect
IAM User = Enable MFA individually
```

---




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




# 26. IAM Roles Hands On
# AWS IAM Roles - Complete Learning Guide

## 📚 What is an IAM Role?

An **IAM Role** is an AWS identity with specific permissions that can be **assumed** by:
- AWS Services (EC2, Lambda, etc.)
- IAM Users (from same or different accounts)
- External users (federated identity)
- Applications

> **Key Difference:** Unlike IAM Users, Roles do **NOT** have permanent credentials (no username/password or access keys). They provide **temporary credentials**.

---

## 🧠 Core Concepts

```
IAM Role Components:
├── Trust Policy      → WHO can assume this role
├── Permission Policy → WHAT actions are allowed
└── Role Name         → Identifier for the role
```

---

## 🏗️ Common Use Cases

| Use Case | Example |
|----------|---------|
| EC2 → S3 Access | EC2 instance reads/writes S3 |
| Lambda → DynamoDB | Lambda function accesses DynamoDB |
| Cross-Account | Account A accesses Account B resources |
| Developer Assume Role | Dev assumes admin role temporarily |

---

## 🔬 HANDS-ON PRACTICE

---

### ✅ Lab 1: Create IAM Role for EC2 to Access S3

**Scenario:** EC2 instance needs to read files from S3

#### Step 1: Create the IAM Role

```
1. Go to AWS Console → IAM → Roles
2. Click "Create Role"
3. Select Trusted Entity:
   → Choose "AWS Service"
   → Choose "EC2"
   → Click Next
```

#### Step 2: Attach Permission Policy

```
Search for: "AmazonS3ReadOnlyAccess"
Select it → Click Next
```

#### Step 3: Name and Create

```
Role Name: EC2-S3-ReadOnly-Role
Description: Allows EC2 to read S3 buckets
Click "Create Role"
```

#### Step 4: Attach Role to EC2

```
1. Go to EC2 → Instances
2. Select your instance
3. Actions → Security → Modify IAM Role
4. Select "EC2-S3-ReadOnly-Role"
5. Click Update IAM Role
```

#### Step 5: Test It!

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Try listing S3 buckets (NO need to configure aws credentials)
aws s3 ls

# Try accessing specific bucket
aws s3 ls s3://your-bucket-name

# Try to DELETE (should FAIL - ReadOnly role)
aws s3 rm s3://your-bucket-name/file.txt
```

---

### ✅ Lab 2: Create IAM Role for Lambda to Access DynamoDB

#### Step 1: Create DynamoDB Table First

```
DynamoDB → Create Table
Table Name: students
Partition Key: studentId (String)
```

#### Step 2: Create IAM Role for Lambda

```
IAM → Roles → Create Role
Trusted Entity → AWS Service → Lambda
Attach Policies:
  ✓ AmazonDynamoDBFullAccess
  ✓ AWSLambdaBasicExecutionRole
Role Name: Lambda-DynamoDB-Role
```

#### Step 3: Create Lambda Function

```
Lambda → Create Function
Function Name: testDynamoDB
Runtime: Python 3.x
Execution Role → Use existing role → Lambda-DynamoDB-Role
```

#### Step 4: Lambda Code

```python
import json
import boto3

def lambda_handler(event, context):
    
    # Create DynamoDB client (NO credentials needed - uses Role!)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('students')
    
    # PUT item into DynamoDB
    response = table.put_item(
        Item={
            'studentId': '101',
            'name': 'John Doe',
            'course': 'AWS'
        }
    )
    
    # GET item from DynamoDB
    result = table.get_item(
        Key={'studentId': '101'}
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(result['Item'])
    }
```

#### Step 5: Test Lambda

```
Click "Test" → Create test event → Click Test
Check Results → Should see student data
Check DynamoDB → Item should be inserted
```

---

### ✅ Lab 3: Assume Role (User Switching Roles)

**Scenario:** Junior developer assumes a read-only role

#### Step 1: Create IAM User

```
IAM → Users → Create User
Username: junior-dev
Enable Console Access → Set password
Attach Policy: NO permissions (zero access)
```

#### Step 2: Create Role to be Assumed

```
IAM → Roles → Create Role
Trusted Entity → AWS Account → This Account
Attach Policy: AmazonEC2ReadOnlyAccess
Role Name: ReadOnly-EC2-Role
```

#### Step 3: Update Trust Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/junior-dev"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Step 4: Allow User to Assume Role

```
Go to junior-dev user → Add inline policy:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::YOUR-ACCOUNT-ID:role/ReadOnly-EC2-Role"
    }
  ]
}
```

#### Step 5: Switch Role (Test)

```
1. Login as junior-dev
2. Click username (top right) → "Switch Role"
3. Enter:
   Account: YOUR-ACCOUNT-ID
   Role: ReadOnly-EC2-Role
4. Click Switch Role
5. Now you can VIEW EC2 but cannot CREATE/DELETE
```

---

### ✅ Lab 4: Cross-Account Role (Advanced)

**Scenario:** Account A assumes role in Account B

```
Account B (Target):
├── Create Role: CrossAccount-Role
├── Trust Policy: Allow Account A
└── Permissions: S3 Read Access

Account A (Source):
├── Create Policy: Allow sts:AssumeRole
├── Attach to User/Role
└── Assume role using AWS CLI
```

#### CLI Commands for Cross-Account

```bash
# Assume role from Account A
aws sts assume-role \
  --role-arn "arn:aws:iam::ACCOUNT-B-ID:role/CrossAccount-Role" \
  --role-session-name "my-session"

# Output gives temporary credentials:
# AccessKeyId, SecretAccessKey, SessionToken

# Export credentials
export AWS_ACCESS_KEY_ID="temporary-access-key"
export AWS_SECRET_ACCESS_KEY="temporary-secret-key"
export AWS_SESSION_TOKEN="temporary-session-token"

# Now access Account B's S3
aws s3 ls
```

---

## 📋 Quick Reference Cheat Sheet

```
CREATE ROLE:
IAM → Roles → Create Role → Select Service → Attach Policy → Name it

ATTACH TO EC2:
EC2 → Instance → Actions → Security → Modify IAM Role

SWITCH ROLE (Console):
Top-right username → Switch Role → Enter Account + Role name

ASSUME ROLE (CLI):
aws sts assume-role --role-arn "arn:..." --role-session-name "name"

CHECK CURRENT IDENTITY:
aws sts get-caller-identity
```

---

## 🎯 Practice Checklist

```
□ Create EC2 role with S3 access and test
□ Create Lambda role with DynamoDB access
□ Create user with zero permissions, use role switching
□ View Trust Policy JSON and understand it
□ Use CLI: aws sts get-caller-identity
□ Use CLI: aws sts assume-role
□ Try to do something NOT in the policy (see denial)
□ Add/Remove permissions and test changes
```

---

## ⚠️ Important Points to Remember

| Point | Details |
|-------|---------|
| **Temporary Credentials** | Roles give temp creds (15min - 12hrs) |
| **No Hardcoding** | Never hardcode credentials in EC2/Lambda |
| **Least Privilege** | Give minimum permissions needed |
| **Trust Policy** | Controls WHO can assume the role |
| **Permission Policy** | Controls WHAT they can do |

---

## 🔥 Common Interview Questions

```
Q: What is difference between IAM User and IAM Role?
A: User has permanent credentials, Role has temporary credentials

Q: Can EC2 have multiple roles?
A: No, only ONE role at a time

Q: What is Trust Policy?
A: JSON that defines WHO can assume the role

Q: What service is used to assume role?
A: STS (Security Token Service)
```

---



# 31. AWS Budget Setup

# AWS Budget Setup - Complete Step-by-Step Guide

## 📋 What is AWS Budget?
AWS Budgets allows you to **set custom cost and usage budgets** and receive alerts when you exceed (or are forecasted to exceed) your thresholds.

---

## 🚀 Step-by-Step AWS Budget Setup Process

### **Step 1: Login to AWS Console**
```
1. Go to → https://console.aws.amazon.com
2. Login with your AWS Account credentials
3. Make sure you have Admin or Billing permissions
```

---

### **Step 2: Navigate to AWS Budgets**
```
Option 1: Search Bar
→ Type "Budgets" in the search bar
→ Click on "AWS Budgets"

Option 2: Manual Navigation
→ Click your Account Name (top right corner)
→ Click "Billing and Cost Management"
→ Click "Budgets" from left sidebar
```

---

### **Step 3: Click "Create Budget"**
```
→ Click the orange "Create Budget" button
→ You will see Budget Setup options
```

---

### **Step 4: Choose Budget Setup Type**

```
Two Options Available:
┌─────────────────────────────────────┐
│  1. Use a Template (Simplified)     │  ← Recommended for Beginners
│  2. Customize (Advanced)            │  ← For Advanced Users
└─────────────────────────────────────┘
```

#### **Template Options:**
| Template | Description |
|----------|-------------|
| Zero spend budget | Alert when any spending occurs |
| Monthly cost budget | Alert when monthly cost exceeds limit |
| Daily Savings Plans coverage | Monitor Savings Plans |
| Daily reservation utilization | Monitor Reserved Instances |

---

### **Step 5: Configure Budget Details (Customize Option)**

#### **5.1 - Choose Budget Type**
```
┌──────────────────────────────────────────┐
│  Budget Types:                           │
│  ✅ Cost Budget      → Monitor spending  │
│  ✅ Usage Budget     → Monitor usage     │
│  ✅ Savings Plans    → Monitor savings   │
│  ✅ Reservation      → Monitor RI usage  │
└──────────────────────────────────────────┘
```

#### **5.2 - Set Budget Name**
```
Budget Name: my-monthly-budget
             (Give a meaningful name)
```

#### **5.3 - Set Budget Period**
```
Period Options:
→ Daily
→ Monthly    ← Most Common
→ Quarterly
→ Annually
```

#### **5.4 - Set Budget Amount**
```
Budget Renewal Type:
→ Recurring Budget   (auto-renews every period)
→ Expiring Budget    (ends on specific date)

Budgeting Method:
→ Fixed              (same amount every period)
→ Monthly Budget Planning (different per month)

Enter Amount: $10.00  (example for free tier users)
```

---

### **Step 6: Configure Filters (Optional)**
```
You can filter by:
┌────────────────────────────────┐
│  • Service (EC2, S3, RDS...)   │
│  • Account                     │
│  • Region                      │
│  • Tag                         │
│  • Usage Type                  │
│  • Instance Type               │
└────────────────────────────────┘

Example: Monitor only EC2 costs
→ Service Filter → Select "EC2"
```

---

### **Step 7: Set Up Alert Notifications**

```
Click "Add Alert Threshold"
```

#### **Alert Configuration:**
```
┌──────────────────────────────────────────────┐
│  Set Alert Threshold                         │
│                                              │
│  Alert When: Actual Cost                     │
│              OR Forecasted Cost              │
│                                              │
│  Threshold:  80%  of budgeted amount         │
│  (When you spend 80% → get alert)            │
│                                              │
│  Threshold Type:                             │
│  → Percentage  (80%)                         │
│  → Absolute    ($8.00)                       │
└──────────────────────────────────────────────┘
```

#### **Notification Method:**
```
Option 1: Email Notification
→ Enter your email address
→ Click "Confirm" (check your email)

Option 2: SNS Topic (Advanced)
→ Create SNS Topic ARN
→ Paste ARN here

Option 3: AWS Chatbot
→ Slack or Chime notifications
```

#### **Recommended Alert Setup:**
```
Alert 1: 50% threshold  → Early Warning
Alert 2: 80% threshold  → Warning
Alert 3: 100% threshold → Critical
Alert 4: Forecasted 100% → Future Warning
```

---

### **Step 8: Review and Create**
```
1. Review all settings
   ├── Budget Name ✓
   ├── Budget Amount ✓
   ├── Period ✓
   ├── Filters ✓
   └── Alerts & Email ✓

2. Click "Create Budget" button
3. ✅ Budget Created Successfully!
```

---

## 📧 Step 9: Confirm Email Subscription
```
1. Check your email inbox
2. Find email from: aws-notifications@amazon.com
3. Click "Confirm Subscription" link
4. ✅ Now you will receive alerts!
```

---

## 🎯 Practical Example - Free Tier Budget Setup

```
Budget Name    : free-tier-alert
Budget Type    : Cost Budget
Period         : Monthly
Amount         : $5.00
Filter         : None (All Services)

Alerts:
├── Alert 1: Actual cost > 50% ($2.50) → Email
├── Alert 2: Actual cost > 80% ($4.00) → Email
└── Alert 3: Forecasted > 100% ($5.00) → Email

Email: your-email@gmail.com
```

---

## 💡 AWS Budget - Important Points

| Feature | Details |
|---------|---------|
| **Free Budgets** | First 2 budgets are FREE |
| **Paid Budgets** | $0.02/day per budget after 2 |
| **Max Budgets** | 20,000 budgets per account |
| **Alert Methods** | Email, SNS, Chatbot |
| **Max Alerts** | 5 alerts per budget |

---

## ⚠️ Common Mistakes to Avoid

```
❌ Not confirming email subscription
❌ Setting only 100% alert (too late!)
❌ Forgetting to set Forecasted alerts
❌ Not filtering by service
❌ Setting budget too high
```

---

## ✅ Best Practices

```
✔ Set multiple alert thresholds (50%, 80%, 100%)
✔ Use both Actual AND Forecasted alerts
✔ Create separate budgets per service
✔ Review budgets monthly
✔ Use Tags to track team/project costs
✔ Enable billing alerts in CloudWatch too
```

---

## 🔗 Quick Navigation Summary

```
AWS Console
    └── Billing & Cost Management
            └── Budgets
                    ├── Create Budget
                    ├── Budget Templates
                    ├── Alert Setup
                    └── Email Notification
```

---

## 📱 Enable Billing Alerts (Extra Security)

```
Go to: Billing → Billing Preferences
→ Enable "Receive Billing Alerts"
→ Enable "Receive Free Tier Alerts"
→ Enter Email → Save Preferences
```

---

> 💬 **Tip for Beginners:** Start with **$5-$10 budget** with **Zero Spend Template** to get alerts immediately when any charge occurs. This protects you from unexpected AWS bills!

---

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
# 46. EC2 Instances Launch Types Hands On
# AWS EC2 Instance Launch Types

## 📚 Theory First

### EC2 Instance Launch Types (Purchasing Options)

| Launch Type | Description | Use Case |
|-------------|-------------|----------|
| **On-Demand** | Pay per second/hour, no commitment | Short-term, unpredictable workloads |
| **Reserved** | 1 or 3 year commitment, up to 72% discount | Steady-state workloads |
| **Spot** | Bid for unused capacity, up to 90% discount | Fault-tolerant, flexible workloads |
| **Dedicated Host** | Physical server dedicated to you | Compliance, licensing requirements |
| **Dedicated Instance** | Instance on dedicated hardware | Compliance needs |
| **Savings Plans** | Commit to usage amount, flexible | Modern alternative to Reserved |
| **Capacity Reservations** | Reserve capacity in specific AZ | Ensure capacity available |

---

## 🔵 1. ON-DEMAND INSTANCES

```
✅ Pay for what you use
✅ No upfront cost
✅ No long-term commitment
✅ Highest cost but most flexible
💰 Billing: Per second (Linux) / Per hour (Windows)
```

### Best For:
- First time apps
- Short-term workloads
- Unpredictable traffic
- Testing & development

---

## 🟡 2. RESERVED INSTANCES

```
✅ Up to 72% discount vs On-Demand
✅ Reserve specific instance type
✅ 1 Year or 3 Year term
✅ Payment: No upfront / Partial / Full upfront

Types:
├── Standard Reserved    → Fixed instance type (72% discount)
├── Convertible Reserved → Can change instance type (66% discount)
└── Scheduled Reserved  → Specific time window (deprecated)
```

### Best For:
- Databases
- Web servers with steady traffic
- Long-running applications

---

## 🔴 3. SPOT INSTANCES

```
✅ Up to 90% discount vs On-Demand
⚠️  Can be terminated with 2 min notice
✅ You set max price you willing to pay

How it works:
- If Spot Price > Your Max Price → Instance TERMINATED
- If Spot Price < Your Max Price → Instance RUNNING
```

### Best For:
- Batch jobs
- Data analysis
- Image processing
- Distributed workloads
- CI/CD pipelines

### ❌ NOT Good For:
- Databases
- Critical applications
- Long running jobs without checkpointing

---

## 🟣 4. DEDICATED HOST

```
✅ Physical EC2 server dedicated to you
✅ Full control of instance placement
✅ Can use existing server-bound licenses
💰 Most expensive option
📅 On-Demand or Reserved (1 or 3 year)
```

### Best For:
- Regulatory requirements
- Software with BYOL (Bring Your Own License)
- Oracle, SQL Server licenses

---

## 🟠 5. DEDICATED INSTANCES

```
✅ Instances on dedicated hardware
✅ Hardware shared with other instances IN YOUR ACCOUNT
✅ No control over instance placement
💰 Cheaper than Dedicated Host
```

---

## 🟢 6. SAVINGS PLANS

```
✅ Commit to certain $ amount per hour
✅ 1 or 3 year commitment
✅ More flexible than Reserved

Types:
├── Compute Savings Plan  → Any instance family, region, OS (66% discount)
├── EC2 Savings Plan      → Specific instance family & region (72% discount)
└── SageMaker Savings Plan → For ML workloads
```

---

## ⚪ 7. CAPACITY RESERVATIONS

```
✅ Reserve On-Demand capacity in specific AZ
✅ No time commitment (create/cancel anytime)
✅ No billing discount
✅ Combine with Reserved Instances for discount
```

---

## 💰 Price Comparison (Example: m4.large)

```
On-Demand          → $0.10/hr    (100% - baseline)
Reserved 1yr       → $0.062/hr   (38% savings)
Reserved 3yr       → $0.043/hr   (57% savings)
Spot Instance      → $0.015/hr   (85% savings) ← varies
Savings Plan 1yr   → $0.062/hr   (38% savings)
```

---

# 🛠️ HANDS-ON PRACTICE

## Lab 1: Launch On-Demand Instance

### Step 1: Go to EC2 Console
```
AWS Console → EC2 → Instances → Launch Instance
```

### Step 2: Configure
```
Name: MyOnDemand-Server
AMI: Amazon Linux 2023
Instance Type: t2.micro (Free Tier)
Key Pair: Create new → my-keypair
Security Group: Allow SSH (port 22)
Launch Type: On-Demand (DEFAULT)
```

### Step 3: Verify
```bash
# Connect to instance
ssh -i my-keypair.pem ec2-user@<public-ip>

# Check instance metadata
curl http://169.254.169.254/latest/meta-data/instance-life-cycle
# Output should be: on-demand
```

---

## Lab 2: Request Spot Instance

### Method 1: AWS Console
```
EC2 → Instances → Launch Instance
↓
Scroll to "Advanced Details"
↓
Purchasing Option → ✅ Check "Request Spot Instances"
↓
Set Maximum Price (optional)
```

### Method 2: AWS CLI
```bash
# Request Spot Instance
aws ec2 request-spot-instances \
    --instance-count 1 \
    --type "one-time" \
    --launch-specification '{
        "ImageId": "ami-0abcdef1234567890",
        "InstanceType": "t2.micro",
        "KeyName": "my-keypair",
        "SecurityGroupIds": ["sg-12345678"]
    }' \
    --spot-price "0.05"

# Check spot request status
aws ec2 describe-spot-instance-requests

# Check current spot prices
aws ec2 describe-spot-price-history \
    --instance-types t2.micro \
    --product-descriptions "Linux/UNIX" \
    --start-time 2024-01-01T00:00:00
```

### Step 3: Verify Spot Instance
```bash
# SSH into spot instance
ssh -i my-keypair.pem ec2-user@<public-ip>

# Check lifecycle
curl http://169.254.169.254/latest/meta-data/instance-life-cycle
# Output: spot

# Check spot termination notice (2 min warning)
curl http://169.254.169.254/latest/meta-data/spot/termination-time
# Returns 404 if not being terminated
# Returns timestamp if termination scheduled
```

---

## Lab 3: Create Reserved Instance (Simulation)

```
⚠️ Note: Reserved Instances cost real money!
For learning, just go through the console flow.

EC2 → Reserved Instances → Purchase Reserved Instances
↓
Platform: Linux/UNIX
Instance Type: t2.micro
Term: 1 Year
Payment: No Upfront
Tenancy: Default
↓
Review pricing and discount
↓
(DON'T purchase if just learning!)
```

---

## Lab 4: Spot Fleet (Advanced)

```bash
# Create spot-fleet-config.json
cat > spot-fleet-config.json << 'EOF'
{
    "IamFleetRole": "arn:aws:iam::ACCOUNT_ID:role/AmazonEC2SpotFleetRole",
    "AllocationStrategy": "lowestPrice",
    "TargetCapacity": 2,
    "SpotPrice": "0.05",
    "LaunchSpecifications": [
        {
            "ImageId": "ami-0abcdef1234567890",
            "InstanceType": "t2.micro",
            "KeyName": "my-keypair"
        },
        {
            "ImageId": "ami-0abcdef1234567890", 
            "InstanceType": "t3.micro",
            "KeyName": "my-keypair"
        }
    ]
}
EOF

# Request Spot Fleet
aws ec2 request-spot-fleet \
    --spot-fleet-request-config file://spot-fleet-config.json
```

---

## Lab 5: Compare Instance Types with CLI

```bash
# List all On-Demand instances running
aws ec2 describe-instances \
    --filters "Name=instance-lifecycle,Values=normal" \
    --query 'Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name}'

# List all Spot instances
aws ec2 describe-instances \
    --filters "Name=instance-lifecycle,Values=spot" \
    --query 'Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name}'

# Get savings plan recommendations
aws savingsplans describe-savings-plans
```

---

## Lab 6: Savings Plans (Console Walk-through)

```
AWS Console → Cost Management → Savings Plans
↓
Purchase Savings Plans
↓
Savings Plan Type: Compute Savings Plan
↓
Term: 1 Year
↓
Payment: No Upfront
↓
Hourly Commitment: $0.10/hr
↓
Review estimated savings
↓
(DON'T purchase if just learning!)
```

---

## Lab 7: Capacity Reservation

```bash
# Create Capacity Reservation
aws ec2 create-capacity-reservation \
    --instance-type t2.micro \
    --instance-platform Linux/UNIX \
    --availability-zone us-east-1a \
    --instance-count 1 \
    --instance-match-criteria open

# Describe reservation
aws ec2 describe-capacity-reservations

# Launch instance into specific reservation
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --capacity-reservation-specification '{
        "CapacityReservationPreference": "open"
    }'

# Cancel when done (to avoid charges!)
aws ec2 cancel-capacity-reservation \
    --capacity-reservation-id cr-1234567890abcdef0
```

---

## 🧪 Practice Scenarios

### Scenario 1: Cost Optimization Challenge
```
Problem: You have a web app running 24/7
Current: On-Demand t3.large = $100/month
Task: Find cheapest option maintaining availability

Answer:
├── Reserved 1yr (No Upfront) → Save 38%
├── Reserved 3yr (Full Upfront) → Save 57%
└── Savings Plan → Flexibility + savings
```

### Scenario 2: Spot Instance Resilience
```bash
# Create spot instance with user-data to handle interruption
cat > user-data.sh << 'EOF'
#!/bin/bash
# Check for spot termination every 5 seconds
while true; do
    STATUS=$(curl -s http://169.254.169.254/latest/meta-data/spot/termination-time)
    if [ "$STATUS" != "" ]; then
        echo "Spot instance terminating! Saving work..."
        # Add your cleanup/save logic here
        aws s3 cp /tmp/work-progress s3://my-bucket/checkpoint
    fi
    sleep 5
done &

# Your actual workload
echo "Starting batch job..."
python3 /home/ec2-user/batch_job.py
EOF

# Launch with user-data
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --instance-market-options '{"MarketType":"spot"}' \
    --user-data file://user-data.sh
```

---

## 📊 Quick Decision Guide

```
Need instance NOW, short term?
└── ON-DEMAND ✅

Running 24/7 for 1-3 years?
└── RESERVED or SAVINGS PLAN ✅

Batch jobs, flexible timing?
└── SPOT ✅

Need specific hardware/licensing?
└── DEDICATED HOST ✅

Need hardware isolation (compliance)?
└── DEDICATED INSTANCE ✅

Need guaranteed capacity in AZ?
└── CAPACITY RESERVATION ✅
```

---

## ✅ Cleanup Commands

```bash
# Terminate On-Demand instances
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Cancel spot requests
aws ec2 cancel-spot-instance-requests \
    --spot-instance-request-ids sir-1234567890abcdef0

# Cancel capacity reservations  
aws ec2 cancel-capacity-reservation \
    --capacity-reservation-id cr-1234567890abcdef0

# Verify everything is cleaned up
aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].InstanceId'
```

---

## 🎯 Key Exam Tips

```
📝 Remember:
- Spot = cheapest (90%) but can be interrupted
- Reserved = 72% discount, 1 or 3 year commitment  
- Dedicated HOST = physical server (BYOL)
- Dedicated INSTANCE = dedicated hardware, not physical server
- On-Demand = no commitment, most expensive
- Savings Plans = flexible modern alternative to Reserved
- Capacity Reservation = NO discount, just guarantees capacity
```

---

## 🏆 Practice Challenge

```
Try this on your own:
1. Launch 1 On-Demand instance (t2.micro - Free Tier)
2. Launch 1 Spot instance (t2.micro)
3. SSH into both and verify lifecycle
4. Set up spot interruption handler script
5. Compare costs in Cost Explorer
6. TERMINATE BOTH when done!
```

---


# 48. Private vs Public vs Elastic IP Hands On

# AWS EC2: Private vs Public vs Elastic IP

## 📚 Theory First

---

### 🔵 Private IP
| Feature | Details |
|---------|---------|
| **Definition** | IP assigned within your VPC (internal network) |
| **Range** | 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| **Accessible** | Only within AWS network / VPC |
| **Persistent** | ✅ Never changes (even after stop/start) |
| **Cost** | Free |
| **Use Case** | Internal communication between EC2 instances |

---

### 🟢 Public IP
| Feature | Details |
|---------|---------|
| **Definition** | IP assigned from AWS public pool |
| **Accessible** | From the Internet |
| **Persistent** | ❌ Changes every time you stop/start EC2 |
| **Cost** | Free (while instance is running) |
| **Use Case** | Temporary internet access |
| **Note** | Lost when instance is stopped |

---

### 🟡 Elastic IP (EIP)
| Feature | Details |
|---------|---------|
| **Definition** | Static Public IP you own |
| **Accessible** | From the Internet |
| **Persistent** | ✅ Never changes - YOU control it |
| **Cost** | 💰 Charged when NOT associated with running instance |
| **Limit** | 5 per AWS account (can request more) |
| **Use Case** | Production servers needing fixed IP |

---

### 🧠 Key Differences Summary

```
┌─────────────────────────────────────────────────────────┐
│                    IP Comparison                         │
├──────────────┬────────────┬────────────┬────────────────┤
│  Feature     │ Private IP │ Public IP  │  Elastic IP    │
├──────────────┼────────────┼────────────┼────────────────┤
│ Reachable    │ VPC Only   │ Internet   │ Internet       │
│ from         │            │            │                │
├──────────────┼────────────┼────────────┼────────────────┤
│ After Stop   │ ✅ Same    │ ❌ Changes │ ✅ Same        │
│ /Start       │            │            │                │
├──────────────┼────────────┼────────────┼────────────────┤
│ Cost         │ Free       │ Free       │ Charged if     │
│              │            │            │ unattached     │
├──────────────┼────────────┼────────────┼────────────────┤
│ You Own It   │ No         │ No         │ ✅ Yes         │
└──────────────┴────────────┴────────────┴────────────────┘
```

---

### ⚠️ Important SAA Exam Points
```
✅ EC2 doesn't know its Public IP (it sees only Private IP)
✅ Public IP is mapped to Private IP by Internet Gateway (NAT)
✅ Elastic IP is a regional resource
✅ You can move Elastic IP from one instance to another
✅ AWS Best Practice: Avoid Elastic IP, use DNS instead
✅ Elastic IP charged = $0.005/hr when not associated
```

---

## 🛠️ HANDS-ON LAB

### Prerequisites
- AWS Account
- Basic EC2 knowledge

---

### 🔬 Lab 1: Observe Private & Public IP

#### Step 1: Launch EC2 Instance
```
1. Go to EC2 Console
2. Click "Launch Instance"
3. Name: "IP-Demo-Instance"
4. AMI: Amazon Linux 2023 (Free Tier)
5. Instance Type: t2.micro
6. Key Pair: Create or use existing
7. Network Settings:
   ✅ Allow SSH (port 22)
   ✅ Auto-assign Public IP: ENABLE
8. Click "Launch Instance"
```

#### Step 2: Note Down IPs
```
Go to EC2 → Instances → Select your instance

Note these values:
📝 Private IP address: 172.31.x.x  (yours will differ)
📝 Public IP address:  54.x.x.x    (yours will differ)
📝 Private DNS: ip-172-31-x-x.ec2.internal
📝 Public DNS:  ec2-54-x-x-x.compute-1.amazonaws.com
```

#### Step 3: Get All Running Instances with IPs
```bash
aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query "Reservations[*].Instances[*].{
        InstanceID:InstanceId,
        InstanceName:Tags[?Key=='Name']|[0].Value,
        PrivateIP:PrivateIpAddress,
        PublicIP:PublicIpAddress,
        State:State.Name}" \
    --output table
```

**Expected Output:**
```
# hostname -I
172.31.14.x          ← Only Private IP shown!

# Public IP only visible via metadata service
54.x.x.x
```

---

### 🔬 Lab 2: See Public IP Change After Stop/Start

#### Step 1: Note Current Public IP
```
Instance Public IP: 54.x.x.x  (note this down!)
```

#### Step 2: Stop the Instance
```
EC2 Console → Select Instance → 
Instance State → Stop Instance → Confirm
Wait until State = "Stopped"
```

#### Step 3: Start the Instance
```
Instance State → Start Instance
Wait until State = "Running"
```

#### Step 4: Compare IPs
```
Check Public IP again...

Old Public IP: 54.x.x.x   ❌ GONE!
New Public IP: 18.x.x.x   ← Different!
Private IP:    172.31.x.x  ✅ Same (unchanged)
```

> **💡 This proves:** Public IP is temporary & Private IP is permanent!

---

### 🔬 Lab 3: Allocate & Attach Elastic IP

#### Step 1: Allocate Elastic IP
```
EC2 Console → 
Left Menu → Network & Security → Elastic IPs
→ Click "Allocate Elastic IP address"
→ Network Border Group: (keep default)
→ Amazon's pool of IPv4 addresses: selected
→ Click "Allocate"

📝 Note your Elastic IP: 3.x.x.x
```

#### Step 2: Associate Elastic IP to Instance
```
Select the Elastic IP you just created
→ Actions → Associate Elastic IP address
→ Resource type: Instance
→ Instance: Select "IP-Demo-Instance"
→ Private IP: (auto-selected)
→ Click "Associate"
```

#### Step 3: Verify
```
Go back to EC2 Instances
Select your instance

Check:
✅ Public IPv4: 3.x.x.x (your Elastic IP)
✅ Elastic IP: 3.x.x.x (shown separately)
```

#### Step 4: Test Persistence - Stop/Start
```
Stop Instance → Start Instance

After restart check Public IP...
✅ Still 3.x.x.x  ← Elastic IP persists!
```

---

### 🔬 Lab 4: Move Elastic IP Between Instances

#### Step 1: Launch Second Instance
```
Launch another EC2 instance:
Name: "IP-Demo-Instance-2"
Same settings as before
Note its current Public IP
```

#### Step 2: Move Elastic IP
```
EC2 → Elastic IPs
Select your Elastic IP (3.x.x.x)
→ Actions → Associate Elastic IP address
→ Select "IP-Demo-Instance-2"
→ ✅ Check "Allow this Elastic IP to be reassociated"
→ Associate
```

#### Step 3: Verify Move
```
Instance 1: Public IP = new random IP (or none)
Instance 2: Public IP = 3.x.x.x  ✅ Elastic IP moved!
```

> **💡 Real World Use Case:** Failover! Move IP from failed server to backup server instantly!

---

### 🔬 Lab 5: Elastic IP Cost Awareness

#### Scenario: Unused Elastic IP = Money Drain!
```
Disassociate Elastic IP from instance:
→ Elastic IPs → Select IP
→ Actions → Disassociate

Now the Elastic IP is not attached to anything
→ AWS charges $0.005/hour = ~$3.6/month
→ This is AWS discouraging IP hoarding!
```

---

### 🧹 Cleanup (IMPORTANT - Avoid Charges!)

```
Step 1: Release Elastic IP
EC2 → Elastic IPs → Select IP
→ Actions → Release Elastic IP address → Release

Step 2: Terminate Instances
EC2 → Instances → Select both instances
→ Instance State → Terminate
```

---

## 🎯 Architecture Diagram

```
Internet
   │
   │ Public IP / Elastic IP
   ▼
┌──────────────────┐
│  Internet Gateway │
└──────────┬───────┘
           │ NAT Translation
           │ Public→Private
           ▼
┌──────────────────────────────┐
│          VPC                  │
│  ┌────────────────────────┐  │
│  │    Public Subnet        │  │
│  │  ┌──────────────────┐  │  │
│  │  │   EC2 Instance   │  │  │
│  │  │                  │  │  │
│  │  │ Private: 10.0.1.5│  │  │
│  │  │ Public: 54.x.x.x │  │  │
│  │  │ (or Elastic IP)  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

⚠️ EC2 only SEES its Private IP!
   Internet Gateway does the translation!
```

---

## ✅ Lab Summary Checklist

```
☐ Launched EC2 and noted Private & Public IP
☐ SSH'd into instance - saw only Private IP
☐ Stopped/Started - confirmed Public IP changed
☐ Stopped/Started - confirmed Private IP same
☐ Allocated Elastic IP
☐ Associated Elastic IP to instance
☐ Stopped/Started - confirmed Elastic IP persisted
☐ Moved Elastic IP to another instance
☐ Released Elastic IP (cleanup)
☐ Terminated instances (cleanup)
```

---
# 50. EC2 Placement Groups - Hands On

# AWS EC2 Placement Groups - Complete Guide & Hands-On

## 📚 What are Placement Groups?

Placement Groups control **how EC2 instances are placed** on underlying hardware to meet specific workload needs.

---

## 🏗️ Types of Placement Groups

### 1️⃣ Cluster Placement Group
```
┌─────────────────────────────────┐
│         Single AZ               │
│   ┌──────────────────────┐      │
│   │   Same Rack/Host     │      │
│   │  [EC2] [EC2] [EC2]  │      │
│   │  [EC2] [EC2] [EC2]  │      │
│   └──────────────────────┘      │
└─────────────────────────────────┘
```
- ✅ **Ultra-low latency** (10 Gbps network)
- ✅ High throughput
- ❌ If rack fails → ALL instances fail
- 🎯 **Use Case:** HPC, Big Data, Machine Learning

---

### 2️⃣ Spread Placement Group
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   AZ-1   │  │   AZ-2   │  │   AZ-3   │
│ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │
│ │Rack 1│ │  │ │Rack 2│ │  │ │Rack 3│ │
│ │[EC2] │ │  │ │[EC2] │ │  │ │[EC2] │ │
│ └──────┘ │  │ └──────┘ │  │ └──────┘ │
└──────────┘  └──────────┘  └──────────┘
```
- ✅ Each instance on **different hardware**
- ✅ Reduces simultaneous failures
- ❌ **Max 7 instances per AZ** per group
- 🎯 **Use Case:** Critical apps, HA databases

---

### 3️⃣ Partition Placement Group
```
┌─────────────────────────────────────────┐
│                  AZ-1                   │
│  ┌───────────┐  ┌───────────┐           │
│  │Partition 1│  │Partition 2│           │
│  │ [EC2][EC2]│  │ [EC2][EC2]│           │
│  │ [EC2][EC2]│  │ [EC2][EC2]│           │
│  │ (Rack A)  │  │ (Rack B)  │           │
│  └───────────┘  └───────────┘           │
└─────────────────────────────────────────┘
```
- ✅ Up to **7 partitions per AZ**
- ✅ Hundreds of instances
- ✅ Partitions don't share racks
- 🎯 **Use Case:** Hadoop, Kafka, Cassandra

---

## 📊 Quick Comparison Table

| Feature | Cluster | Spread | Partition |
|---------|---------|--------|-----------|
| Network Speed | 10 Gbps | Normal | Normal |
| Fault Tolerance | Low | High | Medium |
| Max Instances | No limit | 7/AZ | 100s |
| Multi-AZ | ❌ No | ✅ Yes | ✅ Yes |
| Use Case | HPC/ML | Critical Apps | Big Data |

---

## 🛠️ HANDS-ON PRACTICE

### Prerequisites
```
- AWS Account
- AWS CLI installed
- Basic EC2 knowledge
```

---

### Lab 1: Create Placement Groups (Console)

**Step 1: Go to EC2 Console**
```
AWS Console → EC2 → Network & Security → Placement Groups
```

**Step 2: Create Cluster Placement Group**
```
Click "Create placement group"
├── Name: my-cluster-pg
├── Strategy: Cluster
└── Click "Create group"
```

**Step 3: Create Spread Placement Group**
```
Click "Create placement group"
├── Name: my-spread-pg
├── Strategy: Spread
├── Spread Level: Rack (default)
└── Click "Create group"
```

**Step 4: Create Partition Placement Group**
```
Click "Create placement group"
├── Name: my-partition-pg
├── Strategy: Partition
├── Number of partitions: 3
└── Click "Create group"
```

---

### Lab 2: Create Placement Groups (AWS CLI)

```bash
# Create Cluster Placement Group
aws ec2 create-placement-group \
    --group-name my-cluster-pg \
    --strategy cluster \
    --region us-east-1

# Create Spread Placement Group
aws ec2 create-placement-group \
    --group-name my-spread-pg \
    --strategy spread \
    --region us-east-1

# Create Partition Placement Group
aws ec2 create-placement-group \
    --group-name my-partition-pg \
    --strategy partition \
    --partition-count 3 \
    --region us-east-1

# List all placement groups
aws ec2 describe-placement-groups
```

---

### Lab 3: Launch EC2 in Placement Group (CLI)

```bash
# Step 1: Get your AMI ID (Amazon Linux 2)
aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
    --query 'Images[0].ImageId' \
    --output text

# Step 2: Launch instance in CLUSTER placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type c5.large \
    --count 2 \
    --placement "GroupName=my-cluster-pg" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Cluster-Instance}]'

# Step 3: Launch instance in SPREAD placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t3.micro \
    --count 3 \
    --placement "GroupName=my-spread-pg" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Spread-Instance}]'

# Step 4: Launch instance in PARTITION placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t3.micro \
    --count 2 \
    --placement "GroupName=my-partition-pg,PartitionNumber=1" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Partition-Instance}]'
```

---

### Lab 4: Launch EC2 in Placement Group (Console)

```
Step 1: EC2 → Launch Instance
Step 2: Choose AMI → t3.micro
Step 3: Configure Instance Details
    └── Placement Group: ✅ Check box
        ├── Add to placement group: "my-spread-pg"
        └── OR create new group here
Step 4: Complete launch as normal
```

---

### Lab 5: Verify Placement Group Assignment

```bash
# Check which placement group instance is in
aws ec2 describe-instances \
    --query 'Reservations[*].Instances[*].{
        ID:InstanceId,
        State:State.Name,
        PlacementGroup:Placement.GroupName,
        Partition:Placement.PartitionNumber,
        AZ:Placement.AvailabilityZone
    }' \
    --output table

# Describe specific placement group
aws ec2 describe-placement-groups \
    --group-names my-cluster-pg \
    --output table
```

---

### Lab 6: Move Instance to Placement Group

```bash
# Step 1: Stop the instance first
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Step 2: Modify placement
aws ec2 modify-instance-placement \
    --instance-id i-1234567890abcdef0 \
    --group-name my-cluster-pg

# Step 3: Start instance again
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

---

### Lab 7: Terraform Practice (Bonus)

```hcl
# main.tf

# Create Placement Groups
resource "aws_placement_group" "cluster" {
  name     = "my-cluster-pg"
  strategy = "cluster"
}

resource "aws_placement_group" "spread" {
  name     = "my-spread-pg"
  strategy = "spread"
}

resource "aws_placement_group" "partition" {
  name            = "my-partition-pg"
  strategy        = "partition"
  partition_count = 3
}

# Launch EC2 in Cluster Placement Group
resource "aws_instance" "cluster_instance" {
  count             = 2
  ami               = "ami-0abcdef1234567890"
  instance_type     = "c5.large"
  placement_group   = aws_placement_group.cluster.id

  tags = {
    Name = "Cluster-Instance-${count.index + 1}"
  }
}

# Launch EC2 in Spread Placement Group
resource "aws_instance" "spread_instance" {
  count           = 3
  ami             = "ami-0abcdef1234567890"
  instance_type   = "t3.micro"
  placement_group = aws_placement_group.spread.id

  tags = {
    Name = "Spread-Instance-${count.index + 1}"
  }
}
```

---

## 🧹 Cleanup

```bash
# Terminate all instances first
aws ec2 terminate-instances \
    --instance-ids i-xxx i-yyy i-zzz

# Wait for termination, then delete placement groups
aws ec2 delete-placement-group \
    --group-name my-cluster-pg

aws ec2 delete-placement-group \
    --group-name my-spread-pg

aws ec2 delete-placement-group \
    --group-name my-partition-pg
```

---

## ⚠️ Important Rules to Remember

```
1. Cannot merge placement groups
2. Cannot move RUNNING instance (must stop first)
3. Cluster PG → Recommended same instance type
4. Spread PG → Max 7 instances per AZ
5. Placement groups are FREE (pay for instances only)
6. Not all instance types support placement groups
```

---

# 52. Elastic Network Interfaces (ENI) - Hands On

# AWS Elastic Network Interfaces (ENI) - Complete Guide & Hands-On

## 📚 What is an ENI?

An **Elastic Network Interface (ENI)** is a **virtual network card** that you can attach to an EC2 instance in a VPC.

---

## 🔑 Key Concepts

### ENI Components
```
┌─────────────────────────────────────────┐
│           Elastic Network Interface      │
│                                         │
│  • Primary Private IPv4 Address         │
│  • Secondary Private IPv4 Addresses     │
│  • One Elastic IP per Private IP        │
│  • One Public IPv4 Address              │
│  • One or More IPv6 Addresses           │
│  • Security Groups                      │
│  • MAC Address                          │
│  • Source/Destination Check Flag        │
└─────────────────────────────────────────┘
```

### Types of Network Interfaces
| Type | Description |
|------|-------------|
| **Primary ENI (eth0)** | Created automatically with EC2 |
| **Secondary ENI** | Additional ENI you attach manually |
| **EFA** | Elastic Fabric Adapter (HPC workloads) |
| **ENA** | Elastic Network Adapter (high performance) |

---

## 🏗️ ENI Architecture

```
         VPC (10.0.0.0/16)
              │
    ┌─────────┴──────────┐
    │    Subnet           │
    │  (10.0.1.0/24)     │
    │                     │
    │  ┌───────────────┐  │
    │  │   EC2         │  │
    │  │  Instance     │  │
    │  │               │  │
    │  │ eth0 (Primary)│──┼── Security Group A
    │  │ 10.0.1.10     │  │   Public IP / EIP
    │  │               │  │
    │  │ eth1(Secondary│──┼── Security Group B
    │  │ 10.0.1.20     │  │   Different IP
    │  └───────────────┘  │
    └─────────────────────┘
```

---

## 🎯 Use Cases

```
1. 🔀 Management Network Separation
   - eth0 → Application traffic
   - eth1 → Admin/Management traffic

2. 🔄 High Availability / Failover
   - Move ENI from failed instance to standby

3. 🛡️ Dual-homed Instances
   - Connect to multiple subnets

4. 📜 Licensing (MAC-based)
   - Keep same MAC address across instances

5. 🔧 Network Appliances
   - Firewalls, NAT, Load Balancers
```

---

## 🛠️ HANDS-ON PRACTICE

### Lab 1: Create and Explore ENI

#### Step 1: Launch an EC2 Instance
```bash
# Go to AWS Console
EC2 → Instances → Launch Instance

Name: ENI-Test-Instance
AMI: Amazon Linux 2023
Instance Type: t2.micro
Key Pair: Create or use existing
VPC: Default VPC
Subnet: us-east-1a (note this subnet!)
Security Group: Allow SSH (port 22)
```

#### Step 2: View Default ENI
```bash
# After launch, go to:
EC2 → Instances → Select Instance → Networking Tab

# You will see:
- Network Interface: eni-xxxxxxxxx
- Private IP: 172.31.x.x
- Public IP: assigned automatically
- Subnet ID
- Security Groups
```

---

### Lab 2: Create a Secondary ENI

#### Step 2a: Create New ENI
```bash
# Go to:
EC2 → Network & Security → Network Interfaces → Create Network Interface

Settings:
├── Description: "Secondary-ENI-Lab"
├── Subnet: SAME subnet as your EC2 instance ⚠️
├── Private IP: Leave blank (auto-assign) or enter 172.31.x.x
├── Security Groups: Select same or different SG
└── Click: Create
```

#### Step 2b: Attach ENI to Instance
```bash
# Select your new ENI → Actions → Attach

Select Instance: ENI-Test-Instance
Click: Attach
```

#### Step 2c: Verify inside EC2
```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@<public-ip>

# Check network interfaces
ip addr show
# OR
ifconfig

# You should see:
# eth0 - Primary ENI
# eth1 - Secondary ENI (might need config)

# Check routing
ip route show

# See both interfaces
cat /proc/net/if_inet6
```

---

### Lab 3: Configure Secondary ENI (Amazon Linux)

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<public-ip>

# Check interfaces
ip link show

# Bring up eth1
sudo ip link set eth1 up

# Check if IP was assigned
ip addr show eth1

# If no IP, assign manually (DHCP)
sudo dhclient eth1

# Verify
ip addr show
# eth1 should now have an IP

# Test connectivity from eth1
ping -I eth1 8.8.8.8
```

---

### Lab 4: Detach and Move ENI (Failover Demo)

```bash
# This simulates High Availability!

Step 1: Launch Second EC2 Instance
├── Name: ENI-Standby-Instance  
├── Same Subnet as first instance
└── Same settings

Step 2: Note the Secondary ENI from Lab 2

Step 3: Detach ENI from Instance 1
EC2 → Network Interfaces → Select ENI
Actions → Detach
☑️ Force Detach if needed

Step 4: Attach ENI to Instance 2
Select same ENI → Actions → Attach
Select: ENI-Standby-Instance

# The IP address MOVES to new instance!
# This is how failover works!
```

---

### Lab 5: Elastic IP with ENI

```bash
# Step 1: Allocate Elastic IP
EC2 → Elastic IPs → Allocate Elastic IP Address
Click: Allocate

# Step 2: Associate with ENI
Actions → Associate Elastic IP Address
Resource Type: Network Interface
Network Interface: Select your Secondary ENI
Private IP: Select private IP
Click: Associate

# Step 3: Verify
EC2 → Network Interfaces → Select ENI
Check: Elastic IP shown in details

# Step 4: Test
# Now this EIP follows wherever the ENI goes!
```

---

### Lab 6: CLI Commands for ENI

```bash
# Install AWS CLI and configure
aws configure

# List all ENIs
aws ec2 describe-network-interfaces

# List ENIs in specific VPC
aws ec2 describe-network-interfaces \
  --filters "Name=vpc-id,Values=vpc-xxxxxxxx"

# Create ENI via CLI
aws ec2 create-network-interface \
  --subnet-id subnet-xxxxxxxx \
  --description "My-CLI-ENI" \
  --groups sg-xxxxxxxx

# Attach ENI to instance
aws ec2 attach-network-interface \
  --network-interface-id eni-xxxxxxxx \
  --instance-id i-xxxxxxxx \
  --device-index 1

# Detach ENI
aws ec2 detach-network-interface \
  --attachment-id eni-attach-xxxxxxxx

# Delete ENI (must be detached first)
aws ec2 delete-network-interface \
  --network-interface-id eni-xxxxxxxx

# Describe specific ENI
aws ec2 describe-network-interfaces \
  --network-interface-ids eni-xxxxxxxx
```

---

### Lab 7: Source/Destination Check

```bash
# By default, AWS checks if traffic source/destination
# matches the instance. For NAT/VPN, disable this!

# Disable via Console:
EC2 → Network Interfaces → Select ENI
Actions → Change Source/Dest Check
Uncheck: Enable
Save

# Disable via CLI:
aws ec2 modify-network-interface-attribute \
  --network-interface-id eni-xxxxxxxx \
  --no-source-dest-check

# Enable via CLI:
aws ec2 modify-network-interface-attribute \
  --network-interface-id eni-xxxxxxxx \
  --source-dest-check
```

---

## 📊 ENI Limits Per Instance Type

```
Instance Type    │  Max ENIs  │  Max IPs per ENI
─────────────────┼────────────┼─────────────────
t2.micro         │     2      │       2
t2.small         │     3      │       4
t2.medium        │     3      │       6
t3.medium        │     3      │       6
m5.large         │     3      │      10
m5.xlarge        │     4      │      15
c5.xlarge        │     4      │      15
r5.large         │     3      │      10
```

---

## 🔒 Security Group with ENI

```bash
# Each ENI can have different Security Groups!

ENI eth0 (Primary):
└── Security Group: Allow HTTP (80), HTTPS (443)

ENI eth1 (Secondary):  
└── Security Group: Allow SSH (22) from Admin IP only

# This provides network traffic separation!

# Add Security Group to ENI:
EC2 → Network Interfaces → Select ENI
Actions → Change Security Groups
Add/Remove Security Groups
```

---

## 🧹 Cleanup Commands

```bash
# IMPORTANT: Clean up to avoid charges!

# 1. Terminate EC2 Instances
EC2 → Instances → Select → Terminate

# 2. Release Elastic IPs (if not associated)
EC2 → Elastic IPs → Release

# 3. Delete Custom ENIs
EC2 → Network Interfaces → Delete (if not auto-deleted)

# Via CLI:
aws ec2 terminate-instances --instance-ids i-xxxxxxxx
aws ec2 release-address --allocation-id eipalloc-xxxxxxxx
aws ec2 delete-network-interface --network-interface-id eni-xxxxxxxx
```

---

## 📝 Quick Summary

```
┌────────────────────────────────────────────┐
│              ENI Key Points                 │
├────────────────────────────────────────────┤
│ ✅ Virtual network card in VPC             │
│ ✅ Bound to specific Availability Zone     │
│ ✅ Can have multiple private IPs           │
│ ✅ Can attach/detach from instances        │
│ ✅ Retains attributes when moved           │
│ ✅ Each has own Security Groups            │
│ ✅ Useful for HA & failover               │
│ ✅ Used for network appliances            │
│ ❌ Cannot move across AZs                 │
│ ❌ Cannot move across VPCs                │
└────────────────────────────────────────────┘
```

---

## 🎓 Practice Checklist

- [ ] Create EC2 and view primary ENI
- [ ] Create secondary ENI manually
- [ ] Attach secondary ENI to instance
- [ ] SSH and verify eth0 & eth1
- [ ] Assign Elastic IP to ENI
- [ ] Move ENI between instances
- [ ] Disable Source/Destination Check
- [ ] Use CLI to manage ENIs
- [ ] Clean up all resources

---

**💡 Pro Tips:**
- ENI stays in **same AZ** always
- Primary ENI **cannot be detached**
- ENI keeps its **attributes when moved**
- Use **different SGs per ENI** for security isolation

---

# 55. EC2 Hibernate - Hands On

# AWS EC2 Hibernate - Complete Guide + Hands-On

## 📚 What is EC2 Hibernate?

**Hibernate** saves the **RAM contents** to the **EBS root volume**, so when you start the instance again, it resumes exactly where it left off — **faster than a normal start**.

---

## 🔄 Normal Stop vs Hibernate vs Terminate

| Action | RAM | EBS Root Volume | Boot Time |
|--------|-----|-----------------|-----------|
| **Stop** | Cleared | Persisted | Fresh boot (slow) |
| **Hibernate** | Saved to EBS | Persisted | Fast resume |
| **Terminate** | Cleared | Deleted (default) | N/A |

---

## 🏗️ How Hibernate Works

```
Instance Running
     │
     ▼
User triggers Hibernate
     │
     ▼
RAM contents dumped → EBS Root Volume (encrypted)
     │
     ▼
Instance STOPS (billing pauses for compute)
     │
     ▼
User starts instance again
     │
     ▼
RAM restored from EBS → Instance resumes instantly
```

---

## ✅ Requirements for Hibernate

| Requirement | Details |
|-------------|---------|
| **OS Support** | Amazon Linux 2, Ubuntu, Windows |
| **RAM Size** | Must be **less than 150 GB** |
| **Root Volume** | Must be **EBS** (not instance store) |
| **Root Volume Size** | Must be large enough to store RAM |
| **Encryption** | EBS root volume **MUST be encrypted** |
| **Instance Types** | Most types EXCEPT bare metal |
| **Max Hibernate Duration** | **60 days** |

---

## 🛠️ HANDS-ON PRACTICE

### Step 1: Launch EC2 Instance with Hibernate Support

```
AWS Console → EC2 → Launch Instance
```

**Configuration:**
```
Name: hibernate-test
AMI: Amazon Linux 2 (HVM)
Instance Type: t2.micro (or t3.micro)
```

---

### Step 2: Configure Storage (MUST be Encrypted)

```
Storage Settings:
├── Volume Type: gp2 or gp3
├── Size: 20 GB (must be > RAM size)
├── ✅ Encrypted: YES  ← MANDATORY
└── KMS Key: aws/ebs (default)
```

> ⚠️ **If not encrypted → Hibernate option won't appear!**

---

### Step 3: Enable Hibernate in Advanced Details

```
Advanced Details → Stop - Hibernate behavior
└── Select: ✅ Enable
```

---

### Step 4: Launch the Instance

```
→ Add Key Pair (or create new)
→ Security Group: Allow SSH (port 22)
→ Launch Instance
```

---

### Step 5: Connect and Check Uptime

```bash
# Connect via SSH
ssh -i your-key.pem ec2-user@<public-ip>

# Check uptime (note the time)
uptime

# Output example:
# 10:30:22 up 2 min, 1 user, load average: 0.00
```

---

### Step 6: Hibernate the Instance

```
AWS Console:
→ Select your instance
→ Instance State → Hibernate
→ Confirm
```

**Watch the states:**
```
Running → Stopping → Stopped
(This takes 30-60 seconds)
```

---

### Step 7: Start the Instance Again

```
→ Select instance
→ Instance State → Start
→ Wait for Running state
```

---

### Step 8: Verify Hibernate Worked (Check Uptime)

```bash
# Connect again via SSH
ssh -i your-key.pem ec2-user@<public-ip>

# Check uptime again
uptime

# Output example:
# 10:45:00 up 17 min, 1 user, load average: 0.00
#           ^^^^^^^^
#    Uptime CONTINUED from before hibernate!
#    (Not reset to 0 like normal stop/start)
```

> ✅ **If uptime continued → Hibernate worked successfully!**

---

## 🔍 What to Verify After Hibernate

```bash
# 1. Check uptime (should continue from before)
uptime

# 2. Check running processes (still running)
ps aux

# 3. Check system logs
sudo dmesg | tail -20

# 4. You'll see hibernate/resume messages in logs
sudo cat /var/log/messages | grep -i hibernate
```

---

## 💡 Real-World Use Cases

```
1. Long-running processes
   └── ML training jobs, batch processing

2. Development environments
   └── Resume IDE, running servers instantly

3. Cost saving
   └── Hibernate overnight, resume next morning
      (No compute cost during hibernation)

4. Quick environment snapshots
   └── Save exact state before risky changes
```

---

## 💰 Billing During Hibernate

```
✅ NO charge for → EC2 compute (instance hours)
✅ NO charge for → Elastic IP (associated with instance)
❌ YES charge for → EBS storage (root volume)
❌ YES charge for → Other EBS volumes attached
```

---

## ❌ Common Mistakes & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Hibernate option grayed out | EBS not encrypted | Enable encryption on root volume |
| Can't hibernate | Instance type not supported | Use supported instance type |
| Hibernate fails | RAM > 150 GB | Use smaller instance |
| Root volume too small | RAM dump won't fit | Increase root volume size |

---

## 📝 Quick Summary

```
EC2 Hibernate = "Laptop Sleep Mode"

Key Points:
├── RAM saved to EBS root volume
├── EBS MUST be encrypted
├── RAM must be < 150 GB
├── Max 60 days hibernation
├── Faster startup than stop/start
├── No compute charges while hibernated
└── Uptime clock continues after resume
```

---

## 🧹 Cleanup (Important!)

```
After practice:
→ Select instance
→ Instance State → Terminate
→ This avoids EBS storage charges
```

---

## 🎯 Practice Checklist

```
□ Launched instance with encrypted EBS
□ Enabled hibernate in advanced settings
□ Noted uptime before hibernate
□ Successfully hibernated instance
□ Restarted and verified uptime continued
□ Checked instance was in "stopped" state during hibernate
□ Terminated instance after practice
```

---

# 57 EBS Hands On

# AWS EBS (Elastic Block Store) - Complete Guide & Hands-On

## 📚 What is EBS?

EBS is a **persistent block storage** service for EC2 instances - like a virtual hard drive that:
- Persists data even after EC2 stops/terminates
- Can be attached/detached from instances
- Lives in a **specific Availability Zone**
- Can be backed up using **Snapshots**

---

## 🏗️ EBS Volume Types

| Type | Use Case | Performance |
|------|----------|-------------|
| **gp2/gp3** | General Purpose SSD | Balanced price/performance |
| **io1/io2** | High Performance SSD | Databases, high IOPS |
| **st1** | Throughput HDD | Big data, logs |
| **sc1** | Cold HDD | Infrequent access |

---

## 🛠️ HANDS-ON PRACTICE

### ✅ Step 1: Launch an EC2 Instance

1. Go to **EC2 Console** → Click **Launch Instance**
2. Name: `EBS-Practice`
3. AMI: **Amazon Linux 2023**
4. Instance Type: `t2.micro` (free tier)
5. Key Pair: Create or select existing
6. **Keep default 8GB gp3 root volume**
7. Click **Launch Instance**

---

### ✅ Step 2: Create a New EBS Volume

1. Go to **EC2 Console** → Left sidebar → **Volumes**
2. Click **Create Volume**
3. Configure:
```
Volume Type: gp3
Size: 10 GB
Availability Zone: ⚠️ SAME as your EC2 instance!
(e.g., us-east-1a)
```
4. Add Tag → Key: `Name`, Value: `My-Practice-Volume`
5. Click **Create Volume**

---

### ✅ Step 3: Attach EBS Volume to EC2

1. Select your new volume → Click **Actions**
2. Click **Attach Volume**
3. Select your EC2 instance
4. Device name: `/dev/sdf` (auto-suggested)
5. Click **Attach Volume**

---

### ✅ Step 4: Connect to EC2 & Use the Volume

Go to **EC2** → Select instance → Click **Connect** → **EC2 Instance Connect**

```bash
# 1. Check available disks
lsblk
```
**You should see something like:**
```
NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk
└─xvda1 202:1    0   8G  0 part /
xvdf    202:80   0  10G  0 disk   ← Your new volume!
```

```bash
# 2. Check if volume has a filesystem
sudo file -s /dev/xvdf
```
**Output: `/dev/xvdf: data` means NO filesystem yet**

```bash
# 3. Create a filesystem (format the volume)
sudo mkfs -t ext4 /dev/xvdf
```

```bash
# 4. Create a mount point directory
sudo mkdir /mnt/mydata
```

```bash
# 5. Mount the volume
sudo mount /dev/xvdf /mnt/mydata
```

```bash
# 6. Verify it's mounted
df -h
```
**You should see `/dev/xvdf` mounted at `/mnt/mydata`**

```bash
# 7. Create test files on the new volume
cd /mnt/mydata
sudo touch file1.txt file2.txt
echo "Hello EBS!" | sudo tee file1.txt
ls -la
cat file1.txt
```

---

### ✅ Step 5: Make Mount Permanent (Auto-mount after reboot)

```bash
# Get the UUID of your volume
sudo blkid /dev/xvdf
```
**Output example:**
```
/dev/xvdf: UUID="abc123-..." TYPE="ext4"
```

```bash
# Edit fstab file
sudo nano /etc/fstab
```

**Add this line at the bottom** (replace UUID with yours):
```
UUID=abc123-...  /mnt/mydata  ext4  defaults,nofail  0  2
```

```bash
# Test fstab is correct (no errors = good!)
sudo mount -a

# Verify
df -h
```

---

### ✅ Step 6: EBS Snapshots (Backup)

**In AWS Console:**
1. Go to **Volumes** → Select your volume
2. Click **Actions** → **Create Snapshot**
3. Description: `My first EBS snapshot`
4. Click **Create Snapshot**

**Check it:**
- Left sidebar → **Snapshots**
- Wait for status: `pending` → `completed`

---

### ✅ Step 7: Restore from Snapshot

1. Go to **Snapshots** → Select your snapshot
2. Click **Actions** → **Create Volume from Snapshot**
3. Choose same AZ as your instance
4. Click **Create Volume**

> ✅ This is how you **restore data** or **copy volume to another AZ**

---

### ✅ Step 8: Increase EBS Volume Size (Elastic Volumes)

```bash
# Current size check
df -h /mnt/mydata
```

**In AWS Console:**
1. Go to **Volumes** → Select volume
2. Click **Actions** → **Modify Volume**
3. Change size from `10 GB` → `15 GB`
4. Click **Modify** → Confirm

**Back in EC2 terminal:**
```bash
# Check disk shows new size
lsblk
# xvdf should show 15G

# Grow the filesystem to use new space
sudo resize2fs /dev/xvdf

# Verify new size
df -h /mnt/mydata
```
🎉 **No downtime needed! Volume expanded live!**

---

### ✅ Step 9: Detach and Delete Volume

**In terminal first:**
```bash
# Unmount before detaching
cd ~
sudo umount /mnt/mydata

# Verify unmounted
df -h
```

**In AWS Console:**
1. Go to **Volumes** → Select volume
2. Click **Actions** → **Detach Volume**
3. Wait for state: `available`
4. Click **Actions** → **Delete Volume**

---

## 🧠 Key EBS Concepts Summary

```
📌 EBS Facts to Remember:
━━━━━━━━━━━━━━━━━━━━━━━━
✅ EBS = Network drive (not physically attached)
✅ Locked to ONE Availability Zone
✅ Can attach/detach from instances
✅ Data persists when instance stops
✅ Root volume: deleted on termination (by default)
✅ Snapshots = backups stored in S3
✅ Snapshots can copy data across AZ/Regions
✅ Can increase size without downtime
```

---

## 🔥 Quick Cheat Sheet - Linux Commands

```bash
lsblk                          # List all block devices
df -h                          # Show disk usage
sudo file -s /dev/xvdf         # Check filesystem
sudo mkfs -t ext4 /dev/xvdf    # Format volume
sudo mount /dev/xvdf /mnt/dir  # Mount volume
sudo umount /mnt/dir           # Unmount volume
sudo blkid                     # Show UUIDs
sudo resize2fs /dev/xvdf       # Resize filesystem
```

---

## ⚠️ Important Things to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Detach without unmounting | Always `umount` first |
| Use different AZ for attachment | Same AZ required |
| Delete volume with data | Snapshot first! |
| Forget fstab after reboot | Add UUID to `/etc/fstab` |

---

## 🎯 Practice Challenges

Try these on your own:
1. 🔸 Create 2 volumes and attach both to same instance
2. 🔸 Copy a snapshot to a different region
3. 🔸 Create an AMI from your instance
4. 🔸 Try **io2** volume type and compare
5. 🔸 Enable **EBS Encryption** on a new volume

---
# 59. EBS Snapshots - Hands On


# AWS EBS Snapshots - Complete Guide & Hands-On

## 📚 What is EBS Snapshot?

> **EBS Snapshot** is a **point-in-time backup** of your EBS volume stored in **Amazon S3** (managed by AWS, not visible in your S3 console)

---

## 🔑 Key Concepts

```
EBS Volume  ──snapshot──►  EBS Snapshot (S3)  ──restore──►  New EBS Volume
                                    │
                                    ├──► Copy to another Region
                                    ├──► Share with another Account
                                    └──► Create AMI
```

| Feature | Details |
|---------|---------|
| **Storage** | Stored in S3 (AWS managed) |
| **Type** | Incremental backup |
| **Cost** | Pay only for changed blocks |
| **Region** | Can copy across regions |
| **Encryption** | Can encrypt unencrypted volumes |

---

## 📊 Incremental Snapshot Concept

```
Day 1: Full Snapshot    [████████████] 10GB  → stores 10GB
Day 2: Incremental      [░░░░████░░░░]  2GB  → stores only 2GB (changed)
Day 3: Incremental      [░░░░░░░░████]  1GB  → stores only 1GB (changed)

Total stored = 13GB  (NOT 30GB)
```

---

## 🌟 EBS Snapshot Features

### 1. EBS Snapshot Archive
```
Standard Tier  ──archive──►  Archive Tier
(expensive)                  (75% cheaper)
                             ⚠️ Restore takes 24-72 hours
```

### 2. Recycle Bin
```
Delete Snapshot ──► Recycle Bin (1 day - 1 year) ──► Permanent Delete
                         │
                         └──► Can RECOVER if deleted by mistake
```

### 3. Fast Snapshot Restore (FSR)
```
Normal Restore: Volume needs "warm-up" (first access is slow)
FSR:            Instant full performance (💰 costs more)
```

---

## 🛠️ HANDS-ON PRACTICE

---

## ✅ Step 1: Launch EC2 + Create EBS Volume

### 1.1 Launch EC2 Instance
```
EC2 Console → Launch Instance
├── Name: snapshot-demo
├── AMI: Amazon Linux 2023
├── Instance Type: t2.micro
├── Key Pair: Create or select existing
└── Launch!
```

### 1.2 Check Default EBS Volume
```
EC2 → Instances → select instance
→ Storage tab
→ You'll see: /dev/xvda (8GB root volume)
→ Click Volume ID → remember it
```

---

## ✅ Step 2: Create a Snapshot (via Console)

```
EC2 → Elastic Block Store → Volumes
→ Select your Volume
→ Actions → Create Snapshot
```

Fill in:
```
┌─────────────────────────────────────┐
│ Description: my-first-snapshot      │
│                                     │
│ Tags:                               │
│   Key: Name                         │
│   Value: demo-snapshot-v1           │
└─────────────────────────────────────┘
→ Click "Create Snapshot"
```

### Check Snapshot Status:
```
EC2 → Elastic Block Store → Snapshots
→ Status: pending ──► completed ✅
```

---

## ✅ Step 3: Add Data to Volume & Create 2nd Snapshot

### 3.1 Connect to EC2 via EC2 Instance Connect
```
EC2 → Instances → Select instance → Connect
→ EC2 Instance Connect → Connect
```

### 3.2 Write some data
```bash
# Check disk
df -h

# Create a test file
sudo mkdir /data
sudo touch /data/important-file.txt
sudo bash -c 'echo "This is important data - Version 2" > /data/important-file.txt'

# Verify
cat /data/important-file.txt
```

### 3.3 Create 2nd Snapshot (Console)
```
EC2 → Volumes → Select Volume
→ Actions → Create Snapshot
→ Description: my-second-snapshot (with data)
→ Tag Name: demo-snapshot-v2
→ Create Snapshot ✅
```

---

## ✅ Step 4: Restore Snapshot to New Volume (Console)

```
EC2 → Snapshots
→ Select "demo-snapshot-v2"
→ Actions → Create Volume from Snapshot
```

Configure:
```
┌──────────────────────────────────────────┐
│ Volume Type:  gp3                        │
│ Size:         8 GB                       │
│ Availability Zone: us-east-1a ⚠️ SAME AZ │
│                    as your EC2           │
│ Encryption:   Not encrypted              │
│ Tag Name:     restored-volume            │
└──────────────────────────────────────────┘
→ Create Volume ✅
```

---

## ✅ Step 5: Attach Restored Volume to EC2 (Console)

```
EC2 → Volumes → Select "restored-volume"
→ Status must be "available"
→ Actions → Attach Volume
```

```
┌─────────────────────────────────┐
│ Instance: select your EC2       │
│ Device name: /dev/sdf           │
└─────────────────────────────────┘
→ Attach Volume ✅
```

---

## ✅ Step 6: Mount & Verify Restored Data

### Go back to EC2 Instance Connect:

```bash
# List all block devices
lsblk
```
```
# Output:
NAME     MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda     202:0    0   8G  0 disk
└─xvda1  202:1    0   8G  0 part /
xvdf     202:80   0   8G  0 disk  ← NEW restored volume
```

```bash
# Mount the restored volume
sudo mkdir /restored
sudo mount -o nouuid /dev/nvme1n1p1 /restored // Can be change

# Check the data
ls /restored/data/
cat /restored/data/important-file.txt
```

```
# Expected output:
This is important data - Version 2  ✅
```

**🎉 Data successfully restored from snapshot!**

---

## ✅ Step 7: Copy Snapshot to Another Region (Console)

```
EC2 → Snapshots
→ Select any snapshot
→ Actions → Copy Snapshot
```

```
┌──────────────────────────────────────────┐
│ Destination Region: eu-west-1 (Ireland)  │
│ Description: copied-snapshot-ireland     │
│ Encryption: Keep same setting            │
└──────────────────────────────────────────┘
→ Copy Snapshot ✅
```

> 💡 **Why?** Disaster Recovery - if us-east-1 goes down, you have backup in Ireland!

---

## ✅ Step 8: Setup Recycle Bin (Console)

```
EC2 → Elastic Block Store → Recycle Bin
→ Create retention rule
```

```
┌──────────────────────────────────────────┐
│ Rule Name: protect-my-snapshots          │
│ Resource Type: EBS Snapshots             │
│ Retention Period: 7 Days                 │
│ Apply to: All Snapshots                  │
└──────────────────────────────────────────┘
→ Create Retention Rule ✅
```

### Test Recycle Bin:
```
EC2 → Snapshots
→ Select demo-snapshot-v1
→ Actions → Delete Snapshot → Delete

→ Go to Recycle Bin → Resources
→ You'll see your deleted snapshot! 🗑️
```

### Recover deleted snapshot:
```
Recycle Bin → Resources
→ Select snapshot → Recover
→ Check Snapshots → it's BACK! ✅
```

---

## ✅ Step 9: Enable Fast Snapshot Restore (Console)

```
EC2 → Snapshots
→ Select a snapshot
→ Actions → Manage Fast Snapshot Restore
```

```
┌──────────────────────────────────────────┐
│ Select Availability Zone: us-east-1a     │
│ → Enable FSR                             │
└──────────────────────────────────────────┘
```

> ⚠️ **Warning**: FSR costs money! Disable after testing
```
Actions → Manage Fast Snapshot Restore → Disable
```

---

## ✅ Step 10: Create Snapshot via AWS CLI (Bonus)

```bash
# In EC2 Instance Connect or CloudShell

# Get Volume ID first
aws ec2 describe-volumes \
  --query 'Volumes[*].[VolumeId,Size,State]' \
  --output table

# Create Snapshot
aws ec2 create-snapshot \
  --volume-id vol-xxxxxxxxxxxxxxxxx \
  --description "CLI snapshot demo" \
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Name,Value=cli-snapshot}]'

# Check status
aws ec2 describe-snapshots \
  --owner-ids self \
  --query 'Snapshots[*].[SnapshotId,State,Description]' \
  --output table
```

---

## 🧹 Cleanup (Important - Avoid Charges!)

```
1. EC2 → Snapshots → Delete all test snapshots
2. EC2 → Volumes → Delete restored-volume (detach first)
3. Recycle Bin → Delete retention rule
4. Disable FSR (if enabled)
5. Go to eu-west-1 → Delete copied snapshot
6. Terminate EC2 instance
```

---

## 📋 Summary Cheat Sheet

```
┌─────────────────────────────────────────────────────┐
│              EBS SNAPSHOT QUICK REFERENCE           │
├─────────────────┬───────────────────────────────────┤
│ Create Snapshot │ Volumes → Actions → Create Snap   │
│ Restore Volume  │ Snapshots → Create Volume from    │
│ Copy Region     │ Snapshots → Actions → Copy        │
│ Share Snapshot  │ Snapshots → Actions → Share       │
│ Recycle Bin     │ EBS → Recycle Bin → Create Rule   │
│ FSR             │ Snapshots → Manage FSR            │
│ Archive         │ Snapshots → Actions → Archive     │
└─────────────────┴───────────────────────────────────┘
```

---

## 💰 Cost Reminder

| Feature | Cost |
|---------|------|
| Snapshot storage | ~$0.05/GB/month |
| Cross-region copy | Data transfer charges |
| Fast Snapshot Restore | ~$0.75/AZ/hour |
| Archive tier | ~75% cheaper than standard |

---

## 🎯 Key Takeaways

> 1. ✅ Snapshots are **incremental**
> 2. ✅ Stored in **S3** (AWS managed)
> 3. ✅ Can **copy across regions** for DR
> 4. ✅ Can **restore** to any AZ (same or different)
> 5. ✅ **Recycle Bin** protects against accidental deletion
> 6. ✅ **FSR** = instant performance but costs more

---




