# Amazon EFS (Elastic File System) - Complete Guide

## What is Amazon EFS?

Amazon EFS is a **fully managed, scalable, shared file storage** service that works with AWS Cloud services and on-premises resources.

---

## Why EFS is Important?

### Key Problems EFS Solves

```
WITHOUT EFS:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   EC2 - 1   │     │   EC2 - 2   │     │   EC2 - 3   │
│  [EBS Vol]  │     │  [EBS Vol]  │     │  [EBS Vol]  │
│  /data      │     │  /data      │     │  /data      │
└─────────────┘     └─────────────┘     └─────────────┘
     ❌ Each EC2 has its OWN storage - Cannot share files!

WITH EFS:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   EC2 - 1   │     │   EC2 - 2   │     │   EC2 - 3   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Amazon EFS │
                    │ (Shared FS) │
                    └─────────────┘
       ✅ ALL EC2 instances share SAME files!
```

---

## EFS vs EBS vs S3 Comparison

| Feature | EBS | EFS | S3 |
|---------|-----|-----|-----|
| **Type** | Block Storage | File Storage | Object Storage |
| **Access** | 1 EC2 at a time | Multiple EC2s | Anyone via URL |
| **Protocol** | -  | NFS | HTTP/HTTPS |
| **Scaling** | Manual | Automatic | Automatic |
| **Use Case** | OS, DB | Shared files | Backups, media |
| **AZ** | Single AZ | Multi-AZ | Global |
| **Price** | Cheaper | More expensive | Cheapest |

---

## EFS Key Features

```
┌─────────────────────────────────────────────┐
│              Amazon EFS Features             │
├─────────────────────────────────────────────┤
│  ✅ Fully Managed (No server management)    │
│  ✅ Auto Scaling (Grows/Shrinks with data)  │
│  ✅ Multi-AZ (High Availability)            │
│  ✅ NFS Protocol (v4.1, v4.0)              │
│  ✅ Linux Only (Not Windows)               │
│  ✅ Encryption at rest & in transit        │
│  ✅ Pay only for what you use              │
└─────────────────────────────────────────────┘
```

---

## EFS Storage Classes

```
┌─────────────────────────────────────────────────┐
│              EFS Storage Classes                │
├─────────────────┬───────────────────────────────┤
│  Standard       │ Frequently accessed data      │
│                 │ High performance               │
├─────────────────┼───────────────────────────────┤
│  Standard-IA    │ Infrequently accessed          │
│  (Infrequent    │ 92% cheaper than Standard     │
│   Access)       │ Retrieval fee applies          │
├─────────────────┼───────────────────────────────┤
│  One Zone       │ Single AZ - cheaper            │
│                 │ Dev/Test environments          │
├─────────────────┼───────────────────────────────┤
│  One Zone-IA    │ Cheapest option                │
│                 │ Non-critical data              │
└─────────────────┴───────────────────────────────┘
```

---

## EFS Performance Modes

```
Performance Modes:
┌─────────────────┬────────────────────────────────┐
│ General Purpose │ Default, Low latency            │
│                 │ Web serving, CMS, Home dirs     │
├─────────────────┼────────────────────────────────┤
│ Max I/O         │ Higher latency, High throughput │
│                 │ Big data, Media processing      │
└─────────────────┴────────────────────────────────┘

Throughput Modes:
┌─────────────────┬────────────────────────────────┐
│ Bursting        │ Scales with file system size    │
│                 │ Good for variable workloads     │
├─────────────────┼────────────────────────────────┤
│ Provisioned     │ Fixed throughput regardless     │
│                 │ of size                         │
├─────────────────┼────────────────────────────────┤
│ Elastic         │ Auto scales throughput          │
│  (Recommended)  │ Best for unpredictable loads   │
└─────────────────┴────────────────────────────────┘
```

---

# 🛠️ HANDS-ON LAB

## Architecture We Will Build

```
        ┌─────────────────────────────────────┐
        │            us-east-1                │
        │                                     │
        │  ┌──────────┐    ┌──────────┐       │
        │  │  EC2 #1  │    │  EC2 #2  │       │
        │  │ (AZ: 1a) │    │ (AZ: 1b) │       │
        │  └────┬─────┘    └─────┬────┘       │
        │       │                │            │
        │  ┌────▼────────────────▼────┐       │
        │  │        Amazon EFS        │       │
        │  │    /shared-data/         │       │
        │  │  (mounted on both EC2s)  │       │
        │  └──────────────────────────┘       │
        └─────────────────────────────────────┘
Goal: Write file on EC2#1 → See it on EC2#2 ✅
```

---

## STEP 1: Create Security Groups (Console)

---


```
CORRECT ORDER:
─────────────────────────────────────
Step 1 → Create EC2-SG FIRST
Step 2 → Create EFS-SG SECOND
         (now you can search EC2-SG in source)
─────────────────────────────────────
```

### When creating EFS-SG Source field:
```
┌─────────────────────────────────────────────────┐
│  Source Type : Custom                           │
│  Source      : Search "EC2-SG" → select it     │
│                                                 │
│  🔍 Type "EC2" in search box                   │
│     it will show your EC2-SG                   │
└─────────────────────────────────────────────────┘
```

---

## Visual Guide

```
Source Type Dropdown Options:
┌─────────────────────────┐
│ Custom          ← SG ID │
│ Anywhere-IPv4           │  ← Choose this for now
│ Anywhere-IPv6           │
│ My IP                   │
└─────────────────────────┘
```

> ⚠️ In **production**, always use **specific Security Group** as source, never `0.0.0.0/0`

### 1A - Create EFS Security Group

```
Go to: EC2 → Security Groups → Create Security Group
```

```
┌──────────────────────────────────────────────┐
│         Security Group for EFS               │
├──────────────────────────────────────────────┤
│ Name: EFS-SG                                 │
│ Description: Security group for EFS          │
│ VPC: Default VPC                             │
│                                              │
│ Inbound Rules:                               │
│ ┌──────┬───────────┬──────────┬───────────┐  │
│ │ Type │ Protocol  │  Port    │  Source   │  │
│ ├──────┼───────────┼──────────┼───────────┤  │
│ │ NFS  │   TCP     │  2049    │  EC2-SG   │  │
│ └──────┴───────────┴──────────┴───────────┘  │
│ (We'll add EC2-SG after creating it)         │
└──────────────────────────────────────────────┘
```

### 1B - Create EC2 Security Group

```
┌──────────────────────────────────────────────┐
│         Security Group for EC2               │
├──────────────────────────────────────────────┤
│ Name: EC2-SG                                 │
│ Description: Security group for EC2          │
│ VPC: Default VPC                             │
│                                              │
│ Inbound Rules:                               │
│ ┌───────┬──────────┬───────┬──────────────┐  │
│ │ Type  │ Protocol │ Port  │   Source     │  │
│ ├───────┼──────────┼───────┼──────────────┤  │
│ │  SSH  │  TCP     │  22   │  My IP       │  │
│ └───────┴──────────┴───────┴──────────────┘  │
└──────────────────────────────────────────────┘
```

### 1C - Update EFS-SG to allow EC2-SG

```
Go to: EFS-SG → Edit Inbound Rules
Change Source from "EC2-SG name" to actual EC2-SG ID

┌─────────────────────────────────────────────────┐
│ EFS-SG Inbound Rule:                            │
│ Type: NFS | Port: 2049 | Source: [EC2-SG ID]   │
└─────────────────────────────────────────────────┘
```

---

## STEP 2: Create EFS File System (Console)

```
Go to: AWS Console → Search "EFS" → Create File System
```

### Option A: Quick Create (Simple)
```
┌──────────────────────────────────────────┐
│         Create File System               │
├──────────────────────────────────────────┤
│ Name: my-shared-efs                      │
│ VPC: Default VPC                         │
│                                          │
│ Click: "Customize" for more options      │
└──────────────────────────────────────────┘
```

### Option B: Customize (Recommended for learning)

```
Step 1 - File System Settings:
┌──────────────────────────────────────────────┐
│ Name: my-shared-efs                          │
│ Storage Class: Standard                      │
│ Automatic Backups: Enable                    │
│ Lifecycle Management: 30 days → IA          │
│ Performance Mode: General Purpose            │
│ Throughput Mode: Elastic                     │
│ Encryption: Enable                           │
└──────────────────────────────────────────────┘

Step 2 - Network Access:
┌──────────────────────────────────────────────┐
│ VPC: Default VPC                             │
│                                              │
│ Mount Targets:                               │
│ ┌──────────┬────────────┬─────────────────┐  │
│ │    AZ    │   Subnet   │  Security Group │  │
│ ├──────────┼────────────┼─────────────────┤  │
│ │ us-east-1a│ subnet-xxx│    EFS-SG       │  │
│ ├──────────┼────────────┼─────────────────┤  │
│ │ us-east-1b│ subnet-xxx│    EFS-SG       │  │
│ └──────────┴────────────┴─────────────────┘  │
│ ⚠️ Remove default SG, Add EFS-SG             │
└──────────────────────────────────────────────┘

Step 3 - File System Policy: Skip (Next)

Step 4 - Review and Create ✅
```

---

## STEP 3: Launch TWO EC2 Instances (Console)

### Launch EC2 #1

```
Go to: EC2 → Launch Instance

┌──────────────────────────────────────────────┐
│           EC2 Instance #1                    │
├──────────────────────────────────────────────┤
│ Name: EFS-Demo-EC2-1                         │
│ AMI: Amazon Linux 2023                       │
│ Instance Type: t2.micro (Free tier)          │
│ Key Pair: Create new → "efs-demo-key"        │
│                                              │
│ Network Settings:                            │
│ ├── VPC: Default VPC                         │
│ ├── Subnet: us-east-1a                       │
│ ├── Auto-assign Public IP: Enable            │
│ └── Security Group: EC2-SG                   │
└──────────────────────────────────────────────┘
```

### Launch EC2 #2

```
┌──────────────────────────────────────────────┐
│           EC2 Instance #2                    │
├──────────────────────────────────────────────┤
│ Name: EFS-Demo-EC2-2                         │
│ AMI: Amazon Linux 2023                       │
│ Instance Type: t2.micro                      │
│ Key Pair: Same "efs-demo-key"                │
│                                              │
│ Network Settings:                            │
│ ├── VPC: Default VPC                         │
│ ├── Subnet: us-east-1b  ← Different AZ!     │
│ ├── Auto-assign Public IP: Enable            │
│ └── Security Group: EC2-SG                   │
└──────────────────────────────────────────────┘
```

---

## STEP 4: Mount EFS on EC2 Instances (EC2 Instance Connect)

### Get EFS DNS Name First (Console)

```
Go to: EFS → your file system → Copy DNS name

Format: fs-xxxxxxxxx.efs.us-east-1.amazonaws.com
```

### Connect to EC2 #1

```
Go to: EC2 → Select EFS-Demo-EC2-1 → Connect → 
       EC2 Instance Connect → Connect
```

#### Commands on EC2 #1:

```bash
# ── Step 1: Update system ──────────────────────────
sudo yum update -y

# ── Step 2: Install EFS utilities ─────────────────
sudo yum install -y amazon-efs-utils

# ── Step 3: Create mount directory ────────────────
sudo mkdir /mnt/efs

# ── Step 4: Mount EFS ─────────────────────────────
# Replace with YOUR EFS DNS name
sudo mount -t efs -o tls fs-xxxxxxxxx:/ /mnt/efs

# ── Step 5: Verify mount ───────────────────────────
df -h | grep efs

# You should see something like:
# 127.0.0.1:/  8.0E  0 8.0E   0% /mnt/efs
#              ↑ 
#         Elastic = virtually unlimited!

# ── Step 6: Create a test file ────────────────────
sudo bash -c 'echo "Hello from EC2 #1! 🚀" > /mnt/efs/test.txt'

# ── Step 7: Verify file created ───────────────────
cat /mnt/efs/test.txt
# Output: Hello from EC2 #1! 🚀

# ── Step 8: Create more files ─────────────────────
sudo bash -c 'echo "Timestamp: $(date)" >> /mnt/efs/test.txt'
sudo touch /mnt/efs/shared-file-{1,2,3}.txt
ls -la /mnt/efs/
```

### Connect to EC2 #2

```
Go to: EC2 → Select EFS-Demo-EC2-2 → Connect → 
       EC2 Instance Connect → Connect
```

#### Commands on EC2 #2:

```bash
# ── Step 1: Install EFS utilities ─────────────────
sudo yum update -y
sudo yum install -y amazon-efs-utils

# ── Step 2: Create mount directory ────────────────
sudo mkdir /mnt/efs

# ── Step 3: Mount SAME EFS ────────────────────────
# Same DNS name as EC2 #1!
sudo mount -t efs -o tls fs-xxxxxxxxx:/ /mnt/efs

# ── Step 4: Check files from EC2 #1 ───────────────
ls -la /mnt/efs/
# 🎉 You can see files created by EC2 #1!

cat /mnt/efs/test.txt
# Output: Hello from EC2 #1! 🚀

# ── Step 5: Write from EC2 #2 ─────────────────────
sudo bash -c 'echo "Hello from EC2 #2! 🎯" >> /mnt/efs/test.txt'

# Now go back to EC2 #1 and check!
cat /mnt/efs/test.txt
# Both messages visible! ✅
```

---

## STEP 5: Make EFS Mount Permanent (EC2 #1 and #2)

```bash
# Run on BOTH EC2 instances
# Without this, mount is lost after reboot!

# ── Add to /etc/fstab ─────────────────────────────
echo "fs-xxxxxxxxx:/ /mnt/efs efs defaults,_netdev,tls 0 0" | sudo tee -a /etc/fstab

# ── Verify fstab entry ────────────────────────────
cat /etc/fstab

# ── Test fstab (unmount and remount) ──────────────
sudo umount /mnt/efs
sudo mount -a

# ── Verify still works ────────────────────────────
ls /mnt/efs
cat /mnt/efs/test.txt
```

---

## STEP 6: Test Real-time Sharing

### Open TWO terminal windows simultaneously

```
Terminal 1 (EC2 #1):
┌─────────────────────────────────────────┐
│ # Watch for file changes                │
│ watch -n 1 'ls -la /mnt/efs && echo    │
│ "---" && cat /mnt/efs/test.txt'        │
└─────────────────────────────────────────┘

Terminal 2 (EC2 #2):
┌─────────────────────────────────────────┐
│ # Write files every 2 seconds           │
│ for i in {1..5}; do                    │
│   sudo bash -c "echo 'Write #$i from   │
│   EC2-2 at $(date)' >>                 │
│   /mnt/efs/test.txt"                   │
│   sleep 2                              │
│ done                                   │
└─────────────────────────────────────────┘
```

**Result: EC2 #1 terminal shows updates in real-time! 🎉**

---

## STEP 7: Check EFS Metrics (Console)

```
Go to: EFS → your file system

┌──────────────────────────────────────────────┐
│           EFS Dashboard Shows:               │
├──────────────────────────────────────────────┤
│ 📊 Metered Size: how much data stored        │
│ 📈 CloudWatch Metrics:                       │
│    - DataReadIOBytes                         │
│    - DataWriteIOBytes                        │
│    - ClientConnections (should show 2!)      │
│    - BurstCreditBalance                      │
└──────────────────────────────────────────────┘
```

---

## STEP 8: EFS Access Points (Advanced - Console)

```
Go to: EFS → your file system → Access Points → Create

┌──────────────────────────────────────────────┐
│           What are Access Points?            │
├──────────────────────────────────────────────┤
│ Like a "door" to specific folder in EFS      │
│ Can enforce user/group permissions           │
│ Good for multi-tenant applications           │
└──────────────────────────────────────────────┘

Settings:
┌──────────────────────────────────────────────┐
│ Name: app1-access-point                      │
│ Root Directory: /app1/data                   │
│                                              │
│ POSIX User:                                  │
│ ├── User ID: 1000                            │
│ ├── Group ID: 1000                           │
│                                              │
│ Root Directory Creation Permissions:         │
│ ├── Owner User ID: 1000                      │
│ ├── Owner Group ID: 1000                     │
│ └── Permissions: 755                         │
└──────────────────────────────────────────────┘
```

---

## STEP 9: Cleanup (Important - Avoid Charges!)

### Console Cleanup Steps:

```
1. UNMOUNT EFS on both EC2s:
   sudo umount /mnt/efs
   (Also remove from /etc/fstab)

2. Delete EC2 Instances:
   EC2 → Instances → Select both → 
   Instance State → Terminate

3. Delete EFS:
   EFS → your file system → Delete
   ⚠️ Type file system ID to confirm

4. Delete Security Groups:
   EC2 → Security Groups → 
   Delete EFS-SG and EC2-SG

5. Delete Key Pair (optional):
   EC2 → Key Pairs → Delete
```

---

## Summary of What We Learned

```
┌─────────────────────────────────────────────────┐
│              EFS Lab Summary                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✅ Created EFS file system                     │
│  ✅ Set up proper Security Groups (NFS:2049)   │
│  ✅ Mounted EFS on 2 EC2s in different AZs     │
│  ✅ Proved file sharing works in real-time     │
│  ✅ Made mount permanent via /etc/fstab        │
│  ✅ Explored Access Points                     │
│  ✅ Monitored via CloudWatch metrics           │
│                                                 │
├─────────────────────────────────────────────────┤
│           Key Things to Remember               │
├─────────────────────────────────────────────────┤
│  🔑 NFS port 2049 must be open                 │
│  🔑 Use amazon-efs-utils for easy mounting     │
│  🔑 EFS = Linux only (NFS protocol)           │
│  🔑 Scales automatically to petabytes         │
│  🔑 Pay per GB stored (no provisioning)       │
│  🔑 Multi-AZ = High Availability              │
└─────────────────────────────────────────────────┘
```

---

## Real-World Use Cases

```
┌─────────────────────────────────────────────────┐
│  When to use EFS in real projects:             │
├─────────────────────────────────────────────────┤
│                                                 │
│  🌐 Web Applications                           │
│     Multiple web servers share same files      │
│     (WordPress, Drupal, etc.)                  │
│                                                 │
│  🔄 CI/CD Pipelines                            │
│     Share build artifacts between stages       │
│                                                 │
│  📊 Data Science / ML                          │
│     Multiple notebooks access same dataset     │
│                                                 │
│  🐳 Container Workloads (ECS/EKS)             │
│     Persistent shared storage for containers   │
│                                                 │
│  🏠 Home Directories                           │
│     Shared home dirs for many users           │
│                                                 │
│  📝 Content Management                         │
│     Shared media files across servers         │
└─────────────────────────────────────────────────┘
```

---

**Next Topics to Learn:** 
- `EFS with ECS/EKS` 
- `EFS with AWS Backup`
- `AWS FSx` (Windows file system equivalent)