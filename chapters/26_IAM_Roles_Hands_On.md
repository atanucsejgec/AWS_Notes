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



