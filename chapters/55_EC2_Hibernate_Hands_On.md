# 55. EC2 Hibernate - Hands On

# AWS EC2 Hibernate - Complete Guide + Hands-On

## 📚 What is EC2 Hibernate?

**Hibernate** saves the **RAM contents** to the **EBS root volume**, so when you start the instance again, it resumes exactly where it left off — **faster than a normal start**.

---

## 🔄 Normal Stop vs Hibernate vs Terminate

| Action | RAM | EBS Root Volume | Boot Time |
|--------|-----|-----------------|-----------|
| **Stop** | Cleared | Persisted | Fresh boot (slow) |
| **Hibernate** | Saved to EBS | Persisted | Fast resume |
| **Terminate** | Cleared | Deleted (default) | N/A |

---

## 🏗️ How Hibernate Works

```
Instance Running
     │
     ▼
User triggers Hibernate
     │
     ▼
RAM contents dumped → EBS Root Volume (encrypted)
     │
     ▼
Instance STOPS (billing pauses for compute)
     │
     ▼
User starts instance again
     │
     ▼
RAM restored from EBS → Instance resumes instantly
```

---

## ✅ Requirements for Hibernate

| Requirement | Details |
|-------------|---------|
| **OS Support** | Amazon Linux 2, Ubuntu, Windows |
| **RAM Size** | Must be **less than 150 GB** |
| **Root Volume** | Must be **EBS** (not instance store) |
| **Root Volume Size** | Must be large enough to store RAM |
| **Encryption** | EBS root volume **MUST be encrypted** |
| **Instance Types** | Most types EXCEPT bare metal |
| **Max Hibernate Duration** | **60 days** |

---

## 🛠️ HANDS-ON PRACTICE

### Step 1: Launch EC2 Instance with Hibernate Support

```
AWS Console → EC2 → Launch Instance
```

**Configuration:**
```
Name: hibernate-test
AMI: Amazon Linux 2 (HVM)
Instance Type: t2.micro (or t3.micro)
```

---

### Step 2: Configure Storage (MUST be Encrypted)

```
Storage Settings:
├── Volume Type: gp2 or gp3
├── Size: 20 GB (must be > RAM size)
├── ✅ Encrypted: YES  ← MANDATORY
└── KMS Key: aws/ebs (default)
```

> ⚠️ **If not encrypted → Hibernate option won't appear!**

---

### Step 3: Enable Hibernate in Advanced Details

```
Advanced Details → Stop - Hibernate behavior
└── Select: ✅ Enable
```

---

### Step 4: Launch the Instance

```
→ Add Key Pair (or create new)
→ Security Group: Allow SSH (port 22)
→ Launch Instance
```

---

### Step 5: Connect and Check Uptime

```bash
# Connect via SSH
ssh -i your-key.pem ec2-user@<public-ip>

# Check uptime (note the time)
uptime

# Output example:
# 10:30:22 up 2 min, 1 user, load average: 0.00
```

---

### Step 6: Hibernate the Instance

```
AWS Console:
→ Select your instance
→ Instance State → Hibernate
→ Confirm
```

**Watch the states:**
```
Running → Stopping → Stopped
(This takes 30-60 seconds)
```

---

### Step 7: Start the Instance Again

```
→ Select instance
→ Instance State → Start
→ Wait for Running state
```

---

### Step 8: Verify Hibernate Worked (Check Uptime)

```bash
# Connect again via SSH
ssh -i your-key.pem ec2-user@<public-ip>

# Check uptime again
uptime

# Output example:
# 10:45:00 up 17 min, 1 user, load average: 0.00
#           ^^^^^^^^
#    Uptime CONTINUED from before hibernate!
#    (Not reset to 0 like normal stop/start)
```

> ✅ **If uptime continued → Hibernate worked successfully!**

---

## 🔍 What to Verify After Hibernate

```bash
# 1. Check uptime (should continue from before)
uptime

# 2. Check running processes (still running)
ps aux

# 3. Check system logs
sudo dmesg | tail -20

# 4. You'll see hibernate/resume messages in logs
sudo cat /var/log/messages | grep -i hibernate
```

---

## 💡 Real-World Use Cases

```
1. Long-running processes
   └── ML training jobs, batch processing

2. Development environments
   └── Resume IDE, running servers instantly

3. Cost saving
   └── Hibernate overnight, resume next morning
      (No compute cost during hibernation)

4. Quick environment snapshots
   └── Save exact state before risky changes
```

---

## 💰 Billing During Hibernate

```
✅ NO charge for → EC2 compute (instance hours)
✅ NO charge for → Elastic IP (associated with instance)
❌ YES charge for → EBS storage (root volume)
❌ YES charge for → Other EBS volumes attached
```

---

## ❌ Common Mistakes & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Hibernate option grayed out | EBS not encrypted | Enable encryption on root volume |
| Can't hibernate | Instance type not supported | Use supported instance type |
| Hibernate fails | RAM > 150 GB | Use smaller instance |
| Root volume too small | RAM dump won't fit | Increase root volume size |

---

## 📝 Quick Summary

```
EC2 Hibernate = "Laptop Sleep Mode"

Key Points:
├── RAM saved to EBS root volume
├── EBS MUST be encrypted
├── RAM must be < 150 GB
├── Max 60 days hibernation
├── Faster startup than stop/start
├── No compute charges while hibernated
└── Uptime clock continues after resume
```

---

## 🧹 Cleanup (Important!)

```
After practice:
→ Select instance
→ Instance State → Terminate
→ This avoids EBS storage charges
```

---

## 🎯 Practice Checklist

```
□ Launched instance with encrypted EBS
□ Enabled hibernate in advanced settings
□ Noted uptime before hibernate
□ Successfully hibernated instance
□ Restarted and verified uptime continued
□ Checked instance was in "stopped" state during hibernate
□ Terminated instance after practice
```

---

