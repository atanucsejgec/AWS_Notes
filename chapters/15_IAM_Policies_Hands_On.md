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





