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

