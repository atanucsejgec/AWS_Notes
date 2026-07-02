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

