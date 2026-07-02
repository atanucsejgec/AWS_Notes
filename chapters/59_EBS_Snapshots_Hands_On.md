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


