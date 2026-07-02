# 50. EC2 Placement Groups - Hands On

# AWS EC2 Placement Groups - Complete Guide & Hands-On

## 📚 What are Placement Groups?

Placement Groups control **how EC2 instances are placed** on underlying hardware to meet specific workload needs.

---

## 🏗️ Types of Placement Groups

### 1️⃣ Cluster Placement Group
```
┌─────────────────────────────────┐
│         Single AZ               │
│   ┌──────────────────────┐      │
│   │   Same Rack/Host     │      │
│   │  [EC2] [EC2] [EC2]  │      │
│   │  [EC2] [EC2] [EC2]  │      │
│   └──────────────────────┘      │
└─────────────────────────────────┘
```
- ✅ **Ultra-low latency** (10 Gbps network)
- ✅ High throughput
- ❌ If rack fails → ALL instances fail
- 🎯 **Use Case:** HPC, Big Data, Machine Learning

---

### 2️⃣ Spread Placement Group
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   AZ-1   │  │   AZ-2   │  │   AZ-3   │
│ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │
│ │Rack 1│ │  │ │Rack 2│ │  │ │Rack 3│ │
│ │[EC2] │ │  │ │[EC2] │ │  │ │[EC2] │ │
│ └──────┘ │  │ └──────┘ │  │ └──────┘ │
└──────────┘  └──────────┘  └──────────┘
```
- ✅ Each instance on **different hardware**
- ✅ Reduces simultaneous failures
- ❌ **Max 7 instances per AZ** per group
- 🎯 **Use Case:** Critical apps, HA databases

---

### 3️⃣ Partition Placement Group
```
┌─────────────────────────────────────────┐
│                  AZ-1                   │
│  ┌───────────┐  ┌───────────┐           │
│  │Partition 1│  │Partition 2│           │
│  │ [EC2][EC2]│  │ [EC2][EC2]│           │
│  │ [EC2][EC2]│  │ [EC2][EC2]│           │
│  │ (Rack A)  │  │ (Rack B)  │           │
│  └───────────┘  └───────────┘           │
└─────────────────────────────────────────┘
```
- ✅ Up to **7 partitions per AZ**
- ✅ Hundreds of instances
- ✅ Partitions don't share racks
- 🎯 **Use Case:** Hadoop, Kafka, Cassandra

---

## 📊 Quick Comparison Table

| Feature | Cluster | Spread | Partition |
|---------|---------|--------|-----------|
| Network Speed | 10 Gbps | Normal | Normal |
| Fault Tolerance | Low | High | Medium |
| Max Instances | No limit | 7/AZ | 100s |
| Multi-AZ | ❌ No | ✅ Yes | ✅ Yes |
| Use Case | HPC/ML | Critical Apps | Big Data |

---

## 🛠️ HANDS-ON PRACTICE

### Prerequisites
```
- AWS Account
- AWS CLI installed
- Basic EC2 knowledge
```

---

### Lab 1: Create Placement Groups (Console)

**Step 1: Go to EC2 Console**
```
AWS Console → EC2 → Network & Security → Placement Groups
```

**Step 2: Create Cluster Placement Group**
```
Click "Create placement group"
├── Name: my-cluster-pg
├── Strategy: Cluster
└── Click "Create group"
```

**Step 3: Create Spread Placement Group**
```
Click "Create placement group"
├── Name: my-spread-pg
├── Strategy: Spread
├── Spread Level: Rack (default)
└── Click "Create group"
```

**Step 4: Create Partition Placement Group**
```
Click "Create placement group"
├── Name: my-partition-pg
├── Strategy: Partition
├── Number of partitions: 3
└── Click "Create group"
```

---

### Lab 2: Create Placement Groups (AWS CLI)

```bash
# Create Cluster Placement Group
aws ec2 create-placement-group \
    --group-name my-cluster-pg \
    --strategy cluster \
    --region us-east-1

# Create Spread Placement Group
aws ec2 create-placement-group \
    --group-name my-spread-pg \
    --strategy spread \
    --region us-east-1

# Create Partition Placement Group
aws ec2 create-placement-group \
    --group-name my-partition-pg \
    --strategy partition \
    --partition-count 3 \
    --region us-east-1

# List all placement groups
aws ec2 describe-placement-groups
```

---

### Lab 3: Launch EC2 in Placement Group (CLI)

```bash
# Step 1: Get your AMI ID (Amazon Linux 2)
aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" \
    --query 'Images[0].ImageId' \
    --output text

# Step 2: Launch instance in CLUSTER placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type c5.large \
    --count 2 \
    --placement "GroupName=my-cluster-pg" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Cluster-Instance}]'

# Step 3: Launch instance in SPREAD placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t3.micro \
    --count 3 \
    --placement "GroupName=my-spread-pg" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Spread-Instance}]'

# Step 4: Launch instance in PARTITION placement group
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t3.micro \
    --count 2 \
    --placement "GroupName=my-partition-pg,PartitionNumber=1" \
    --key-name your-key-pair \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Partition-Instance}]'
```

---

### Lab 4: Launch EC2 in Placement Group (Console)

```
Step 1: EC2 → Launch Instance
Step 2: Choose AMI → t3.micro
Step 3: Configure Instance Details
    └── Placement Group: ✅ Check box
        ├── Add to placement group: "my-spread-pg"
        └── OR create new group here
Step 4: Complete launch as normal
```

---

### Lab 5: Verify Placement Group Assignment

```bash
# Check which placement group instance is in
aws ec2 describe-instances \
    --query 'Reservations[*].Instances[*].{
        ID:InstanceId,
        State:State.Name,
        PlacementGroup:Placement.GroupName,
        Partition:Placement.PartitionNumber,
        AZ:Placement.AvailabilityZone
    }' \
    --output table

# Describe specific placement group
aws ec2 describe-placement-groups \
    --group-names my-cluster-pg \
    --output table
```

---

### Lab 6: Move Instance to Placement Group

```bash
# Step 1: Stop the instance first
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Step 2: Modify placement
aws ec2 modify-instance-placement \
    --instance-id i-1234567890abcdef0 \
    --group-name my-cluster-pg

# Step 3: Start instance again
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

---

### Lab 7: Terraform Practice (Bonus)

```hcl
# main.tf

# Create Placement Groups
resource "aws_placement_group" "cluster" {
  name     = "my-cluster-pg"
  strategy = "cluster"
}

resource "aws_placement_group" "spread" {
  name     = "my-spread-pg"
  strategy = "spread"
}

resource "aws_placement_group" "partition" {
  name            = "my-partition-pg"
  strategy        = "partition"
  partition_count = 3
}

# Launch EC2 in Cluster Placement Group
resource "aws_instance" "cluster_instance" {
  count             = 2
  ami               = "ami-0abcdef1234567890"
  instance_type     = "c5.large"
  placement_group   = aws_placement_group.cluster.id

  tags = {
    Name = "Cluster-Instance-${count.index + 1}"
  }
}

# Launch EC2 in Spread Placement Group
resource "aws_instance" "spread_instance" {
  count           = 3
  ami             = "ami-0abcdef1234567890"
  instance_type   = "t3.micro"
  placement_group = aws_placement_group.spread.id

  tags = {
    Name = "Spread-Instance-${count.index + 1}"
  }
}
```

---

## 🧹 Cleanup

```bash
# Terminate all instances first
aws ec2 terminate-instances \
    --instance-ids i-xxx i-yyy i-zzz

# Wait for termination, then delete placement groups
aws ec2 delete-placement-group \
    --group-name my-cluster-pg

aws ec2 delete-placement-group \
    --group-name my-spread-pg

aws ec2 delete-placement-group \
    --group-name my-partition-pg
```

---

## ⚠️ Important Rules to Remember

```
1. Cannot merge placement groups
2. Cannot move RUNNING instance (must stop first)
3. Cluster PG → Recommended same instance type
4. Spread PG → Max 7 instances per AZ
5. Placement groups are FREE (pay for instances only)
6. Not all instance types support placement groups
```

---

