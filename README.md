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

## 🎯 Next Steps After This

```
1. IAM Roles
2. IAM Policies (deeper dive)
3. AWS CLI with MFA
4. AWS Organizations + MFA
```

---

