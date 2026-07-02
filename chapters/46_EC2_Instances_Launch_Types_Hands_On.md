# 46. EC2 Instances Launch Types Hands On
# AWS EC2 Instance Launch Types

## 📚 Theory First

### EC2 Instance Launch Types (Purchasing Options)

| Launch Type | Description | Use Case |
|-------------|-------------|----------|
| **On-Demand** | Pay per second/hour, no commitment | Short-term, unpredictable workloads |
| **Reserved** | 1 or 3 year commitment, up to 72% discount | Steady-state workloads |
| **Spot** | Bid for unused capacity, up to 90% discount | Fault-tolerant, flexible workloads |
| **Dedicated Host** | Physical server dedicated to you | Compliance, licensing requirements |
| **Dedicated Instance** | Instance on dedicated hardware | Compliance needs |
| **Savings Plans** | Commit to usage amount, flexible | Modern alternative to Reserved |
| **Capacity Reservations** | Reserve capacity in specific AZ | Ensure capacity available |

---

## 🔵 1. ON-DEMAND INSTANCES

```
✅ Pay for what you use
✅ No upfront cost
✅ No long-term commitment
✅ Highest cost but most flexible
💰 Billing: Per second (Linux) / Per hour (Windows)
```

### Best For:
- First time apps
- Short-term workloads
- Unpredictable traffic
- Testing & development

---

## 🟡 2. RESERVED INSTANCES

```
✅ Up to 72% discount vs On-Demand
✅ Reserve specific instance type
✅ 1 Year or 3 Year term
✅ Payment: No upfront / Partial / Full upfront

Types:
├── Standard Reserved    → Fixed instance type (72% discount)
├── Convertible Reserved → Can change instance type (66% discount)
└── Scheduled Reserved  → Specific time window (deprecated)
```

### Best For:
- Databases
- Web servers with steady traffic
- Long-running applications

---

## 🔴 3. SPOT INSTANCES

```
✅ Up to 90% discount vs On-Demand
⚠️  Can be terminated with 2 min notice
✅ You set max price you willing to pay

How it works:
- If Spot Price > Your Max Price → Instance TERMINATED
- If Spot Price < Your Max Price → Instance RUNNING
```

### Best For:
- Batch jobs
- Data analysis
- Image processing
- Distributed workloads
- CI/CD pipelines

### ❌ NOT Good For:
- Databases
- Critical applications
- Long running jobs without checkpointing

---

## 🟣 4. DEDICATED HOST

```
✅ Physical EC2 server dedicated to you
✅ Full control of instance placement
✅ Can use existing server-bound licenses
💰 Most expensive option
📅 On-Demand or Reserved (1 or 3 year)
```

### Best For:
- Regulatory requirements
- Software with BYOL (Bring Your Own License)
- Oracle, SQL Server licenses

---

## 🟠 5. DEDICATED INSTANCES

```
✅ Instances on dedicated hardware
✅ Hardware shared with other instances IN YOUR ACCOUNT
✅ No control over instance placement
💰 Cheaper than Dedicated Host
```

---

## 🟢 6. SAVINGS PLANS

```
✅ Commit to certain $ amount per hour
✅ 1 or 3 year commitment
✅ More flexible than Reserved

Types:
├── Compute Savings Plan  → Any instance family, region, OS (66% discount)
├── EC2 Savings Plan      → Specific instance family & region (72% discount)
└── SageMaker Savings Plan → For ML workloads
```

---

## ⚪ 7. CAPACITY RESERVATIONS

```
✅ Reserve On-Demand capacity in specific AZ
✅ No time commitment (create/cancel anytime)
✅ No billing discount
✅ Combine with Reserved Instances for discount
```

---

## 💰 Price Comparison (Example: m4.large)

```
On-Demand          → $0.10/hr    (100% - baseline)
Reserved 1yr       → $0.062/hr   (38% savings)
Reserved 3yr       → $0.043/hr   (57% savings)
Spot Instance      → $0.015/hr   (85% savings) ← varies
Savings Plan 1yr   → $0.062/hr   (38% savings)
```

---

# 🛠️ HANDS-ON PRACTICE

## Lab 1: Launch On-Demand Instance

### Step 1: Go to EC2 Console
```
AWS Console → EC2 → Instances → Launch Instance
```

### Step 2: Configure
```
Name: MyOnDemand-Server
AMI: Amazon Linux 2023
Instance Type: t2.micro (Free Tier)
Key Pair: Create new → my-keypair
Security Group: Allow SSH (port 22)
Launch Type: On-Demand (DEFAULT)
```

### Step 3: Verify
```bash
# Connect to instance
ssh -i my-keypair.pem ec2-user@<public-ip>

# Check instance metadata
curl http://169.254.169.254/latest/meta-data/instance-life-cycle
# Output should be: on-demand
```

---

## Lab 2: Request Spot Instance

### Method 1: AWS Console
```
EC2 → Instances → Launch Instance
↓
Scroll to "Advanced Details"
↓
Purchasing Option → ✅ Check "Request Spot Instances"
↓
Set Maximum Price (optional)
```

### Method 2: AWS CLI
```bash
# Request Spot Instance
aws ec2 request-spot-instances \
    --instance-count 1 \
    --type "one-time" \
    --launch-specification '{
        "ImageId": "ami-0abcdef1234567890",
        "InstanceType": "t2.micro",
        "KeyName": "my-keypair",
        "SecurityGroupIds": ["sg-12345678"]
    }' \
    --spot-price "0.05"

# Check spot request status
aws ec2 describe-spot-instance-requests

# Check current spot prices
aws ec2 describe-spot-price-history \
    --instance-types t2.micro \
    --product-descriptions "Linux/UNIX" \
    --start-time 2024-01-01T00:00:00
```

### Step 3: Verify Spot Instance
```bash
# SSH into spot instance
ssh -i my-keypair.pem ec2-user@<public-ip>

# Check lifecycle
curl http://169.254.169.254/latest/meta-data/instance-life-cycle
# Output: spot

# Check spot termination notice (2 min warning)
curl http://169.254.169.254/latest/meta-data/spot/termination-time
# Returns 404 if not being terminated
# Returns timestamp if termination scheduled
```

---

## Lab 3: Create Reserved Instance (Simulation)

```
⚠️ Note: Reserved Instances cost real money!
For learning, just go through the console flow.

EC2 → Reserved Instances → Purchase Reserved Instances
↓
Platform: Linux/UNIX
Instance Type: t2.micro
Term: 1 Year
Payment: No Upfront
Tenancy: Default
↓
Review pricing and discount
↓
(DON'T purchase if just learning!)
```

---

## Lab 4: Spot Fleet (Advanced)

```bash
# Create spot-fleet-config.json
cat > spot-fleet-config.json << 'EOF'
{
    "IamFleetRole": "arn:aws:iam::ACCOUNT_ID:role/AmazonEC2SpotFleetRole",
    "AllocationStrategy": "lowestPrice",
    "TargetCapacity": 2,
    "SpotPrice": "0.05",
    "LaunchSpecifications": [
        {
            "ImageId": "ami-0abcdef1234567890",
            "InstanceType": "t2.micro",
            "KeyName": "my-keypair"
        },
        {
            "ImageId": "ami-0abcdef1234567890", 
            "InstanceType": "t3.micro",
            "KeyName": "my-keypair"
        }
    ]
}
EOF

# Request Spot Fleet
aws ec2 request-spot-fleet \
    --spot-fleet-request-config file://spot-fleet-config.json
```

---

## Lab 5: Compare Instance Types with CLI

```bash
# List all On-Demand instances running
aws ec2 describe-instances \
    --filters "Name=instance-lifecycle,Values=normal" \
    --query 'Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name}'

# List all Spot instances
aws ec2 describe-instances \
    --filters "Name=instance-lifecycle,Values=spot" \
    --query 'Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,State:State.Name}'

# Get savings plan recommendations
aws savingsplans describe-savings-plans
```

---

## Lab 6: Savings Plans (Console Walk-through)

```
AWS Console → Cost Management → Savings Plans
↓
Purchase Savings Plans
↓
Savings Plan Type: Compute Savings Plan
↓
Term: 1 Year
↓
Payment: No Upfront
↓
Hourly Commitment: $0.10/hr
↓
Review estimated savings
↓
(DON'T purchase if just learning!)
```

---

## Lab 7: Capacity Reservation

```bash
# Create Capacity Reservation
aws ec2 create-capacity-reservation \
    --instance-type t2.micro \
    --instance-platform Linux/UNIX \
    --availability-zone us-east-1a \
    --instance-count 1 \
    --instance-match-criteria open

# Describe reservation
aws ec2 describe-capacity-reservations

# Launch instance into specific reservation
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --capacity-reservation-specification '{
        "CapacityReservationPreference": "open"
    }'

# Cancel when done (to avoid charges!)
aws ec2 cancel-capacity-reservation \
    --capacity-reservation-id cr-1234567890abcdef0
```

---

## 🧪 Practice Scenarios

### Scenario 1: Cost Optimization Challenge
```
Problem: You have a web app running 24/7
Current: On-Demand t3.large = $100/month
Task: Find cheapest option maintaining availability

Answer:
├── Reserved 1yr (No Upfront) → Save 38%
├── Reserved 3yr (Full Upfront) → Save 57%
└── Savings Plan → Flexibility + savings
```

### Scenario 2: Spot Instance Resilience
```bash
# Create spot instance with user-data to handle interruption
cat > user-data.sh << 'EOF'
#!/bin/bash
# Check for spot termination every 5 seconds
while true; do
    STATUS=$(curl -s http://169.254.169.254/latest/meta-data/spot/termination-time)
    if [ "$STATUS" != "" ]; then
        echo "Spot instance terminating! Saving work..."
        # Add your cleanup/save logic here
        aws s3 cp /tmp/work-progress s3://my-bucket/checkpoint
    fi
    sleep 5
done &

# Your actual workload
echo "Starting batch job..."
python3 /home/ec2-user/batch_job.py
EOF

# Launch with user-data
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --instance-market-options '{"MarketType":"spot"}' \
    --user-data file://user-data.sh
```

---

## 📊 Quick Decision Guide

```
Need instance NOW, short term?
└── ON-DEMAND ✅

Running 24/7 for 1-3 years?
└── RESERVED or SAVINGS PLAN ✅

Batch jobs, flexible timing?
└── SPOT ✅

Need specific hardware/licensing?
└── DEDICATED HOST ✅

Need hardware isolation (compliance)?
└── DEDICATED INSTANCE ✅

Need guaranteed capacity in AZ?
└── CAPACITY RESERVATION ✅
```

---

## ✅ Cleanup Commands

```bash
# Terminate On-Demand instances
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Cancel spot requests
aws ec2 cancel-spot-instance-requests \
    --spot-instance-request-ids sir-1234567890abcdef0

# Cancel capacity reservations  
aws ec2 cancel-capacity-reservation \
    --capacity-reservation-id cr-1234567890abcdef0

# Verify everything is cleaned up
aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].InstanceId'
```

---

## 🎯 Key Exam Tips

```
📝 Remember:
- Spot = cheapest (90%) but can be interrupted
- Reserved = 72% discount, 1 or 3 year commitment  
- Dedicated HOST = physical server (BYOL)
- Dedicated INSTANCE = dedicated hardware, not physical server
- On-Demand = no commitment, most expensive
- Savings Plans = flexible modern alternative to Reserved
- Capacity Reservation = NO discount, just guarantees capacity
```

---

## 🏆 Practice Challenge

```
Try this on your own:
1. Launch 1 On-Demand instance (t2.micro - Free Tier)
2. Launch 1 Spot instance (t2.micro)
3. SSH into both and verify lifecycle
4. Set up spot interruption handler script
5. Compare costs in Cost Explorer
6. TERMINATE BOTH when done!
```

---


