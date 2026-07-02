/* ================================================
   AWS Notes Reader — Application Logic
   Auto-discovers chapters from catalog.md
   ================================================ */

// ===== Dynamic Chapter Data (loaded from catalog.md) =====
let CHAPTERS = [];
let TOPIC_GROUPS = [];

// Category detection rules — add new AWS services here as you expand your notes.
// The app auto-assigns categories by matching keywords in the chapter title.
const CATEGORY_RULES = [
    { keywords: ['IAM', 'MFA', 'CLI', 'CloudShell', 'Roles', 'Policy', 'Policies'],
      category: 'IAM', icon: '🔐', name: 'IAM & Security', desc: 'Identity, Access Management & CLI' },
    { keywords: ['Budget', 'Billing', 'Cost'],
      category: 'Billing', icon: '💰', name: 'Billing & Budgets', desc: 'Cost management & budget setup' },
    { keywords: ['EC2', 'Instance', 'Security Group', 'Placement', 'ENI', 'Elastic Network', 'Hibernate', 'Elastic IP', 'Private vs Public'],
      category: 'EC2', icon: '🖥️', name: 'EC2 Compute', desc: 'Instances, networking & security' },
    { keywords: ['EBS', 'Snapshot', 'AMI', 'Volume'],
      category: 'EBS', icon: '💾', name: 'EBS Storage', desc: 'Volumes, snapshots & AMIs' },
    { keywords: ['S3', 'Bucket'],
      category: 'S3', icon: '🪣', name: 'S3 Storage', desc: 'Object storage & buckets' },
    { keywords: ['VPC', 'Subnet', 'NAT', 'Internet Gateway', 'NACL'],
      category: 'VPC', icon: '🌐', name: 'VPC Networking', desc: 'Virtual Private Cloud & networking' },
    { keywords: ['Lambda', 'Serverless'],
      category: 'Lambda', icon: '⚡', name: 'Lambda', desc: 'Serverless compute' },
    { keywords: ['RDS', 'Aurora', 'Database', 'DynamoDB', 'ElastiCache'],
      category: 'RDS', icon: '🗃️', name: 'Databases', desc: 'Relational & NoSQL databases' },
    { keywords: ['ELB', 'Load Balancer', 'ASG', 'Auto Scaling'],
      category: 'ELB', icon: '⚖️', name: 'ELB & ASG', desc: 'Load balancing & auto scaling' },
    { keywords: ['Route 53', 'DNS'],
      category: 'Route53', icon: '🔀', name: 'Route 53', desc: 'DNS & domain management' },
    { keywords: ['CloudFront', 'CDN'],
      category: 'CloudFront', icon: '🌍', name: 'CloudFront', desc: 'Content delivery network' },
    { keywords: ['CloudWatch', 'Monitoring', 'Alarm'],
      category: 'Monitoring', icon: '📊', name: 'Monitoring', desc: 'CloudWatch & alarms' },
    { keywords: ['SQS', 'SNS', 'EventBridge', 'Kinesis'],
      category: 'Messaging', icon: '📨', name: 'Messaging', desc: 'Queues, notifications & streaming' },
    { keywords: ['CloudFormation', 'Beanstalk', 'CDK'],
      category: 'IaC', icon: '🏗️', name: 'Infrastructure as Code', desc: 'CloudFormation & deployment' },
    { keywords: ['Docker', 'ECS', 'ECR', 'Fargate', 'EKS'],
      category: 'Containers', icon: '🐳', name: 'Containers', desc: 'Docker, ECS & Kubernetes' },
];

// Fallback category for chapters that don't match any rule
const FALLBACK_CATEGORY = { category: 'AWS', icon: '☁️', name: 'AWS General', desc: 'General AWS services' };


// ===== Catalog Parser =====
// Fetches catalog.md and builds CHAPTERS + TOPIC_GROUPS automatically
async function loadCatalog() {
    try {
        const res = await fetch('catalog.md');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        const lines = text.split(/\r?\n/);
        const chapters = [];

        for (const line of lines) {
            // Match table data rows: | 12. Title Here | [View Chapter](chapters/file.md) |
            const match = line.match(/^\|\s*(\d+)[\.\s]*(.+?)\s*\|\s*\[.*?\]\((.+?)\)\s*\|/);
            if (!match) continue;

            const num = parseInt(match[1]);
            const title = match[2].replace(/\s*[-–]\s*$/, '').trim();  // Clean trailing dashes
            const file = match[3].trim();
            const category = detectCategory(title, file);

            chapters.push({ num, title, file, category });
        }

        // Sort by chapter number
        chapters.sort((a, b) => a.num - b.num);
        CHAPTERS = chapters;

        // Auto-build topic groups from discovered categories
        buildTopicGroups();

        console.log(`📚 Loaded ${CHAPTERS.length} chapters from catalog.md`);
    } catch (err) {
        console.error('Failed to load catalog.md:', err);
        // Show error on the welcome screen
        const welcome = document.getElementById('welcomeScreen');
        if (welcome) {
            welcome.innerHTML = `<div style="text-align:center; padding:60px 20px; color:var(--text-primary);">
                <p style="font-size:2rem; margin-bottom:16px;">⚠️</p>
                <h2>Could not load catalog</h2>
                <p style="color:var(--text-tertiary); margin-top:12px;">Make sure <code>catalog.md</code> exists and you're serving via a web server.</p>
                <p style="color:var(--text-tertiary); font-size:0.85rem; margin-top:8px;">${err.message}</p>
            </div>`;
        }
    }
}

// Detect category from chapter title using keyword rules
function detectCategory(title, file) {
    const combined = (title + ' ' + file).toLowerCase();
    for (const rule of CATEGORY_RULES) {
        for (const kw of rule.keywords) {
            if (combined.includes(kw.toLowerCase())) {
                return rule.category;
            }
        }
    }
    return FALLBACK_CATEGORY.category;
}

// Build TOPIC_GROUPS from the categories found in CHAPTERS
function buildTopicGroups() {
    const seen = new Set();
    TOPIC_GROUPS = [];

    for (const ch of CHAPTERS) {
        if (seen.has(ch.category)) continue;
        seen.add(ch.category);

        // Find the matching rule for this category
        const rule = CATEGORY_RULES.find(r => r.category === ch.category);
        if (rule) {
            TOPIC_GROUPS.push({
                icon: rule.icon,
                name: rule.name,
                filter: rule.category,
                desc: rule.desc,
            });
        } else {
            TOPIC_GROUPS.push({
                icon: FALLBACK_CATEGORY.icon,
                name: FALLBACK_CATEGORY.name,
                filter: ch.category,
                desc: FALLBACK_CATEGORY.desc,
            });
        }
    }
}


// ===== DOM Elements =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
    sidebar:         $('#sidebar'),
    sidebarToggle:   $('#sidebarToggle'),
    sidebarOverlay:  $('#sidebarOverlay'),
    chapterList:     $('#chapterList'),
    chapterSearch:   $('#chapterSearch'),
    chapterCount:    $('#chapterCount'),
    mainContent:     $('#mainContent'),
    welcomeScreen:   $('#welcomeScreen'),
    chapterContent:  $('#chapterContent'),
    chapterHeader:   $('#chapterHeader'),
    chapterBadge:    $('#chapterBadge'),
    chapterTitle:    $('#chapterTitle'),
    chapterBody:     $('#chapterBody'),
    topbarTitle:     $('#topbarChapterTitle'),
    prevChapter:     $('#prevChapter'),
    nextChapter:     $('#nextChapter'),
    prevTitle:       $('#prevChapterTitle'),
    nextTitle:       $('#nextChapterTitle'),
    scrollTopBtn:    $('#scrollTopBtn'),
    themeSwitcher:   $('#themeSwitcher'),
    fontSizeBtn:     $('#fontSizeBtn'),
    fontSizePopup:   $('#fontSizePopup'),
    fontSizeSlider:  $('#fontSizeSlider'),
    fontSizeValue:   $('#fontSizeValue'),
    progressFill:    $('#progressFill'),
    progressPercent: $('#progressPercent'),
    topicGroups:     $('#topicGroups'),
    statChapters:    $('#statChapters'),
};


// ===== State =====
let currentChapterIndex = -1;
let readChapters = new Set(JSON.parse(localStorage.getItem('awsNotesRead') || '[]'));
let isMobile = window.innerWidth <= 900;


// ===== Initialize =====
async function init() {
    loadTheme();
    loadFontSize();

    // Load chapters dynamically from catalog.md
    await loadCatalog();

    renderSidebar();
    renderWelcome();
    bindEvents();
    updateProgress();
    checkHashRoute();
}


// ===== Markdown Parser (Block-based) =====
function parseMarkdown(md) {
    // Normalize line endings
    md = md.replace(/\r\n/g, '\n');

    // Extract fenced code blocks first to protect them from other parsing
    const codeBlocks = [];
    md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        const escapedCode = escapeHtml(code.trimEnd());
        const langLabel = lang || 'text';
        codeBlocks.push(`<pre><div class="code-header"><span class="code-lang">${langLabel}</span><button class="code-copy-btn" aria-label="Copy code">Copy</button></div><code>${escapedCode}</code></pre>`);
        return `\n%%CODEBLOCK_${idx}%%\n`;
    });

    // Extract markdown tables before preprocessing to protect them
    const tablePlaceholders = [];
    md = md.replace(/(\|.+\|\n)(\|[\s:|-]+\|\n)((?:\|.+\|\n?)+)/g, (match, headerLine, sepLine, bodyLines) => {
        const idx = tablePlaceholders.length;
        const headerCells = headerLine.trim().split('|').filter(c => c.trim()).map(c => `<th>${inlineMarkdown(c.trim())}</th>`).join('');
        const bodyRows = bodyLines.trim().split('\n').map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${inlineMarkdown(c.trim())}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        tablePlaceholders.push(`<div class="table-container"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`);
        return `\n%%TABLE_${idx}%%\n`;
    });

    // Pre-process: Ensure structural elements get their own blocks
    md = md.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');           // Before headings
    md = md.replace(/([^\n])\n(---+)\n/g, '$1\n\n$2\n');            // Before HRs
    md = md.replace(/([^\n])\n(>\s)/g, '$1\n\n$2');                  // Before blockquotes
    md = md.replace(/([^\n])\n(%%CODEBLOCK_)/g, '$1\n\n$2');        // Before code placeholders
    md = md.replace(/(%%CODEBLOCK_\d+%%)\n([^\n])/g, '$1\n\n$2');   // After code placeholders
    md = md.replace(/([^\n\-*+\s].*)\n([-*+]\s)/g, '$1\n\n$2');     // Before list items

    // Split into blocks by double newlines
    const blocks = md.split(/\n{2,}/);
    const outputBlocks = [];

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim();
        if (!block) continue;

        // Code block placeholder
        const codeMatch = block.match(/^%%CODEBLOCK_(\d+)%%$/);
        if (codeMatch) {
            outputBlocks.push(codeBlocks[parseInt(codeMatch[1])]);
            continue;
        }

        // Table placeholder
        const tableMatch = block.match(/^%%TABLE_(\d+)%%$/);
        if (tableMatch) {
            outputBlocks.push(tablePlaceholders[parseInt(tableMatch[1])]);
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(block)) {
            outputBlocks.push('<hr>');
            continue;
        }

        // Heading (single-line)
        const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            outputBlocks.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
            continue;
        }

        // Table (fallback detection)
        if (/^\|.+\|/.test(block)) {
            const lines = block.split('\n').filter(l => l.trim());
            if (lines.length >= 2 && /^\|[\s:|-]+\|$/.test(lines[1].trim())) {
                const headerCells = lines[0].split('|').filter(c => c.trim()).map(c => `<th>${inlineMarkdown(c.trim())}</th>`).join('');
                const bodyRows = lines.slice(2).map(row => {
                    const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${inlineMarkdown(c.trim())}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');
                outputBlocks.push(`<div class="table-container"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`);
                continue;
            }
        }

        // Blockquote
        if (/^>/.test(block)) {
            const content = block.replace(/^>\s?/gm, '').trim();
            outputBlocks.push(`<blockquote><p>${inlineMarkdown(content)}</p></blockquote>`);
            continue;
        }

        // Unordered list (all lines start with - or * or +)
        if (/^[\s]*[-*+]\s/m.test(block) && block.split('\n').every(l => /^[\s]*[-*+]\s/.test(l) || !l.trim())) {
            const items = block.split('\n').filter(l => l.trim()).map(line => {
                const content = line.replace(/^[\s]*[-*+]\s/, '');
                return `<li>${inlineMarkdown(content)}</li>`;
            }).join('');
            outputBlocks.push(`<ul>${items}</ul>`);
            continue;
        }

        // Ordered list (all lines start with digits)
        if (/^\d+\.\s/.test(block) && block.split('\n').every(l => /^\d+\.\s/.test(l) || !l.trim())) {
            const items = block.split('\n').filter(l => l.trim()).map(line => {
                const content = line.replace(/^\d+\.\s/, '');
                return `<li>${inlineMarkdown(content)}</li>`;
            }).join('');
            outputBlocks.push(`<ol>${items}</ol>`);
            continue;
        }

        // Multi-line block containing code/table placeholders mixed with text
        if (block.includes('%%CODEBLOCK_') || block.includes('%%TABLE_')) {
            const parts = block.split(/(%%(?:CODEBLOCK|TABLE)_\d+%%)/);
            for (const part of parts) {
                const cm = part.match(/^%%CODEBLOCK_(\d+)%%$/);
                const tm = part.match(/^%%TABLE_(\d+)%%$/);
                if (cm) {
                    outputBlocks.push(codeBlocks[parseInt(cm[1])]);
                } else if (tm) {
                    outputBlocks.push(tablePlaceholders[parseInt(tm[1])]);
                } else if (part.trim()) {
                    outputBlocks.push(`<p>${inlineMarkdown(part.trim())}</p>`);
                }
            }
            continue;
        }

        // Mixed block: contains headings, lists, and text on separate lines
        const lines = block.split('\n');
        let hasMixedContent = lines.some(l => /^#{1,6}\s/.test(l)) ||
                              (lines.some(l => /^[-*+]\s/.test(l)) && lines.some(l => !/^[-*+]\s/.test(l) && l.trim()));

        if (hasMixedContent) {
            parseMixedBlock(lines, outputBlocks);
            continue;
        }

        // Default: paragraph (may contain multiple lines)
        const paragraphContent = lines.map(l => inlineMarkdown(l)).join('<br>');
        outputBlocks.push(`<p>${paragraphContent}</p>`);
    }

    return outputBlocks.join('\n');
}

// Sub-parser for blocks that contain a mix of headings, lists, and paragraph text
function parseMixedBlock(lines, outputBlocks) {
    let currentList = [];
    let currentParagraph = [];

    function flushList() {
        if (currentList.length > 0) {
            const items = currentList.map(l => `<li>${inlineMarkdown(l)}</li>`).join('');
            outputBlocks.push(`<ul>${items}</ul>`);
            currentList = [];
        }
    }

    function flushParagraph() {
        if (currentParagraph.length > 0) {
            const content = currentParagraph.map(l => inlineMarkdown(l)).join('<br>');
            outputBlocks.push(`<p>${content}</p>`);
            currentParagraph = [];
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            flushParagraph();
            continue;
        }

        // Heading
        const hMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (hMatch) {
            flushList();
            flushParagraph();
            const level = hMatch[1].length;
            outputBlocks.push(`<h${level}>${inlineMarkdown(hMatch[2])}</h${level}>`);
            continue;
        }

        // HR
        if (/^---+$/.test(trimmed)) {
            flushList();
            flushParagraph();
            outputBlocks.push('<hr>');
            continue;
        }

        // List item
        if (/^[-*+]\s/.test(trimmed)) {
            flushParagraph();
            currentList.push(trimmed.replace(/^[-*+]\s/, ''));
            continue;
        }

        // Regular text
        flushList();
        currentParagraph.push(trimmed);
    }

    flushList();
    flushParagraph();
}

function inlineMarkdown(text) {
    // Checkboxes (e.g. - [ ] or - [x])
    text = text.replace(/^\[ \] /g, '<input type="checkbox" disabled class="markdown-checkbox"> ')
               .replace(/^\[x\] /g, '<input type="checkbox" checked disabled class="markdown-checkbox"> ');

    // Bold + italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code (must not be inside a pre block)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Images: ![alt](src)
    text = text.replace(/!\[([^\]]*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="markdown-img" loading="lazy">');
    // Links: [text](href)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Line breaks
    text = text.replace(/  \n/g, '<br>');
    return text;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}


// ===== Copy Code Utility (Event Delegation) =====
// Uses DOM traversal — no IDs needed, works with any dynamically generated code block
function initCopyButtons() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.code-copy-btn');
        if (!btn) return;

        // Find the <code> element inside the same <pre> block
        const pre = btn.closest('pre');
        if (!pre) return;
        const codeEl = pre.querySelector('code');
        if (!codeEl) return;

        // Get the full text content (textContent auto-decodes HTML entities)
        const text = codeEl.textContent;

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showCopied(btn);
        }).catch(() => {
            // Fallback for non-HTTPS contexts
            const area = document.createElement('textarea');
            area.value = text;
            area.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
            document.body.appendChild(area);
            area.select();
            try { document.execCommand('copy'); } catch(_) {}
            document.body.removeChild(area);
            showCopied(btn);
        });
    });
}

function showCopied(btn) {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
    }, 2000);
}


// ===== Sidebar Rendering =====
function renderSidebar(filter = '') {
    const list = dom.chapterList;
    const query = filter.toLowerCase();
    const filtered = CHAPTERS.filter(ch =>
        ch.title.toLowerCase().includes(query) ||
        ch.category.toLowerCase().includes(query) ||
        String(ch.num).includes(query)
    );

    if (filtered.length === 0) {
        list.innerHTML = `<div class="no-results">
            <span class="no-results-icon">🔍</span>
            <span class="no-results-text">No chapters found</span>
        </div>`;
    } else {
        list.innerHTML = filtered.map((ch, i) => {
            const realIndex = CHAPTERS.indexOf(ch);
            const isActive = realIndex === currentChapterIndex;
            const isRead = readChapters.has(ch.num);
            return `<div class="chapter-item ${isActive ? 'active' : ''} ${isRead ? 'read' : ''}"
                         data-index="${realIndex}"
                         role="button"
                         tabindex="0"
                         aria-label="Chapter ${ch.num}: ${ch.title}">
                <div class="chapter-number"><span>${ch.num}</span></div>
                <div class="chapter-item-info">
                    <div class="chapter-item-title">${ch.title}</div>
                    <div class="chapter-item-category">${ch.category}</div>
                </div>
            </div>`;
        }).join('');
    }

    dom.chapterCount.textContent = `${CHAPTERS.length} chapters`;
}


// ===== Welcome Screen =====
function renderWelcome() {
    dom.statChapters.textContent = CHAPTERS.length;
    $('#statTopics').textContent = TOPIC_GROUPS.length;
    $('#statHands').textContent = CHAPTERS.length;  // All chapters are hands-on labs

    dom.topicGroups.innerHTML = TOPIC_GROUPS.map(g => {
        const count = CHAPTERS.filter(ch => ch.category === g.filter).length;
        return `<div class="topic-group-card" data-filter="${g.filter}">
            <span class="topic-group-icon">${g.icon}</span>
            <div class="topic-group-title">${g.name}</div>
            <div class="topic-group-count">${count} chapters — ${g.desc}</div>
        </div>`;
    }).join('');
}


// ===== Load Chapter =====
async function loadChapter(index) {
    if (index < 0 || index >= CHAPTERS.length) return;

    const ch = CHAPTERS[index];
    currentChapterIndex = index;

    // Update URL hash
    window.location.hash = `ch-${ch.num}`;

    // Show loading state
    dom.welcomeScreen.style.display = 'none';
    dom.chapterContent.style.display = 'block';
    dom.chapterBody.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 40px;">Loading chapter...</p>';
    dom.chapterBadge.textContent = `Chapter ${ch.num} · ${ch.category}`;
    dom.chapterTitle.textContent = ch.title;
    dom.topbarTitle.textContent = `Ch. ${ch.num} — ${ch.title}`;
    dom.topbarTitle.classList.add('visible');

    // Mark active in sidebar
    renderSidebar(dom.chapterSearch.value);

    // Update nav buttons
    updateChapterNav();

    // Fetch markdown
    try {
        const res = await fetch(ch.file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let md = await res.text();

        // Remove the first H1 (title line) since we display it separately
        md = md.replace(/^# .+\n?/, '');

        dom.chapterBody.innerHTML = parseMarkdown(md);
        dom.chapterContent.style.animation = 'none';
        void dom.chapterContent.offsetHeight;
        dom.chapterContent.style.animation = 'fadeInUp 0.35s ease';
    } catch (err) {
        dom.chapterBody.innerHTML = `<p style="color: var(--accent-danger); text-align: center; padding: 40px;">
            ❌ Failed to load chapter. Make sure files are served via a web server (not file://).
            <br><small style="color: var(--text-tertiary); margin-top:8px; display:block;">${err.message}</small>
        </p>`;
    }

    // Mark as read
    readChapters.add(ch.num);
    localStorage.setItem('awsNotesRead', JSON.stringify([...readChapters]));
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Close sidebar on mobile
    if (isMobile) closeSidebar();
}


// ===== Chapter Nav (Prev/Next) =====
function updateChapterNav() {
    const prevIdx = currentChapterIndex - 1;
    const nextIdx = currentChapterIndex + 1;

    dom.prevChapter.disabled = prevIdx < 0;
    dom.nextChapter.disabled = nextIdx >= CHAPTERS.length;

    dom.prevTitle.textContent = prevIdx >= 0 ? CHAPTERS[prevIdx].title : '';
    dom.nextTitle.textContent = nextIdx < CHAPTERS.length ? CHAPTERS[nextIdx].title : '';
}


// ===== Progress =====
function updateProgress() {
    const total = CHAPTERS.length;
    const read = readChapters.size;
    const pct = total > 0 ? Math.round((read / total) * 100) : 0;
    dom.progressFill.style.width = pct + '%';
    dom.progressPercent.textContent = pct + '%';
}


// ===== Theme =====
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('awsNotesTheme', theme);

    dom.themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function loadTheme() {
    const saved = localStorage.getItem('awsNotesTheme') || 'dark';
    setTheme(saved);
}


// ===== Font Size =====
function setFontSize(size) {
    document.documentElement.style.setProperty('--font-size-base', size + 'px');
    dom.fontSizeValue.textContent = size + 'px';
    dom.fontSizeSlider.value = size;
    localStorage.setItem('awsNotesFontSize', size);
}

function loadFontSize() {
    const saved = localStorage.getItem('awsNotesFontSize') || 17;
    setFontSize(Number(saved));
}


// ===== Sidebar Toggle =====
function toggleSidebar() {
    if (isMobile) {
        dom.sidebar.classList.toggle('open');
        dom.sidebarOverlay.classList.toggle('visible', dom.sidebar.classList.contains('open'));
    } else {
        dom.sidebar.classList.toggle('collapsed');
    }
}

function closeSidebar() {
    if (isMobile) {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('visible');
    }
}


// ===== Hash Routing =====
function checkHashRoute() {
    const hash = window.location.hash;
    const match = hash.match(/^#ch-(\d+)$/);
    if (match) {
        const num = parseInt(match[1]);
        const idx = CHAPTERS.findIndex(ch => ch.num === num);
        if (idx >= 0) loadChapter(idx);
    }
}


// ===== Scroll-to-Top Visibility =====
function handleScroll() {
    const scrollY = dom.mainContent.scrollTop || window.scrollY;
    dom.scrollTopBtn.classList.toggle('visible', scrollY > 300);
}


// ===== Event Binding =====
function bindEvents() {
    // Sidebar toggle
    dom.sidebarToggle.addEventListener('click', toggleSidebar);
    dom.sidebarOverlay.addEventListener('click', closeSidebar);

    // Chapter click (event delegation)
    dom.chapterList.addEventListener('click', (e) => {
        const item = e.target.closest('.chapter-item');
        if (item) loadChapter(parseInt(item.dataset.index));
    });
    dom.chapterList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const item = e.target.closest('.chapter-item');
            if (item) loadChapter(parseInt(item.dataset.index));
        }
    });

    // Topic group cards on welcome page
    dom.topicGroups.addEventListener('click', (e) => {
        const card = e.target.closest('.topic-group-card');
        if (card) {
            const filter = card.dataset.filter;
            const first = CHAPTERS.findIndex(ch => ch.category === filter);
            if (first >= 0) loadChapter(first);
        }
    });

    // Search
    dom.chapterSearch.addEventListener('input', (e) => {
        renderSidebar(e.target.value);
    });

    // Theme buttons
    dom.themeSwitcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-btn');
        if (btn) setTheme(btn.dataset.theme);
    });

    // Font size
    dom.fontSizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.fontSizePopup.classList.toggle('open');
    });
    dom.fontSizeSlider.addEventListener('input', (e) => {
        setFontSize(parseInt(e.target.value));
    });
    document.addEventListener('click', (e) => {
        if (!dom.fontSizePopup.contains(e.target) && e.target !== dom.fontSizeBtn) {
            dom.fontSizePopup.classList.remove('open');
        }
    });

    // Prev / Next
    dom.prevChapter.addEventListener('click', () => loadChapter(currentChapterIndex - 1));
    dom.nextChapter.addEventListener('click', () => loadChapter(currentChapterIndex + 1));

    // Scroll to top
    dom.scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Scroll listener
    window.addEventListener('scroll', handleScroll);

    // Hash change
    window.addEventListener('hashchange', checkHashRoute);

    // Resize listener
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 900;
        if (wasMobile && !isMobile) {
            dom.sidebar.classList.remove('open', 'collapsed');
            dom.sidebarOverlay.classList.remove('visible');
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
            loadChapter(currentChapterIndex - 1);
        } else if (e.key === 'ArrowRight' && currentChapterIndex < CHAPTERS.length - 1) {
            loadChapter(currentChapterIndex + 1);
        } else if (e.key === 'Escape') {
            closeSidebar();
            dom.fontSizePopup.classList.remove('open');
        }
    });

    // Copy buttons (event delegation — works for all dynamically generated code blocks)
    initCopyButtons();
}


// ===== Start =====
document.addEventListener('DOMContentLoaded', init);
