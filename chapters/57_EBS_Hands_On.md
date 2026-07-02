# 57 EBS Hands On

# AWS EBS (Elastic Block Store) - Complete Guide & Hands-On

## 📚 What is EBS?

EBS is a **persistent block storage** service for EC2 instances - like a virtual hard drive that:
- Persists data even after EC2 stops/terminates
- Can be attached/detached from instances
- Lives in a **specific Availability Zone**
- Can be backed up using **Snapshots**

---

## 🏗️ EBS Volume Types

| Type | Use Case | Performance |
|------|----------|-------------|
| **gp2/gp3** | General Purpose SSD | Balanced price/performance |
| **io1/io2** | High Performance SSD | Databases, high IOPS |
| **st1** | Throughput HDD | Big data, logs |
| **sc1** | Cold HDD | Infrequent access |

---

## 🛠️ HANDS-ON PRACTICE

### ✅ Step 1: Launch an EC2 Instance

1. Go to **EC2 Console** → Click **Launch Instance**
2. Name: `EBS-Practice`
3. AMI: **Amazon Linux 2023**
4. Instance Type: `t2.micro` (free tier)
5. Key Pair: Create or select existing
6. **Keep default 8GB gp3 root volume**
7. Click **Launch Instance**

---

### ✅ Step 2: Create a New EBS Volume

1. Go to **EC2 Console** → Left sidebar → **Volumes**
2. Click **Create Volume**
3. Configure:
```
Volume Type: gp3
Size: 10 GB
Availability Zone: ⚠️ SAME as your EC2 instance!
(e.g., us-east-1a)
```
4. Add Tag → Key: `Name`, Value: `My-Practice-Volume`
5. Click **Create Volume**

---

### ✅ Step 3: Attach EBS Volume to EC2

1. Select your new volume → Click **Actions**
2. Click **Attach Volume**
3. Select your EC2 instance
4. Device name: `/dev/sdf` (auto-suggested)
5. Click **Attach Volume**

---

### ✅ Step 4: Connect to EC2 & Use the Volume

Go to **EC2** → Select instance → Click **Connect** → **EC2 Instance Connect**

```bash
# 1. Check available disks
lsblk
```
**You should see something like:**
```
NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk
└─xvda1 202:1    0   8G  0 part /
xvdf    202:80   0  10G  0 disk   ← Your new volume!
```

```bash
# 2. Check if volume has a filesystem
sudo file -s /dev/xvdf
```
**Output: `/dev/xvdf: data` means NO filesystem yet**

```bash
# 3. Create a filesystem (format the volume)
sudo mkfs -t ext4 /dev/xvdf
```

```bash
# 4. Create a mount point directory
sudo mkdir /mnt/mydata
```

```bash
# 5. Mount the volume
sudo mount /dev/xvdf /mnt/mydata
```

```bash
# 6. Verify it's mounted
df -h
```
**You should see `/dev/xvdf` mounted at `/mnt/mydata`**

```bash
# 7. Create test files on the new volume
cd /mnt/mydata
sudo touch file1.txt file2.txt
echo "Hello EBS!" | sudo tee file1.txt
ls -la
cat file1.txt
```

---

### ✅ Step 5: Make Mount Permanent (Auto-mount after reboot)

```bash
# Get the UUID of your volume
sudo blkid /dev/xvdf
```
**Output example:**
```
/dev/xvdf: UUID="abc123-..." TYPE="ext4"
```

```bash
# Edit fstab file
sudo nano /etc/fstab
```

**Add this line at the bottom** (replace UUID with yours):
```
UUID=abc123-...  /mnt/mydata  ext4  defaults,nofail  0  2
```

```bash
# Test fstab is correct (no errors = good!)
sudo mount -a

# Verify
df -h
```

---

### ✅ Step 6: EBS Snapshots (Backup)

**In AWS Console:**
1. Go to **Volumes** → Select your volume
2. Click **Actions** → **Create Snapshot**
3. Description: `My first EBS snapshot`
4. Click **Create Snapshot**

**Check it:**
- Left sidebar → **Snapshots**
- Wait for status: `pending` → `completed`

---

### ✅ Step 7: Restore from Snapshot

1. Go to **Snapshots** → Select your snapshot
2. Click **Actions** → **Create Volume from Snapshot**
3. Choose same AZ as your instance
4. Click **Create Volume**

> ✅ This is how you **restore data** or **copy volume to another AZ**

---

### ✅ Step 8: Increase EBS Volume Size (Elastic Volumes)

```bash
# Current size check
df -h /mnt/mydata
```

**In AWS Console:**
1. Go to **Volumes** → Select volume
2. Click **Actions** → **Modify Volume**
3. Change size from `10 GB` → `15 GB`
4. Click **Modify** → Confirm

**Back in EC2 terminal:**
```bash
# Check disk shows new size
lsblk
# xvdf should show 15G

# Grow the filesystem to use new space
sudo resize2fs /dev/xvdf

# Verify new size
df -h /mnt/mydata
```
🎉 **No downtime needed! Volume expanded live!**

---

### ✅ Step 9: Detach and Delete Volume

**In terminal first:**
```bash
# Unmount before detaching
cd ~
sudo umount /mnt/mydata

# Verify unmounted
df -h
```

**In AWS Console:**
1. Go to **Volumes** → Select volume
2. Click **Actions** → **Detach Volume**
3. Wait for state: `available`
4. Click **Actions** → **Delete Volume**

---

## 🧠 Key EBS Concepts Summary

```
📌 EBS Facts to Remember:
━━━━━━━━━━━━━━━━━━━━━━━━
✅ EBS = Network drive (not physically attached)
✅ Locked to ONE Availability Zone
✅ Can attach/detach from instances
✅ Data persists when instance stops
✅ Root volume: deleted on termination (by default)
✅ Snapshots = backups stored in S3
✅ Snapshots can copy data across AZ/Regions
✅ Can increase size without downtime
```

---

## 🔥 Quick Cheat Sheet - Linux Commands

```bash
lsblk                          # List all block devices
df -h                          # Show disk usage
sudo file -s /dev/xvdf         # Check filesystem
sudo mkfs -t ext4 /dev/xvdf    # Format volume
sudo mount /dev/xvdf /mnt/dir  # Mount volume
sudo umount /mnt/dir           # Unmount volume
sudo blkid                     # Show UUIDs
sudo resize2fs /dev/xvdf       # Resize filesystem
```

---

## ⚠️ Important Things to Avoid

| ❌ Don't | ✅ Do Instead |
|---------|--------------|
| Detach without unmounting | Always `umount` first |
| Use different AZ for attachment | Same AZ required |
| Delete volume with data | Snapshot first! |
| Forget fstab after reboot | Add UUID to `/etc/fstab` |

---

## 🎯 Practice Challenges

Try these on your own:
1. 🔸 Create 2 volumes and attach both to same instance
2. 🔸 Copy a snapshot to a different region
3. 🔸 Create an AMI from your instance
4. 🔸 Try **io2** volume type and compare
5. 🔸 Enable **EBS Encryption** on a new volume

---
