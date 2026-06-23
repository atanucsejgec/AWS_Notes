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
