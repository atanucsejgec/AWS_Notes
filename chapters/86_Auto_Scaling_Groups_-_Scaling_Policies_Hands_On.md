# AWS Auto Scaling Groups - Scaling Policies

## Why This Is Important? 🎯

### Real-World Problems It Solves:

```
WITHOUT Scaling Policies:
┌─────────────────────────────────────────────────────┐
│  Traffic Spike (Black Friday)                        │
│  Your app → 1 EC2 instance → CRASHES 💥             │
│  Users get errors, you lose money                    │
│                                                      │
│  Low Traffic (3 AM)                                  │
│  Your app → 10 EC2 instances → WASTE MONEY 💸        │
│  Paying for idle servers                             │
└─────────────────────────────────────────────────────┘

WITH Scaling Policies:
┌─────────────────────────────────────────────────────┐
│  Traffic Spike → Auto adds more instances ✅         │
│  Traffic drops → Auto removes instances ✅           │
│  Always right number of servers                      │
│  Save money + Stay available                         │
└─────────────────────────────────────────────────────┘
```

### Business Benefits:
| Benefit | Description |
|---------|-------------|
| **High Availability** | App stays up during traffic spikes |
| **Cost Optimization** | Pay only for what you need |
| **Automation** | No manual intervention needed |
| **Performance** | Maintain good response times |
| **Fault Tolerance** | Replace unhealthy instances automatically |

---

## Types of Scaling Policies

```
┌─────────────────────────────────────────────────────────┐
│              SCALING POLICIES                           │
├─────────────────┬───────────────────┬───────────────────┤
│   DYNAMIC       │    SCHEDULED      │    PREDICTIVE     │
│   SCALING       │    SCALING        │    SCALING        │
├─────────────────┼───────────────────┼───────────────────┤
│ • Target        │ Scale at specific │ ML-based future   │
│   Tracking      │ time/date         │ traffic forecast  │
│ • Step          │                   │                   │
│ • Simple        │ Example:          │ Example:          │
│                 │ Scale up at 9AM   │ Predict Monday    │
│ Responds to     │ Scale down at 6PM │ morning rush      │
│ current metrics │                   │                   │
└─────────────────┴───────────────────┴───────────────────┘
```

### Dynamic Scaling - Deep Dive:

```
1. TARGET TRACKING (Easiest - Recommended)
   ├── You say: "Keep CPU at 50%"
   ├── AWS automatically adds/removes instances
   └── Example: CPU > 50% → Add instances
               CPU < 50% → Remove instances

2. STEP SCALING
   ├── Different actions for different thresholds
   └── Example: CPU 60-70% → Add 1 instance
               CPU 70-80% → Add 2 instances  
               CPU > 80%  → Add 3 instances

3. SIMPLE SCALING
   ├── One action per alarm trigger
   ├── Has cooldown period
   └── Older method, Step Scaling preferred
```

---

## Hands-On Lab 🛠️

### Architecture We'll Build:

```
                    Internet
                       │
              ┌────────▼────────┐
              │   Application   │
              │  Load Balancer  │
              └────────┬────────┘
                       │
         ┌─────────────▼─────────────┐
         │    Auto Scaling Group     │
         │  ┌────┐  ┌────┐  ┌────┐  │
         │  │EC2 │  │EC2 │  │EC2 │  │
         │  │ 1  │  │ 2  │  │ 3  │  │
         │  └────┘  └────┘  └────┘  │
         │  min:1   desired:2  max:4 │
         └───────────────────────────┘
                       │
              Scaling Policies:
              - Target: CPU 50%
              - Scale Out: CPU > 70%
              - Scale In:  CPU < 30%
```

---

## STEP 1: Create Security Group

**Console → EC2 → Security Groups → Create**

```
Security Group Name: asg-demo-sg
Description: Security group for ASG demo
VPC: Default VPC

Inbound Rules:
┌──────────┬──────────┬───────────┬─────────────┐
│ Type     │ Protocol │ Port      │ Source      │
├──────────┼──────────┼───────────┼─────────────┤
│ HTTP     │ TCP      │ 80        │ 0.0.0.0/0   │
│ SSH      │ TCP      │ 22        │ 0.0.0.0/0   │
└──────────┴──────────┴───────────┴─────────────┘

Click: Create Security Group
```

---

## STEP 2: Create Launch Template

**Console → EC2 → Launch Templates → Create Launch Template**

```
Launch template name: asg-demo-template
Template version description: v1 - Web Server

✅ Check: "Provide guidance to help me set up 
           a template that I can use with EC2 Auto Scaling"

AMI: Amazon Linux 2023 AMI (Free tier)
Instance type: t2.micro
Key pair: your-existing-key (or create new)

Security groups: asg-demo-sg

Advanced details → User data:
```

```bash
#!/bin/bash
# ============================================
# IMDSv2 Compatible Script for Amazon Linux 2023
# ============================================

# Update system
yum update -y

# Install Apache web server and stress tool
yum install -y httpd stress

# Start Apache
systemctl start httpd
systemctl enable httpd

# ============================================
# Get IMDSv2 Token FIRST
# ============================================
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# ============================================
# Fetch Metadata using TOKEN
# ============================================
INSTANCE_ID=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)

AZ=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/availability-zone)

PRIVATE_IP=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/local-ipv4)

PUBLIC_IP=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/public-ipv4)

INSTANCE_TYPE=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-type)

# ============================================
# Create Web Page with real metadata
# ============================================
cat > /var/www/html/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ASG Demo Server</title>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            background-color: #232F3E;
            color: white;
            margin: 0;
            padding: 20px;
        }
        .box {
            border: 2px solid #FF9900;
            padding: 30px;
            margin: 50px auto;
            width: 500px;
            border-radius: 10px;
            background-color: #2d3a4a;
        }
        h1 { color: #FF9900; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #444;
            text-align: left;
        }
        td:first-child {
            color: #FF9900;
            font-weight: bold;
            width: 40%;
        }
        .healthy {
            color: #00ff00;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="box">
        <h1>🚀 AWS Auto Scaling Demo</h1>
        <p class="healthy">✅ Instance is Healthy</p>
        <table>
            <tr>
                <td>🖥️ Instance ID</td>
                <td>${INSTANCE_ID}</td>
            </tr>
            <tr>
                <td>🌍 Availability Zone</td>
                <td>${AZ}</td>
            </tr>
            <tr>
                <td>🔒 Private IP</td>
                <td>${PRIVATE_IP}</td>
            </tr>
            <tr>
                <td>🌐 Public IP</td>
                <td>${PUBLIC_IP}</td>
            </tr>
            <tr>
                <td>⚙️ Instance Type</td>
                <td>${INSTANCE_TYPE}</td>
            </tr>
            <tr>
                <td>🕐 Launch Time</td>
                <td>$(date)</td>
            </tr>
        </table>
    </div>
</body>
</html>
EOF

# ============================================
# Log completion
# ============================================
echo "==============================" >> /var/log/user-data.log
echo "Setup complete: $(date)"        >> /var/log/user-data.log
echo "Instance ID : ${INSTANCE_ID}"   >> /var/log/user-data.log
echo "Private IP  : ${PRIVATE_IP}"    >> /var/log/user-data.log
echo "AZ          : ${AZ}"            >> /var/log/user-data.log
echo "==============================" >> /var/log/user-data.log
```

```
Click: Create Launch Template ✅
```

---

## STEP 3: Create Application Load Balancer

**Console → EC2 → Load Balancers → Create Load Balancer**

```
Select: Application Load Balancer → Create

Basic Configuration:
├── Name: asg-demo-alb
├── Scheme: Internet-facing
└── IP address type: IPv4

Network Mapping:
├── VPC: Default
└── Mappings: Select ALL Availability Zones ✅

Security Groups:
└── Select: asg-demo-sg

Listeners and Routing:
└── Port 80 → Create Target Group:
    ├── Target type: Instances
    ├── Name: asg-demo-tg
    ├── Protocol: HTTP
    ├── Port: 80
    ├── Health checks:
    │   ├── Protocol: HTTP
    │   └── Path: /
    └── Click: Create Target Group

Back in ALB → Select: asg-demo-tg
Click: Create Load Balancer ✅
```

---

## STEP 4: Create Auto Scaling Group

**Console → EC2 → Auto Scaling Groups → Create**

### 4.1 - Choose Launch Template
```
Name: asg-demo-group
Launch Template: asg-demo-template
Version: Latest (1)

Click: Next
```

### 4.2 - Choose Instance Launch Options
```
VPC: Default VPC
Availability Zones: Select ALL (us-east-1a, 1b, 1c)

Click: Next
```

### 4.3 - Configure Advanced Options
```
Load Balancing:
└── ✅ Attach to an existing load balancer
    └── Choose: asg-demo-tg | HTTP

Health Checks:
├── ✅ Turn on Elastic Load Balancing health checks
└── Health check grace period: 300 seconds

Monitoring:
└── ✅ Enable group metrics collection within CloudWatch

Click: Next
```

### 4.4 - Configure Group Size and Scaling
```
Group Size:
├── Desired capacity: 2
├── Minimum capacity: 1
└── Maximum capacity: 4

Scaling Policies:
└── ✅ Target tracking scaling policy
    ├── Scaling policy name: cpu-target-tracking
    ├── Metric type: Average CPU Utilization
    ├── Target value: 50
    └── ✅ Disable scale in to create only a scale-out policy
        (uncheck this - we want both scale in and out)

Instance Warmup: 300 seconds

Click: Next
```

### 4.5 - Add Notifications (Optional)
```
Skip for now
Click: Next
```

### 4.6 - Add Tags
```
Key: Name
Value: asg-demo-instance

Click: Next → Create Auto Scaling Group ✅
```

---

## STEP 5: Verify Setup

**Wait 3-5 minutes, then check:**

```
Console → EC2 → Instances
You should see: 2 instances running ✅
Both named: asg-demo-instance

Console → EC2 → Target Groups → asg-demo-tg
→ Targets tab
You should see: 2 instances Healthy ✅

Console → EC2 → Load Balancers → asg-demo-alb
Copy DNS name → Open in browser
You should see: Your web page ✅
```

---

## STEP 6: Add Step Scaling Policy

**Console → EC2 → Auto Scaling Groups → asg-demo-group**

```
Tab: Automatic Scaling → Create dynamic scaling policy

Policy type: Step scaling

SCALE OUT POLICY:
├── Name: scale-out-step
├── CloudWatch alarm: Create new alarm
│   ├── Metric: EC2 → By Auto Scaling Group
│   │   └── CPUUtilization
│   ├── Statistic: Average
│   ├── Period: 1 minute
│   ├── Condition: Greater than 70
│   ├── Alarm name: high-cpu-alarm
│   └── Create alarm ✅
│
├── Take the action:
│   ├── Add 1 capacity units when 70 ≤ CPUUtil < 80
│   ├── Add 2 capacity units when 80 ≤ CPUUtil < 90
│   └── Add 3 capacity units when 90 ≤ CPUUtil
└── Create ✅

SCALE IN POLICY:
├── Name: scale-in-step  
├── CloudWatch alarm: Create new alarm
│   ├── Same metric: CPUUtilization
│   ├── Condition: Less than 30
│   ├── Alarm name: low-cpu-alarm
│   └── Create alarm ✅
│
├── Take the action:
│   └── Remove 1 capacity units when CPUUtil < 30
└── Create ✅
```

---

## STEP 7: Add Scheduled Scaling Policy

**Same Tab → Create scheduled action**

```
Simulate Business Hours:

SCALE UP (9 AM):
├── Name: business-hours-start
├── Desired: 3
├── Min: 2  
├── Max: 4
├── Recurrence: Cron → 0 9 * * MON-FRI
└── Time zone: Your timezone

SCALE DOWN (6 PM):
├── Name: business-hours-end
├── Desired: 1
├── Min: 1
├── Max: 2
├── Recurrence: Cron → 0 18 * * MON-FRI
└── Time zone: Your timezone
```

---

## STEP 8: Test Scaling! 🧪

### Test Scale OUT - Stress CPU

**Console → EC2 → Instances → Pick one instance**
**→ Connect → EC2 Instance Connect**

```bash
# Check current CPU
top

# Install stress (already installed by user data)
# Run CPU stress test - this will trigger scaling!
stress --cpu 4 --timeout 300

# In another terminal, watch CPU
watch -n 5 'uptime'
```

### Monitor in Console (New Browser Tab):

```
Tab 1: EC2 → Auto Scaling Groups → asg-demo-group
       → Activity tab (Watch scaling events)

Tab 2: CloudWatch → Alarms
       Watch: high-cpu-alarm go to ALARM state 🔴

Tab 3: EC2 → Instances
       Watch: New instance launching! ✅
```

### Expected Timeline:
```
0 min  : stress command starts
1 min  : CPU alarm triggers (1 min period)
2-3 min: Auto Scaling receives alarm
3-5 min: New EC2 instance launches
5-7 min: Instance passes health checks
7-8 min: Instance added to Load Balancer
8+ min : Traffic distributed to new instance
```

---

## STEP 9: Verify Scaling Worked

```
Console → EC2 → Auto Scaling Groups → asg-demo-group

Activity Tab:
┌─────────────────────────────────────────────────────┐
│ Activity History                                     │
│ ✅ Launching new instance: i-xxxxxxxxx               │
│    Cause: high-cpu-alarm triggered                  │
│ ✅ Instance i-xxxxxxxxx added to load balancer       │
└─────────────────────────────────────────────────────┘

Instance Management Tab:
┌─────────┬──────────────┬─────────┐
│ ID      │ Lifecycle    │ Health  │
├─────────┼──────────────┼─────────┤
│ i-xxx1  │ InService    │Healthy  │
│ i-xxx2  │ InService    │Healthy  │
│ i-xxx3  │ InService    │Healthy  │ ← NEW!
└─────────┴──────────────┴─────────┘

Monitoring Tab:
└── See CPU graphs rise then fall
```

---

## STEP 10: Test Scale IN

```bash
# Stop the stress test (Ctrl+C or wait 300s timeout)
# CPU will drop below 30%
# Auto Scaling will remove an instance after cooldown
```

```
Watch Console:
┌─────────────────────────────────────────────────────┐
│ Activity History                                     │
│ ✅ Terminating instance: i-xxx3                      │
│    Cause: low-cpu-alarm triggered                   │
│ Group goes from 3 back to 2 instances               │
└─────────────────────────────────────────────────────┘
```

---

## CloudWatch Dashboard - Monitor Everything

**Console → CloudWatch → Dashboards → Create Dashboard**

```
Dashboard name: ASG-Monitoring

Add Widgets:

Widget 1: Line Chart
└── Metric: EC2 → ASG → GroupInServiceInstances
    (Shows instance count over time)

Widget 2: Line Chart  
└── Metric: EC2 → ASG → CPUUtilization
    (Shows average CPU)

Widget 3: Alarm Status
└── high-cpu-alarm
└── low-cpu-alarm
```

---

## Understanding Cooldown Periods

```
WHY COOLDOWN EXISTS:
┌─────────────────────────────────────────────────────┐
│ Without Cooldown:                                    │
│ CPU spikes → Add instance → CPU still high           │
│ → Add another → Add another → ADD TOO MANY! 😱      │
│                                                      │
│ With Cooldown (300 seconds default):                 │
│ CPU spikes → Add instance → WAIT 5 minutes           │
│ → Let new instance stabilize → Check again → OK ✅   │
└─────────────────────────────────────────────────────┘

Default Cooldown: 300 seconds (Simple Scaling)
Instance Warmup:  300 seconds (Step/Target Tracking)
```

---

## Scaling Policy Comparison Summary

```
┌──────────────────┬────────────────┬──────────────────┐
│ Policy Type      │ Best For       │ Complexity       │
├──────────────────┼────────────────┼──────────────────┤
│ Target Tracking  │ Most cases     │ Easy ⭐           │
│                  │ CPU, Network   │                  │
├──────────────────┼────────────────┼──────────────────┤
│ Step Scaling     │ Variable load  │ Medium ⭐⭐        │
│                  │ Fine control   │                  │
├──────────────────┼────────────────┼──────────────────┤
│ Simple Scaling   │ Basic needs    │ Easy ⭐           │
│                  │ (legacy)       │                  │
├──────────────────┼────────────────┼──────────────────┤
│ Scheduled        │ Known patterns │ Easy ⭐           │
│                  │ Business hours │                  │
├──────────────────┼────────────────┼──────────────────┤
│ Predictive       │ Cyclical load  │ Easy ⭐           │
│                  │ ML-powered     │ (AWS does work)  │
└──────────────────┴────────────────┴──────────────────┘
```

---

## Clean Up (Avoid Charges!) 💰

```
Delete in this ORDER:

1. Auto Scaling Group
   → EC2 → Auto Scaling Groups → asg-demo-group
   → Delete (this terminates all instances)

2. Load Balancer
   → EC2 → Load Balancers → asg-demo-alb → Delete

3. Target Group
   → EC2 → Target Groups → asg-demo-tg → Delete

4. Launch Template
   → EC2 → Launch Templates → asg-demo-template → Delete

5. Security Group
   → EC2 → Security Groups → asg-demo-sg → Delete

6. CloudWatch Alarms
   → CloudWatch → Alarms → Delete both alarms
```

---

## Key Takeaways 📝

```
✅ Target Tracking = Simplest, use this most of the time
✅ Step Scaling = More control for variable workloads  
✅ Scheduled = Great for predictable patterns
✅ Always set Min/Max boundaries
✅ Cooldown prevents over-scaling
✅ ALB + ASG = Perfect combination
✅ CloudWatch metrics drive all decisions
✅ Health checks auto-replace unhealthy instances
```

---

## Exam Tips (AWS Certified) 🎓

```
Q: What scaling maintains exactly 50% CPU?
A: Target Tracking Scaling ✅

Q: Scale based on SQS queue depth?
A: Step Scaling with custom metric ✅

Q: Scale at 9 AM every Monday?  
A: Scheduled Scaling ✅

Q: ML predicts future load?
A: Predictive Scaling ✅

Q: What prevents rapid scale up/down?
A: Cooldown Period ✅

Q: Instance launches but takes time to be ready?
A: Instance Warmup Period ✅
```

You now have a **fully working Auto Scaling setup** with multiple scaling policies! 🎉