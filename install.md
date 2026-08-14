# How to Add New Chapters

This document explains how the chapter system works in the AWS Notes reader and provides a step-by-step guide to adding new chapters.

## 🏗️ How Chapters Work

The web application is dynamically driven by `catalog.md`:
1. **Catalog Parser:** On startup, `app.js` fetches `catalog.md`, parses each table row, sorts chapters by number, and builds the sidebar and navigation.
2. **Category Auto-Detection:** The app automatically matches keywords in the chapter title or path (e.g. *S3*, *VPC*, *Lambda*, *RDS*, *EC2*) to assign category badges and topic cards.
3. **Markdown Rendering:** It fetches the markdown file on demand and renders headings, code blocks with copy buttons, tables, blockquotes, and lists.

---

## 🛠️ Step-by-Step Guide

### Step 1: Create the Markdown File
Create a new `.md` file inside the `chapters/` directory following the existing naming convention: `<number>_<Title_With_Underscores>.md`.

**Example:** `chapters/65_S3_Buckets_Hands_On.md`

```markdown
# 65. S3 Buckets Hands On

# AWS S3 (Simple Storage Service) - Complete Guide & Hands-On

## 📚 Theory First

### What is Amazon S3?
- Object-based storage designed for 99.999999999% (11 9's) durability.
- Buckets are globally unique in name but regional in data residency.

---

## 🛠️ HANDS-ON PRACTICE

### ✅ Step 1: Create an S3 Bucket via AWS CLI

\`\`\`bash
aws s3 mb s3://my-unique-demo-bucket-12345 --region us-east-1
\`\`\`
```

> **Tip:** The first `# <Title>` line is automatically stripped when loaded into the reader UI because the reader displays the title in its own dedicated header banner.

---

### Step 2: Register the Chapter in `catalog.md` (and `README.md`)
Add a new row to the table in `catalog.md` (and also update `README.md` to keep them in sync):

```markdown
| 65. S3 Buckets Hands On | [View Chapter](chapters/65_S3_Buckets_Hands_On.md) |
```

> **Format Rule:** Ensure the row follows the exact pattern:  
> `| <Number>. <Chapter Title> | [View Chapter](chapters/<filename>.md) |`

---

### Step 3: (Optional) Add Category Rules in `app.js`
The app already has built-in rules for categories like **IAM**, **EC2**, **EBS**, **S3**, **VPC**, **Lambda**, **RDS**, **ELB**, **Route 53**, **CloudFront**, **Monitoring**, **Messaging**, **IaC**, and **Containers**.

If you add a chapter for a new AWS service not covered in `CATEGORY_RULES`, add a new rule object to `app.js`:

```javascript
{
    keywords: ['DynamoDB', 'NoSQL', 'DocumentDB'],
    category: 'DynamoDB',
    icon: '⚡',
    name: 'DynamoDB & NoSQL',
    desc: 'Managed NoSQL database services'
},
```

---

### Step 4: Preview and Test Locally
Because the app uses JavaScript `fetch()` to load `catalog.md` and the chapter files, it must be served over HTTP (not opened directly via `file://`).

Start a local server in the project folder:

```powershell
npx serve .
# or
python -m http.server 8000
```

Open `http://localhost:8000` (or `http://localhost:3000`) in your browser to verify that:
- The new chapter appears sorted in the sidebar.
- Category badges and topic cards display properly.
- Code blocks copy correctly.
- Prev/Next navigation links work as expected.
