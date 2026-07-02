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



