# 48. Private vs Public vs Elastic IP Hands On

# AWS EC2: Private vs Public vs Elastic IP

## 📚 Theory First

---

### 🔵 Private IP
| Feature | Details |
|---------|---------|
| **Definition** | IP assigned within your VPC (internal network) |
| **Range** | 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 |
| **Accessible** | Only within AWS network / VPC |
| **Persistent** | ✅ Never changes (even after stop/start) |
| **Cost** | Free |
| **Use Case** | Internal communication between EC2 instances |

---

### 🟢 Public IP
| Feature | Details |
|---------|---------|
| **Definition** | IP assigned from AWS public pool |
| **Accessible** | From the Internet |
| **Persistent** | ❌ Changes every time you stop/start EC2 |
| **Cost** | Free (while instance is running) |
| **Use Case** | Temporary internet access |
| **Note** | Lost when instance is stopped |

---

### 🟡 Elastic IP (EIP)
| Feature | Details |
|---------|---------|
| **Definition** | Static Public IP you own |
| **Accessible** | From the Internet |
| **Persistent** | ✅ Never changes - YOU control it |
| **Cost** | 💰 Charged when NOT associated with running instance |
| **Limit** | 5 per AWS account (can request more) |
| **Use Case** | Production servers needing fixed IP |

---

### 🧠 Key Differences Summary

```
┌─────────────────────────────────────────────────────────┐
│                    IP Comparison                         │
├──────────────┬────────────┬────────────┬────────────────┤
│  Feature     │ Private IP │ Public IP  │  Elastic IP    │
├──────────────┼────────────┼────────────┼────────────────┤
│ Reachable    │ VPC Only   │ Internet   │ Internet       │
│ from         │            │            │                │
├──────────────┼────────────┼────────────┼────────────────┤
│ After Stop   │ ✅ Same    │ ❌ Changes │ ✅ Same        │
│ /Start       │            │            │                │
├──────────────┼────────────┼────────────┼────────────────┤
│ Cost         │ Free       │ Free       │ Charged if     │
│              │            │            │ unattached     │
├──────────────┼────────────┼────────────┼────────────────┤
│ You Own It   │ No         │ No         │ ✅ Yes         │
└──────────────┴────────────┴────────────┴────────────────┘
```

---

### ⚠️ Important SAA Exam Points
```
✅ EC2 doesn't know its Public IP (it sees only Private IP)
✅ Public IP is mapped to Private IP by Internet Gateway (NAT)
✅ Elastic IP is a regional resource
✅ You can move Elastic IP from one instance to another
✅ AWS Best Practice: Avoid Elastic IP, use DNS instead
✅ Elastic IP charged = $0.005/hr when not associated
```

---

## 🛠️ HANDS-ON LAB

### Prerequisites
- AWS Account
- Basic EC2 knowledge

---

### 🔬 Lab 1: Observe Private & Public IP

#### Step 1: Launch EC2 Instance
```
1. Go to EC2 Console
2. Click "Launch Instance"
3. Name: "IP-Demo-Instance"
4. AMI: Amazon Linux 2023 (Free Tier)
5. Instance Type: t2.micro
6. Key Pair: Create or use existing
7. Network Settings:
   ✅ Allow SSH (port 22)
   ✅ Auto-assign Public IP: ENABLE
8. Click "Launch Instance"
```

#### Step 2: Note Down IPs
```
Go to EC2 → Instances → Select your instance

Note these values:
📝 Private IP address: 172.31.x.x  (yours will differ)
📝 Public IP address:  54.x.x.x    (yours will differ)
📝 Private DNS: ip-172-31-x-x.ec2.internal
📝 Public DNS:  ec2-54-x-x-x.compute-1.amazonaws.com
```

#### Step 3: Get All Running Instances with IPs
```bash
aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query "Reservations[*].Instances[*].{
        InstanceID:InstanceId,
        InstanceName:Tags[?Key=='Name']|[0].Value,
        PrivateIP:PrivateIpAddress,
        PublicIP:PublicIpAddress,
        State:State.Name}" \
    --output table
```

**Expected Output:**
```
# hostname -I
172.31.14.x          ← Only Private IP shown!

# Public IP only visible via metadata service
54.x.x.x
```

---

### 🔬 Lab 2: See Public IP Change After Stop/Start

#### Step 1: Note Current Public IP
```
Instance Public IP: 54.x.x.x  (note this down!)
```

#### Step 2: Stop the Instance
```
EC2 Console → Select Instance → 
Instance State → Stop Instance → Confirm
Wait until State = "Stopped"
```

#### Step 3: Start the Instance
```
Instance State → Start Instance
Wait until State = "Running"
```

#### Step 4: Compare IPs
```
Check Public IP again...

Old Public IP: 54.x.x.x   ❌ GONE!
New Public IP: 18.x.x.x   ← Different!
Private IP:    172.31.x.x  ✅ Same (unchanged)
```

> **💡 This proves:** Public IP is temporary & Private IP is permanent!

---

### 🔬 Lab 3: Allocate & Attach Elastic IP

#### Step 1: Allocate Elastic IP
```
EC2 Console → 
Left Menu → Network & Security → Elastic IPs
→ Click "Allocate Elastic IP address"
→ Network Border Group: (keep default)
→ Amazon's pool of IPv4 addresses: selected
→ Click "Allocate"

📝 Note your Elastic IP: 3.x.x.x
```

#### Step 2: Associate Elastic IP to Instance
```
Select the Elastic IP you just created
→ Actions → Associate Elastic IP address
→ Resource type: Instance
→ Instance: Select "IP-Demo-Instance"
→ Private IP: (auto-selected)
→ Click "Associate"
```

#### Step 3: Verify
```
Go back to EC2 Instances
Select your instance

Check:
✅ Public IPv4: 3.x.x.x (your Elastic IP)
✅ Elastic IP: 3.x.x.x (shown separately)
```

#### Step 4: Test Persistence - Stop/Start
```
Stop Instance → Start Instance

After restart check Public IP...
✅ Still 3.x.x.x  ← Elastic IP persists!
```

---

### 🔬 Lab 4: Move Elastic IP Between Instances

#### Step 1: Launch Second Instance
```
Launch another EC2 instance:
Name: "IP-Demo-Instance-2"
Same settings as before
Note its current Public IP
```

#### Step 2: Move Elastic IP
```
EC2 → Elastic IPs
Select your Elastic IP (3.x.x.x)
→ Actions → Associate Elastic IP address
→ Select "IP-Demo-Instance-2"
→ ✅ Check "Allow this Elastic IP to be reassociated"
→ Associate
```

#### Step 3: Verify Move
```
Instance 1: Public IP = new random IP (or none)
Instance 2: Public IP = 3.x.x.x  ✅ Elastic IP moved!
```

> **💡 Real World Use Case:** Failover! Move IP from failed server to backup server instantly!

---

### 🔬 Lab 5: Elastic IP Cost Awareness

#### Scenario: Unused Elastic IP = Money Drain!
```
Disassociate Elastic IP from instance:
→ Elastic IPs → Select IP
→ Actions → Disassociate

Now the Elastic IP is not attached to anything
→ AWS charges $0.005/hour = ~$3.6/month
→ This is AWS discouraging IP hoarding!
```

---

### 🧹 Cleanup (IMPORTANT - Avoid Charges!)

```
Step 1: Release Elastic IP
EC2 → Elastic IPs → Select IP
→ Actions → Release Elastic IP address → Release

Step 2: Terminate Instances
EC2 → Instances → Select both instances
→ Instance State → Terminate
```

---

## 🎯 Architecture Diagram

```
Internet
   │
   │ Public IP / Elastic IP
   ▼
┌──────────────────┐
│  Internet Gateway │
└──────────┬───────┘
           │ NAT Translation
           │ Public→Private
           ▼
┌──────────────────────────────┐
│          VPC                  │
│  ┌────────────────────────┐  │
│  │    Public Subnet        │  │
│  │  ┌──────────────────┐  │  │
│  │  │   EC2 Instance   │  │  │
│  │  │                  │  │  │
│  │  │ Private: 10.0.1.5│  │  │
│  │  │ Public: 54.x.x.x │  │  │
│  │  │ (or Elastic IP)  │  │  │
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

⚠️ EC2 only SEES its Private IP!
   Internet Gateway does the translation!
```

---

## ✅ Lab Summary Checklist

```
☐ Launched EC2 and noted Private & Public IP
☐ SSH'd into instance - saw only Private IP
☐ Stopped/Started - confirmed Public IP changed
☐ Stopped/Started - confirmed Private IP same
☐ Allocated Elastic IP
☐ Associated Elastic IP to instance
☐ Stopped/Started - confirmed Elastic IP persisted
☐ Moved Elastic IP to another instance
☐ Released Elastic IP (cleanup)
☐ Terminated instances (cleanup)
```

---
