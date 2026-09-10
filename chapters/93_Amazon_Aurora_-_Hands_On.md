# Amazon Aurora - Complete Guide & Hands-On

# This is not in Free Plan

## Why Amazon Aurora is Important?

```
┌─────────────────────────────────────────────────────────────┐
│                    WHY AURORA MATTERS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Traditional RDS          Aurora                           │
│  ──────────────           ──────                           │
│  • Standard MySQL    →    • 5x faster than MySQL           │
│  • Standard PostgreSQL→   • 3x faster than PostgreSQL      │
│  • Manual scaling    →    • Auto-scaling storage           │
│  • Single storage    →    • Distributed storage            │
│  • Limited HA        →    • High Availability built-in     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  KEY BENEFITS:                                              │
│  ✅ Auto-scales storage (10GB → 128TB automatically)        │
│  ✅ 6 copies of data across 3 AZs                          │
│  ✅ Self-healing storage                                    │
│  ✅ Up to 15 read replicas                                  │
│  ✅ Failover in ~30 seconds                                 │
│  ✅ Cost effective (pay for what you use)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Aurora Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AURORA ARCHITECTURE                          │
│                                                                 │
│   Client Application                                            │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────────┐                  │
│   │           Cluster Endpoint               │ ← For Writes    │
│   │     mydb.cluster-xxx.rds.amazonaws.com   │                  │
│   └─────────────────┬───────────────────────┘                  │
│                     │                                           │
│   ┌─────────────────────────────────────────┐                  │
│   │         Reader Endpoint                  │ ← For Reads     │
│   │   mydb.cluster-ro-xxx.rds.amazonaws.com  │                  │
│   └──────┬──────────────────────┬───────────┘                  │
│          │                      │                               │
│   ┌──────▼──────┐      ┌───────▼──────┐                        │
│   │   Writer    │      │    Reader    │                         │
│   │  Instance   │      │   Replica   │                         │
│   │ (Primary)   │      │             │                         │
│   └──────┬──────┘      └──────┬──────┘                         │
│          │                    │                                 │
│          └────────┬───────────┘                                 │
│                   ▼                                             │
│   ┌───────────────────────────────────────────────┐            │
│   │              Shared Storage Volume             │            │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐       │            │
│   │  │  AZ-1   │  │  AZ-2   │  │  AZ-3   │       │            │
│   │  │ 2 Copies│  │ 2 Copies│  │ 2 Copies│       │            │
│   │  └─────────┘  └─────────┘  └─────────┘       │            │
│   │         Total: 6 Copies of Data               │            │
│   └───────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hands-On Practice

### 📋 Prerequisites
- AWS Account
- Basic understanding of VPC/Security Groups

---

## STEP 1: Create Aurora Cluster (Console)

### 1.1 Navigate to RDS
```
AWS Console → Search "RDS" → Click RDS
```

### 1.2 Create Database
```
Click "Create database"
```

### 1.3 Configure Settings

```
┌─────────────────────────────────────────────┐
│           DATABASE CONFIGURATION            │
├─────────────────────────────────────────────┤
│ Choose a database creation method:          │
│   ● Standard create                         │
│                                             │
│ Engine type:                                │
│   ● Amazon Aurora                           │
│                                             │
│ Edition:                                    │
│   ● Aurora (MySQL Compatible)               │
│                                             │
│ Engine Version:                             │
│   Aurora MySQL 3.x (compatible with MySQL 8)│
│                                             │
│ Templates:                                  │
│   ● Dev/Test  ← (to save cost)             │
└─────────────────────────────────────────────┘
```

### 1.4 Settings Section
```
┌─────────────────────────────────────────────┐
│                 SETTINGS                    │
├─────────────────────────────────────────────┤
│ DB cluster identifier:                      │
│   my-aurora-cluster                         │
│                                             │
│ Master username:                            │
│   admin                                     │
│                                             │
│ Master password:                            │
│   MyPassword123!                            │
│                                             │
│ Confirm password:                           │
│   MyPassword123!                            │
└─────────────────────────────────────────────┘
```

### 1.5 Instance Configuration
```
┌─────────────────────────────────────────────┐
│          INSTANCE CONFIGURATION             │
├─────────────────────────────────────────────┤
│ DB instance class:                          │
│   ● Burstable classes                       │
│   Select: db.t3.medium  ← (cheapest option) │
└─────────────────────────────────────────────┘
```

### 1.6 Availability & Durability
```
┌─────────────────────────────────────────────┐
│        AVAILABILITY & DURABILITY            │
├─────────────────────────────────────────────┤
│ Multi-AZ deployment:                        │
│   ● Don't create an Aurora Replica          │
│     (for cost saving in practice)           │
│                                             │
│   NOTE: In Production, always choose        │
│   "Create an Aurora Replica"                │
└─────────────────────────────────────────────┘
```

### 1.7 Connectivity
```
┌─────────────────────────────────────────────┐
│               CONNECTIVITY                  │
├─────────────────────────────────────────────┤
│ Virtual private cloud (VPC):                │
│   Default VPC                               │
│                                             │
│ DB Subnet group:                            │
│   default                                   │
│                                             │
│ Public access:                              │
│   ● Yes  ← (for testing only!)             │
│                                             │
│ VPC security group:                         │
│   ● Create new                             │
│   Name: aurora-sg                           │
│                                             │
│ Database port:                              │
│   3306                                      │
└─────────────────────────────────────────────┘
```

### 1.8 Additional Configuration
```
┌─────────────────────────────────────────────┐
│          ADDITIONAL CONFIGURATION           │
├─────────────────────────────────────────────┤
│ Initial database name:                      │
│   myauroradb                                │
│                                             │
│ Backup retention period:                    │
│   1 day  ← (minimum for testing)           │
│                                             │
│ Encryption:                                 │
│   ✅ Enable encryption (default)            │
│                                             │
│ Monitoring:                                 │
│   ✅ Enable Enhanced monitoring             │
└─────────────────────────────────────────────┘
```

### 1.9 Create Database
```
Click "Create database"
⏱️ Wait 5-10 minutes for cluster to be available
```

---

## STEP 2: Explore Aurora Cluster Details

### 2.1 View Cluster Information
```
RDS Console → Databases → my-aurora-cluster

You will see:
┌─────────────────────────────────────────────┐
│           CLUSTER OVERVIEW                  │
├─────────────────────────────────────────────┤
│ my-aurora-cluster (Regional Cluster)        │
│   └── my-aurora-cluster-instance-1 (Writer) │
│                                             │
│ Endpoints:                                  │
│ • Cluster endpoint (Write):                 │
│   my-aurora-cluster.cluster-xxx.rds.com     │
│                                             │
│ • Reader endpoint (Read):                   │
│   my-aurora-cluster.cluster-ro-xxx.rds.com  │
└─────────────────────────────────────────────┘
```

### 2.2 Note Down Endpoints
```
📝 SAVE THESE - You'll need them!

Writer Endpoint:
my-aurora-cluster.cluster-XXXXXXXX.us-east-1.rds.amazonaws.com

Reader Endpoint:
my-aurora-cluster.cluster-ro-XXXXXXXX.us-east-1.rds.amazonaws.com
```

---

## STEP 3: Connect to Aurora via EC2 Instance Connect

### Why EC2 Instance Connect here?
```
Aurora is in private network → Need EC2 as jump server
Direct console connection to MySQL not available in AWS Console
```

### 3.1 Launch EC2 Instance
```
EC2 Console → Launch Instance

Name: aurora-test-server
AMI: Amazon Linux 2023
Instance Type: t2.micro
Key pair: Proceed without key pair
           (using EC2 Instance Connect)

Network Settings:
  VPC: Same as Aurora (Default VPC)
  Auto-assign public IP: Enable
  Security Group: Create new → ec2-for-aurora-sg
    Allow: SSH from My IP
```

### 3.2 Update Aurora Security Group
```
RDS Console → aurora-sg → Edit inbound rules

Add Rule:
  Type: MySQL/Aurora
  Port: 3306
  Source: Custom → Select "ec2-for-aurora-sg"

Click Save rules
```

```
┌──────────────────────────────────────────────┐
│           SECURITY GROUP FLOW                │
│                                              │
│  Your Browser                                │
│      │ SSH (port 22)                         │
│      ▼                                       │
│  ┌─────────────┐                            │
│  │  EC2        │ ec2-for-aurora-sg           │
│  │  Instance   │                            │
│  └──────┬──────┘                            │
│         │ MySQL (port 3306)                  │
│         ▼                                    │
│  ┌─────────────┐                            │
│  │   Aurora    │ aurora-sg                  │
│  │   Cluster   │ (allows from ec2-sg)       │
│  └─────────────┘                            │
└──────────────────────────────────────────────┘
```

### 3.3 Connect to EC2 via Instance Connect
```
EC2 Console → Instances → aurora-test-server
Click "Connect" → EC2 Instance Connect → Connect
```

### 3.4 Install MySQL Client
```bash
# Update system
sudo yum update -y

# Install MySQL client
sudo yum install mysql -y

# Verify installation
mysql --version
```

### 3.5 Connect to Aurora Cluster
```bash
# Connect to Writer (cluster endpoint)
mysql -h my-aurora-cluster.cluster-XXXXXXXX.us-east-1.rds.amazonaws.com \
      -u admin \
      -p

# Enter password: MyPassword123!
```

---

## STEP 4: Practice MySQL Operations on Aurora

### 4.1 Verify Aurora Connection
```sql
-- Check Aurora version
SELECT VERSION();

-- Check if it's Aurora
SELECT @@aurora_version;

-- Check which server you're connected to
SELECT @@hostname;
```

**Expected Output:**
```
+------------------+
| @@aurora_version |
+------------------+
| 3.04.0           |
+------------------+
```

### 4.2 Create Database and Tables
```sql
-- Use our database
USE myauroradb;

-- Create employees table
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(50),
    location VARCHAR(100)
);

-- Show tables
SHOW TABLES;
```

### 4.3 Insert Data
```sql
-- Insert employees
INSERT INTO employees (name, department, salary) VALUES
('Alice Johnson', 'Engineering', 95000.00),
('Bob Smith', 'Marketing', 75000.00),
('Carol White', 'Engineering', 88000.00),
('David Brown', 'HR', 65000.00),
('Eve Davis', 'Engineering', 102000.00);

-- Insert departments
INSERT INTO departments (dept_name, location) VALUES
('Engineering', 'New York'),
('Marketing', 'Los Angeles'),
('HR', 'Chicago');

-- Verify inserts
SELECT * FROM employees;
SELECT * FROM departments;
```

### 4.4 Practice Queries
```sql
-- Count employees by department
SELECT department, 
       COUNT(*) as employee_count,
       AVG(salary) as avg_salary
FROM employees 
GROUP BY department;

-- Find highest paid employees
SELECT name, department, salary 
FROM employees 
ORDER BY salary DESC 
LIMIT 3;

-- Join query
SELECT e.name, e.salary, d.location
FROM employees e
JOIN departments d ON e.department = d.dept_name;
```

---

## STEP 5: Test Aurora High Availability Features

### 5.1 Check Cluster Nodes
```sql
-- Check all nodes in cluster
SELECT server_id, session_id, last_update_timestamp, is_current
FROM information_schema.replica_host_status;
```

### 5.2 Add Read Replica (Console)
```
RDS Console → Databases → my-aurora-cluster
Actions → Add reader

Configuration:
  DB instance identifier: my-aurora-reader
  Instance class: db.t3.medium

Click "Add reader"
⏱️ Wait 5 minutes
```

### 5.3 Connect to Reader Endpoint
```bash
# Open new terminal (EC2 Instance Connect again)
# Connect to READER endpoint
mysql -h my-aurora-cluster.cluster-ro-XXXXXXXX.us-east-1.rds.amazonaws.com \
      -u admin \
      -p
```

```sql
-- This works (SELECT on reader)
SELECT * FROM employees;

-- Check if this is read-only
SELECT @@read_only;
-- Output: 1 (means READ ONLY = TRUE)

-- This will FAIL on reader (expected!)
INSERT INTO employees (name, department, salary) 
VALUES ('Test', 'IT', 50000);
-- ERROR: Running on read replica
```

---

## STEP 6: Aurora Auto Scaling (Console)

### 6.1 Setup Auto Scaling for Read Replicas
```
RDS Console → Databases → my-aurora-cluster
Click "Add reader" 

OR

Actions → "Add Auto Scaling policy"

┌─────────────────────────────────────────────┐
│           AUTO SCALING POLICY               │
├─────────────────────────────────────────────┤
│ Policy name: aurora-read-scaling            │
│                                             │
│ Target metric:                              │
│   Average CPU utilization of Aurora Replicas│
│                                             │
│ Target value: 40%                           │
│                                             │
│ Minimum capacity: 1                         │
│ Maximum capacity: 5                         │
│                                             │
│ Click "Add policy"                          │
└─────────────────────────────────────────────┘
```

---

## STEP 7: Aurora Serverless (Bonus - Important Concept)

### What is Aurora Serverless?
```
┌────────────────────────────────────────────────────┐
│              AURORA SERVERLESS v2                  │
├────────────────────────────────────────────────────┤
│                                                    │
│  Traditional Aurora          Aurora Serverless     │
│  ─────────────────           ────────────────────  │
│  Fixed instance size    →    Scales automatically  │
│  Pay for instance 24/7  →   Pay per second        │
│  Manual scaling         →    Auto scaling          │
│                                                    │
│  Best for:                                         │
│  ✅ Variable workloads                             │
│  ✅ Development/Testing                            │
│  ✅ Infrequent applications                        │
│  ✅ Unpredictable traffic                          │
│                                                    │
│  Capacity Unit (ACU):                              │
│  Min: 0.5 ACU → Max: 128 ACU (auto scales)        │
└────────────────────────────────────────────────────┘
```

### Create Aurora Serverless (Console)
```
RDS → Create database → Amazon Aurora

Engine: Aurora MySQL Compatible
Edition: Aurora Serverless v2

Configuration:
  Min ACU: 0.5
  Max ACU: 4

(Rest same as before)
```

---

## STEP 8: Monitor Aurora (Console)

### 8.1 Check Monitoring Metrics
```
RDS Console → Databases → my-aurora-cluster
Click "Monitoring" tab

Key Metrics to Watch:
┌─────────────────────────────────────────────┐
│              AURORA METRICS                 │
├─────────────────────────────────────────────┤
│ • CPU Utilization                           │
│ • DB Connections                            │
│ • Read/Write IOPS                           │
│ • Freeable Memory                           │
│ • AuroraReplicaLag                          │
│ • CommitLatency                             │
│ • DMLLatency                                │
└─────────────────────────────────────────────┘
```

### 8.2 View Aurora-Specific Metrics (SQL)
```sql
-- Check database status
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';

-- Check buffer pool
SHOW STATUS LIKE 'Innodb_buffer_pool%';

-- Check replication lag (on reader)
SHOW REPLICA STATUS\G
```

---

## STEP 9: Aurora Backups & Snapshots (Console)

### 9.1 Create Manual Snapshot
```
RDS Console → Databases
Select: my-aurora-cluster-instance-1

Actions → Take snapshot

Snapshot name: my-aurora-manual-snapshot-v1

Click "Take snapshot"
```

### 9.2 View Automated Backups
```
RDS Console → Automated backups

You'll see:
• Continuous backups (point-in-time recovery)
• Retention period you set (1 day in our case)
• Can restore to any second within retention period!
```

### 9.3 Restore from Snapshot (Process)
```
RDS Console → Snapshots
Select your snapshot
Actions → Restore snapshot

This creates a NEW cluster from the snapshot
(Does not affect existing cluster)
```

---

## STEP 10: Cleanup (IMPORTANT - Avoid Charges!)

### 10.1 Delete Read Replica First
```
RDS Console → Databases
Select: my-aurora-reader
Actions → Delete

☑️ I acknowledge...
Click "Delete"
```

### 10.2 Delete Aurora Cluster
```
RDS Console → Databases
Select: my-aurora-cluster-instance-1 (Writer)
Actions → Delete

Final snapshot? → No (for practice)
☑️ I acknowledge...
Type: "delete me"
Click "Delete"

Then delete the cluster:
Select: my-aurora-cluster
Actions → Delete
```

### 10.3 Delete EC2 Instance
```
EC2 Console → Instances
Select: aurora-test-server
Instance State → Terminate instance
```

### 10.4 Delete Snapshots
```
RDS Console → Snapshots
Select all manual snapshots
Actions → Delete snapshot
```

---

## Aurora vs RDS Comparison Cheat Sheet

```
┌──────────────────┬───────────────────┬───────────────────┐
│    Feature       │    RDS MySQL      │    Aurora MySQL   │
├──────────────────┼───────────────────┼───────────────────┤
│ Performance      │   Baseline        │   5x faster       │
│ Storage          │   Up to 64TB      │   Up to 128TB     │
│ Storage Scaling  │   Manual          │   Automatic       │
│ Read Replicas    │   Up to 5         │   Up to 15        │
│ Failover Time    │   ~60-120 seconds │   ~30 seconds     │
│ Data Copies      │   1 (or 2 MultiAZ)│   6 copies        │
│ AZs for Storage  │   1 or 2          │   3               │
│ Serverless       │   ❌              │   ✅              │
│ Global Database  │   ❌              │   ✅              │
│ Cost             │   Lower           │   ~20% more       │
└──────────────────┴───────────────────┴───────────────────┘
```

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────┐
│                  REMEMBER THESE!                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Aurora stores 6 copies across 3 AZs                │
│                                                         │
│  2. Two endpoints:                                      │
│     • Cluster endpoint → WRITE operations              │
│     • Reader endpoint → READ operations                │
│                                                         │
│  3. Storage auto-scales 10GB → 128TB                   │
│                                                         │
│  4. Failover is automatic (~30 seconds)                │
│                                                         │
│  5. Aurora Serverless = pay per second                 │
│                                                         │
│  6. Up to 15 Read Replicas (vs 5 in RDS)              │
│                                                         │
│  7. Compatible with MySQL & PostgreSQL                 │
│     (can use same drivers/tools)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Common Interview Questions

```
Q: What makes Aurora different from RDS?
A: Aurora has 6 copies of data across 3 AZs, 
   auto-scaling storage, faster performance, 
   and up to 15 read replicas

Q: What are Aurora endpoints?
A: Cluster endpoint (write), Reader endpoint (read),
   Instance endpoint (specific instance)

Q: What is Aurora Serverless?
A: Auto-scaling database that scales based on demand,
   pay per second of usage

Q: How does Aurora handle failover?
A: Automatically promotes a replica to primary
   in ~30 seconds, DNS is updated automatically
```

This hands-on covers everything you need to understand Aurora practically! 🚀