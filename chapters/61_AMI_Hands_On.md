# 61. AMI Hands On

# AWS AMI (Amazon Machine Image) - Complete Guide & Hands-On

## 📚 What is AMI?

An **AMI (Amazon Machine Image)** is a template that contains:
- **Operating System** (Linux, Windows, etc.)
- **Application Server** (Apache, Nginx, etc.)
- **Applications/Software** pre-installed
- **Storage configuration** (EBS snapshots)
- **Launch permissions**
- **Block device mapping**

---

## 🏗️ AMI Components

```
AMI = OS + Software + Configuration + Storage Mapping
         ↓
    Used to launch EC2 instances
         ↓
    Multiple identical instances from one AMI
```

---

## 🔄 AMI Types

| Type | Description | Cost |
|------|-------------|------|
| **AWS Managed** | Provided by AWS (Amazon Linux, Ubuntu) | Free |
| **AWS Marketplace** | Third-party vendors | May have cost |
| **Community AMIs** | Shared by community | Free |
| **Custom AMI** | You create it | Storage cost only |

---

## 🌍 AMI is Region Specific

```
us-east-1 AMI ≠ us-west-2 AMI
(Same AMI ID won't work across regions)
You must COPY AMI to use in another region
```

---

# 🛠️ HANDS-ON PRACTICE

---

## Lab 1: Launch EC2 from AWS Managed AMI (Console Only)

### Step 1: Go to EC2 Console
```
AWS Console → EC2 → Instances → Launch Instance
```

### Step 2: Choose AMI
```
Name: MyWebServer
AMI: Amazon Linux 2023 (Free Tier)
Instance Type: t2.micro
Key Pair: Create new → "my-ami-lab-key"
Security Group: Allow SSH (22) + HTTP (80)
```

### Step 3: Add User Data (bootstrap script)
```
Advanced Details → User Data → paste this:
```

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello from $(hostname) - AMI Lab!</h1>" > /var/www/html/index.html
```

### Step 4: Launch
```
Click "Launch Instance" → Wait 2-3 minutes
```

### Step 5: Test
```
Copy Public IP → Open browser → http://PUBLIC_IP
You should see: "Hello from ip-xxx - AMI Lab!"
```

---

## Lab 2: Create Custom AMI from Running Instance (Console Only)

### Step 1: Select Your Running Instance
```
EC2 → Instances → Select "MyWebServer" instance
```

### Step 2: Create Image
```
Actions → Image and Templates → Create Image
```

### Step 3: Fill Details
```
Image Name: MyWebServer-AMI-v1
Image Description: Apache web server with custom page
No Reboot: ✅ Check this (keeps instance running)
```

```
📌 Note: 
- No Reboot = instance stays running (slight risk of data inconsistency)
- No Reboot unchecked = AWS reboots instance (safer, consistent)
```

### Step 4: Create Image
```
Click "Create Image"
Go to → EC2 → AMIs → Wait for Status: "available"
(Takes 2-5 minutes)
```

---

## Lab 3: Launch New Instance from Custom AMI (Console Only)

### Step 1: Go to Your AMIs
```
EC2 → AMIs → Select "MyWebServer-AMI-v1"
```

### Step 2: Launch from AMI
```
Click "Launch instance from AMI"
```

### Step 3: Configure
```
Name: MyWebServer-from-AMI
Instance Type: t2.micro
Key Pair: my-ami-lab-key (same key)
Security Group: Allow SSH + HTTP
```

```
⚠️ NO User Data needed!
(Apache is already baked into the AMI)
```

### Step 4: Launch & Test
```
Copy new Public IP → Open browser → http://NEW_PUBLIC_IP
You should IMMEDIATELY see the web page!
(No setup required - it was in the AMI)
```

---

## Lab 4: Copy AMI to Another Region (Console Only)

### Step 1: Select Your AMI
```
EC2 → AMIs → Select "MyWebServer-AMI-v1"
```

### Step 2: Copy AMI
```
Actions → Copy AMI
```

### Step 3: Fill Details
```
Destination Region: us-west-2 (or any other region)
Name: MyWebServer-AMI-v1-copy
Description: Copy from us-east-1
```

### Step 4: Copy
```
Click "Copy AMI"
Switch to us-west-2 region → EC2 → AMIs
Wait for status "available"
```

---

## Lab 5: Share AMI with Another Account (Console Only)

### Step 1: Select AMI
```
EC2 → AMIs → Select your AMI
```

### Step 2: Edit Permissions
```
Actions → Edit AMI Permissions
```

### Step 3: Choose Sharing Type
```
○ Private (default - only you)
○ Public (everyone can use)
● Shared with specific accounts → Add Account ID
```

```
Enter: 123456789012 (another AWS account ID)
Click "Add Account" → Save Changes
```

---

## Lab 6: Deregister AMI & Delete Snapshot (Console Only)

```
⚠️ AMIs cost money via EBS Snapshots!
Clean up when done.
```

### Step 1: Deregister AMI
```
EC2 → AMIs → Select AMI
Actions → Deregister AMI → Confirm
```

### Step 2: Delete Associated Snapshot
```
EC2 → Snapshots → Find the snapshot
(Description will mention the AMI name)
Actions → Delete Snapshot → Confirm
```

---

## Lab 7: Modify Instance & Create New AMI Version (EC2 Instance Connect)

### Step 1: Connect to Original Instance
```
EC2 → Instances → Select MyWebServer → Connect
→ EC2 Instance Connect → Connect
```

### Step 2: Modify the Web Page
```bash
# Update the webpage
sudo echo "<h1>Version 2 - Updated AMI!</h1><p>New content added</p>" \
  > /var/www/html/index.html

# Install additional software
sudo yum install -y wget curl

# Verify
curl localhost
```

### Step 3: Create AMI v2 (Back to Console)
```
Select Instance → Actions → Image and Templates → Create Image
Name: MyWebServer-AMI-v2
Description: Apache + updated page + additional tools
```

---

## 🔍 Key Concepts Summary

```
┌─────────────────────────────────────────────────────┐
│                    AMI LIFECYCLE                     │
│                                                      │
│  Running EC2 ──→ Create AMI ──→ AMI (available)     │
│                                    │                 │
│                                    ▼                 │
│                          Launch New EC2              │
│                          (exact copy, instantly)     │
│                                                      │
│  AMI = EBS Snapshots + Configuration                 │
│  Deregister AMI + Delete Snapshots to avoid cost    │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Important Points to Remember

| Concept | Detail |
|---------|--------|
| **AMI Scope** | Region specific |
| **AMI Cost** | EBS Snapshot cost |
| **No Reboot** | Faster but slight risk |
| **Sharing** | Can share with account ID or make public |
| **Cross Region** | Must copy AMI |
| **Cleanup** | Deregister AMI + Delete Snapshot |
| **Benefits** | Fast launch, pre-configured, consistent |

---

## ✅ Clean Up Everything

```
1. Terminate all EC2 instances
2. Deregister all AMIs you created
3. Delete all associated Snapshots
4. Delete Key Pair (optional)
```

---

## 🎯 Practice Checklist

- [ ] Launch EC2 with User Data
- [ ] Create Custom AMI
- [ ] Launch instance from Custom AMI (no user data)
- [ ] Verify it works immediately
- [ ] Copy AMI to another region
- [ ] Share AMI with permissions
- [ ] Deregister AMI
- [ ] Delete Snapshot
- [ ] Clean up all resources

---

**🏆 You now understand AMI completely!**

The key benefit: **"Bake everything into AMI → Launch instantly → Scale fast"**
---






