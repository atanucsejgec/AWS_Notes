# 52. Elastic Network Interfaces (ENI) - Hands On

# AWS Elastic Network Interfaces (ENI) - Complete Guide & Hands-On

## 📚 What is an ENI?

An **Elastic Network Interface (ENI)** is a **virtual network card** that you can attach to an EC2 instance in a VPC.

---

## 🔑 Key Concepts

### ENI Components
```
┌─────────────────────────────────────────┐
│           Elastic Network Interface      │
│                                         │
│  • Primary Private IPv4 Address         │
│  • Secondary Private IPv4 Addresses     │
│  • One Elastic IP per Private IP        │
│  • One Public IPv4 Address              │
│  • One or More IPv6 Addresses           │
│  • Security Groups                      │
│  • MAC Address                          │
│  • Source/Destination Check Flag        │
└─────────────────────────────────────────┘
```

### Types of Network Interfaces
| Type | Description |
|------|-------------|
| **Primary ENI (eth0)** | Created automatically with EC2 |
| **Secondary ENI** | Additional ENI you attach manually |
| **EFA** | Elastic Fabric Adapter (HPC workloads) |
| **ENA** | Elastic Network Adapter (high performance) |

---

## 🏗️ ENI Architecture

```
         VPC (10.0.0.0/16)
              │
    ┌─────────┴──────────┐
    │    Subnet           │
    │  (10.0.1.0/24)     │
    │                     │
    │  ┌───────────────┐  │
    │  │   EC2         │  │
    │  │  Instance     │  │
    │  │               │  │
    │  │ eth0 (Primary)│──┼── Security Group A
    │  │ 10.0.1.10     │  │   Public IP / EIP
    │  │               │  │
    │  │ eth1(Secondary│──┼── Security Group B
    │  │ 10.0.1.20     │  │   Different IP
    │  └───────────────┘  │
    └─────────────────────┘
```

---

## 🎯 Use Cases

```
1. 🔀 Management Network Separation
   - eth0 → Application traffic
   - eth1 → Admin/Management traffic

2. 🔄 High Availability / Failover
   - Move ENI from failed instance to standby

3. 🛡️ Dual-homed Instances
   - Connect to multiple subnets

4. 📜 Licensing (MAC-based)
   - Keep same MAC address across instances

5. 🔧 Network Appliances
   - Firewalls, NAT, Load Balancers
```

---

## 🛠️ HANDS-ON PRACTICE

### Lab 1: Create and Explore ENI

#### Step 1: Launch an EC2 Instance
```bash
# Go to AWS Console
EC2 → Instances → Launch Instance

Name: ENI-Test-Instance
AMI: Amazon Linux 2023
Instance Type: t2.micro
Key Pair: Create or use existing
VPC: Default VPC
Subnet: us-east-1a (note this subnet!)
Security Group: Allow SSH (port 22)
```

#### Step 2: View Default ENI
```bash
# After launch, go to:
EC2 → Instances → Select Instance → Networking Tab

# You will see:
- Network Interface: eni-xxxxxxxxx
- Private IP: 172.31.x.x
- Public IP: assigned automatically
- Subnet ID
- Security Groups
```

---

### Lab 2: Create a Secondary ENI

#### Step 2a: Create New ENI
```bash
# Go to:
EC2 → Network & Security → Network Interfaces → Create Network Interface

Settings:
├── Description: "Secondary-ENI-Lab"
├── Subnet: SAME subnet as your EC2 instance ⚠️
├── Private IP: Leave blank (auto-assign) or enter 172.31.x.x
├── Security Groups: Select same or different SG
└── Click: Create
```

#### Step 2b: Attach ENI to Instance
```bash
# Select your new ENI → Actions → Attach

Select Instance: ENI-Test-Instance
Click: Attach
```

#### Step 2c: Verify inside EC2
```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@<public-ip>

# Check network interfaces
ip addr show
# OR
ifconfig

# You should see:
# eth0 - Primary ENI
# eth1 - Secondary ENI (might need config)

# Check routing
ip route show

# See both interfaces
cat /proc/net/if_inet6
```

---

### Lab 3: Configure Secondary ENI (Amazon Linux)

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<public-ip>

# Check interfaces
ip link show

# Bring up eth1
sudo ip link set eth1 up

# Check if IP was assigned
ip addr show eth1

# If no IP, assign manually (DHCP)
sudo dhclient eth1

# Verify
ip addr show
# eth1 should now have an IP

# Test connectivity from eth1
ping -I eth1 8.8.8.8
```

---

### Lab 4: Detach and Move ENI (Failover Demo)

```bash
# This simulates High Availability!

Step 1: Launch Second EC2 Instance
├── Name: ENI-Standby-Instance  
├── Same Subnet as first instance
└── Same settings

Step 2: Note the Secondary ENI from Lab 2

Step 3: Detach ENI from Instance 1
EC2 → Network Interfaces → Select ENI
Actions → Detach
☑️ Force Detach if needed

Step 4: Attach ENI to Instance 2
Select same ENI → Actions → Attach
Select: ENI-Standby-Instance

# The IP address MOVES to new instance!
# This is how failover works!
```

---

### Lab 5: Elastic IP with ENI

```bash
# Step 1: Allocate Elastic IP
EC2 → Elastic IPs → Allocate Elastic IP Address
Click: Allocate

# Step 2: Associate with ENI
Actions → Associate Elastic IP Address
Resource Type: Network Interface
Network Interface: Select your Secondary ENI
Private IP: Select private IP
Click: Associate

# Step 3: Verify
EC2 → Network Interfaces → Select ENI
Check: Elastic IP shown in details

# Step 4: Test
# Now this EIP follows wherever the ENI goes!
```

---

### Lab 6: CLI Commands for ENI

```bash
# Install AWS CLI and configure
aws configure

# List all ENIs
aws ec2 describe-network-interfaces

# List ENIs in specific VPC
aws ec2 describe-network-interfaces \
  --filters "Name=vpc-id,Values=vpc-xxxxxxxx"

# Create ENI via CLI
aws ec2 create-network-interface \
  --subnet-id subnet-xxxxxxxx \
  --description "My-CLI-ENI" \
  --groups sg-xxxxxxxx

# Attach ENI to instance
aws ec2 attach-network-interface \
  --network-interface-id eni-xxxxxxxx \
  --instance-id i-xxxxxxxx \
  --device-index 1

# Detach ENI
aws ec2 detach-network-interface \
  --attachment-id eni-attach-xxxxxxxx

# Delete ENI (must be detached first)
aws ec2 delete-network-interface \
  --network-interface-id eni-xxxxxxxx

# Describe specific ENI
aws ec2 describe-network-interfaces \
  --network-interface-ids eni-xxxxxxxx
```

---

### Lab 7: Source/Destination Check

```bash
# By default, AWS checks if traffic source/destination
# matches the instance. For NAT/VPN, disable this!

# Disable via Console:
EC2 → Network Interfaces → Select ENI
Actions → Change Source/Dest Check
Uncheck: Enable
Save

# Disable via CLI:
aws ec2 modify-network-interface-attribute \
  --network-interface-id eni-xxxxxxxx \
  --no-source-dest-check

# Enable via CLI:
aws ec2 modify-network-interface-attribute \
  --network-interface-id eni-xxxxxxxx \
  --source-dest-check
```

---

## 📊 ENI Limits Per Instance Type

```
Instance Type    │  Max ENIs  │  Max IPs per ENI
─────────────────┼────────────┼─────────────────
t2.micro         │     2      │       2
t2.small         │     3      │       4
t2.medium        │     3      │       6
t3.medium        │     3      │       6
m5.large         │     3      │      10
m5.xlarge        │     4      │      15
c5.xlarge        │     4      │      15
r5.large         │     3      │      10
```

---

## 🔒 Security Group with ENI

```bash
# Each ENI can have different Security Groups!

ENI eth0 (Primary):
└── Security Group: Allow HTTP (80), HTTPS (443)

ENI eth1 (Secondary):  
└── Security Group: Allow SSH (22) from Admin IP only

# This provides network traffic separation!

# Add Security Group to ENI:
EC2 → Network Interfaces → Select ENI
Actions → Change Security Groups
Add/Remove Security Groups
```

---

## 🧹 Cleanup Commands

```bash
# IMPORTANT: Clean up to avoid charges!

# 1. Terminate EC2 Instances
EC2 → Instances → Select → Terminate

# 2. Release Elastic IPs (if not associated)
EC2 → Elastic IPs → Release

# 3. Delete Custom ENIs
EC2 → Network Interfaces → Delete (if not auto-deleted)

# Via CLI:
aws ec2 terminate-instances --instance-ids i-xxxxxxxx
aws ec2 release-address --allocation-id eipalloc-xxxxxxxx
aws ec2 delete-network-interface --network-interface-id eni-xxxxxxxx
```

---

## 📝 Quick Summary

```
┌────────────────────────────────────────────┐
│              ENI Key Points                 │
├────────────────────────────────────────────┤
│ ✅ Virtual network card in VPC             │
│ ✅ Bound to specific Availability Zone     │
│ ✅ Can have multiple private IPs           │
│ ✅ Can attach/detach from instances        │
│ ✅ Retains attributes when moved           │
│ ✅ Each has own Security Groups            │
│ ✅ Useful for HA & failover               │
│ ✅ Used for network appliances            │
│ ❌ Cannot move across AZs                 │
│ ❌ Cannot move across VPCs                │
└────────────────────────────────────────────┘
```

---

## 🎓 Practice Checklist

- [ ] Create EC2 and view primary ENI
- [ ] Create secondary ENI manually
- [ ] Attach secondary ENI to instance
- [ ] SSH and verify eth0 & eth1
- [ ] Assign Elastic IP to ENI
- [ ] Move ENI between instances
- [ ] Disable Source/Destination Check
- [ ] Use CLI to manage ENIs
- [ ] Clean up all resources

---

**💡 Pro Tips:**
- ENI stays in **same AZ** always
- Primary ENI **cannot be detached**
- ENI keeps its **attributes when moved**
- Use **different SGs per ENI** for security isolation

---

