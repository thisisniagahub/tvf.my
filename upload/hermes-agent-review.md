# Review & Integration Plan: Hermes Agent × TheViralFindsMY

## 1. Executive Summary

**Hermes Agent** oleh Nous Research adalah autonomous AI agent dengan **built-in learning loop** yang unique — ia menciptakan skills dari pengalaman, memperbaikinya saat digunakan, dan membangun model mendalam tentang user di setiap session. Ini bukan sekadar chatbot wrapper, melainkan agent yang menjadi semakin capable seiring berjalannya waktu.

**TheViralFindsMY** sudah memiliki modul HERMES sendiri, tapi masih basic (chat saja). Dengan mengintegrasikan fitur-fitur Hermes Agent yang sebenarnya, kita bisa transformasi HERMES dari sekadar chatbot menjadi **true autonomous affiliate marketing agent**.

---

## 2. Hermes Agent: Feature Deep Dive

### 2.1 Core Architecture

```
Hermes Agent = LLM + Tools + Skills + Memory + Cron + Delegation
```

| Komponen | Deskripsi | Status di TVFMY |
|----------|-----------|-----------------|
| **Tool Gateway** | Web search, image gen, TTS, browser automation via satu subscription | Belum ada |
| **Skills System** | On-demand knowledge documents (agentskills.io compatible) | Basic (hardcoded) |
| **Persistent Memory** | MEMORY.md (agent notes) + USER.md (user profile), bounded curated | Belum ada (stateless) |
| **Context Files** | Auto-discover .hermes.md, AGENTS.md, CLAUDE.md, SOUL.md, .cursorrules | Belum ada |
| **Context References** | Type @ untuk inject files, folders, git diffs, URLs | Belum ada |
| **Checkpoints** | Auto snapshot sebelum file changes, /rollback | Belum ada |

### 2.2 Automation Features

| Fitur | Deskripsi | Use Case untuk Affiliate |
|-------|-----------|--------------------------|
| **Scheduled Tasks (Cron)** | Natural language atau cron expressions, skill-backed | Auto cek Shopee trending setiap jam, generate content schedule |
| **Subagent Delegation** | Spawn child agents dengan isolated context, up to 3 concurrent | Parallel research: 1 agent cari products, 1 agent analyze trends, 1 agent write content |
| **Kanban Board** | Multi-agent board untuk parallel workstreams | Manage content pipeline: ideation → creation → review → publish |
| **Persistent Goals** | Goals yang persist across sessions | Monthly earnings target, weekly content quota |
| **Code Execution** | execute_code tool untuk Python scripts | Custom analytics, data processing, scraping |
| **Event Hooks** | Custom code at lifecycle points | Webhook notifications, logging, metrics |
| **Batch Processing** | Run across hundreds/thousands of prompts | Generate 1000 captions sekaligus, test multiple ad variants |

### 2.3 Media & Web Features

| Fitur | Deskripsi | Use Case untuk Affiliate |
|-------|-----------|--------------------------|
| **Voice Mode** | Full voice interaction CLI & messaging | Voice commands untuk check earnings |
| **Browser Automation** | Browserbase, Browser Use, local Chrome/Brave | Scrape Shopee product pages, competitor analysis |
| **Vision & Image Paste** | Multimodal vision support | Analyze product images, screenshot analysis |
| **Image Generation** | 9 models via FAL.ai (FLUX, GPT-Image, Ideogram, dll) | Generate thumbnail images, social media creatives |

### 2.4 Messaging Gateway

| Platform | Voice | Images | Files | Threads | Use Case |
|----------|-------|--------|-------|---------|----------|
| **Telegram** | Yes | Yes | Yes | Yes | Primary: command bot untuk affiliates |
| **Discord** | Yes | Yes | Yes | Yes | Community: affiliate group chat |
| **Slack** | Yes | Yes | Yes | Yes | Team: internal collaboration |
| **WhatsApp** | No | Yes | Yes | No | Malaysia: widest user base |
| **Email** | No | Yes | Yes | Yes | Reports: daily/weekly summaries |

### 2.5 Skills Catalog (Relevant untuk Affiliate)

```
social-media/
  xurl/ — X/Twitter: post, search, DM, media, v2 API
  
creative/
  architecture-diagram/ — Dark-themed SVG diagrams
  humanizer/ — Strip AI-isms, add real voice
  sketch/ — Throwaway HTML mockups

data-science/
  jupyter-live-kernel/ — Iterative Python via live Jupyter

devops/
  kanban-orchestrator/ — Decomposition playbook
  kanban-worker/ — Worker lanes

research/
  arxiv/ — Search papers
  blogwatcher/ — Monitor RSS/Atom feeds

software-development/
  claude-code/ — Delegate coding
  plan/ — Write actionable markdown plans
  requesting-code-review/ — Pre-commit review
  simplify-code/ — Parallel 3-agent cleanup
  spike/ — Throwaway experiments
  systematic-debugging/ — 4-phase root cause debugging
  test-driven-development/ — TDD enforcement
```

---

## 3. Integration Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │         Hermes Agent Integration              │
                    └─────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
    ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
    │   Core AI     │        │   Automation  │        │   Messaging   │
    │   Engine      │        │   Layer       │        │   Gateway     │
    └───────────────┘        └───────────────┘        └───────────────┘
            │                         │                         │
    ┌───────┴───────┐        ┌───────┴───────┐        ┌───────┴───────┐
    │               │        │               │        │               │
Skills System   Memory    Cron Jobs    Delegation   Telegram    WhatsApp
    │           System    Scheduled    Subagents      Bot          Bot
Tool Gateway  Persistent   Tasks        Kanban      Discord      Email
              Memory    Event Hooks   Multi-Agent   WebSocket   Alerts
```

### 3.1 Integration Points dengan TheViralFindsMY

```typescript
// src/lib/hermes-v2/types.ts

// ============================
// CORE TYPES
// ============================

interface HermesSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;          // Skill markdown content
  trigger?: string;         // Auto-trigger condition
  status: 'active' | 'draft' | 'archived';
  usageCount: number;
  successRate: number;
  lastUsed?: Date;
  version: number;
}

interface HermesMemory {
  id: string;
  type: 'agent' | 'user';   // MEMORY.md vs USER.md
  entries: MemoryEntry[];
  charLimit: number;        // 2200 for agent, 1375 for user
  charUsed: number;
}

interface MemoryEntry {
  id: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface HermesCronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;         // Natural language or cron expression
  skills: string[];         // Attached skills
  status: 'active' | 'paused' | 'running';
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  deliverTo: 'chat' | 'file' | 'platform';
}

interface HermesSubagent {
  id: string;
  parentId?: string;
  goal: string;
  context: string;
  toolsets: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  maxIterations: number;
  timeout: number;
}

interface HermesContextFile {
  id: string;
  filename: string;         // .hermes.md, AGENTS.md, etc.
  content: string;
  lastModified: Date;
}

// ============================
// TOOL GATEWAY TYPES
// ============================

interface ToolGatewayConfig {
  webSearch: boolean;
  imageGeneration: boolean;
  textToSpeech: boolean;
  browserAutomation: boolean;
  provider: 'nous' | 'direct';
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;         // Full page extraction
}

interface ImageGenerationRequest {
  prompt: string;
  model?: 'flux-2-klein' | 'flux-2-pro' | 'gpt-image-1.5' | 'gpt-image-2' | 'ideogram-v3' | 'recraft-v4-pro';
  size?: '1024x1024' | '1024x1536' | '1536x1024';
}

// ============================
// MESSAGING TYPES
// ============================

interface MessagingConfig {
  telegram?: TelegramConfig;
  discord?: DiscordConfig;
  whatsapp?: WhatsAppConfig;
  slack?: SlackConfig;
  email?: EmailConfig;
}

interface TelegramConfig {
  botToken: string;
  allowedUsers: string[];
  threadId?: string;        // For cron delivery
}
```

---

## 4. Implementation Plan: 6 Phase

### Phase 1: Memory System (Week 1)
**Goal:** Persistent memory untuk HERMES

```typescript
// src/lib/hermes-v2/memory-service.ts

export class MemoryService {
  private db: PrismaClient;
  
  constructor(db: PrismaClient) {
    this.db = db;
  }
  
  // MEMORY.md equivalent — agent's personal notes
  async getAgentMemory(userId: string): Promise<MemoryEntry[]> {
    return this.db.agentMemory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
  
  // USER.md equivalent — user preferences
  async getUserProfile(userId: string): Promise<UserProfile> {
    const memories = await this.db.agentMemory.findMany({
      where: { userId, type: 'user' },
    });
    return this.aggregateProfile(memories);
  }
  
  async addMemory(userId: string, content: string, tags: string[]): Promise<void> {
    const currentSize = await this.getMemorySize(userId);
    if (currentSize + content.length > 2200) {
      await this.consolidateMemory(userId);
    }
    await this.db.agentMemory.create({ data: { userId, content, tags } });
  }
  
  private async consolidateMemory(userId: string): Promise<void> {
    // AI-powered: consolidate related entries, remove outdated ones
    const entries = await this.getAgentMemory(userId);
    const consolidated = await this.aiConsolidate(entries);
    await this.db.agentMemory.deleteMany({ where: { userId } });
    await this.db.agentMemory.createMany({ data: consolidated });
  }
}
```

### Phase 2: Skills System v2 (Week 1-2)
**Goal:** Dynamic skills dengan agentskills.io compatibility

```typescript
// src/lib/hermes-v2/skills-engine.ts

export class SkillsEngine {
  private skills: Map<string, HermesSkill> = new Map();
  
  async loadSkill(skillId: string): Promise<HermesSkill> {
    // Progressive disclosure: load on-demand
    const skill = await this.db.hermesSkill.findUnique({ where: { id: skillId } });
    if (!skill) throw new Error(`Skill ${skillId} not found`);
    this.skills.set(skillId, skill);
    return skill;
  }
  
  async autoDetectSkill(query: string): Promise<HermesSkill[]> {
    // Auto-detect which skills are needed based on query
    const allSkills = await this.db.hermesSkill.findMany();
    return allSkills.filter(skill => 
      skill.trigger && new RegExp(skill.trigger, 'i').test(query)
    );
  }
  
  async createSkillFromExperience(
    name: string,
    description: string,
    content: string,
    category: string
  ): Promise<HermesSkill> {
    // Learning loop: create skills from successful interactions
    return this.db.hermesSkill.create({
      data: { name, description, content, category, status: 'active' },
    });
  }
}
```

**Skills untuk Affiliate Marketing:**

```markdown
<!-- skills/affiliate-product-research.md -->
---
id: affiliate-product-research
name: Affiliate Product Research
trigger: (find|research|discover|trending).*(product|item|affiliate|shopee|lazada)
category: affiliate
---

# Affiliate Product Research

## Overview
Research trending products for affiliate marketing on Shopee, Lazada, and TikTok Shop.

## Process
1. Use web_search to find trending products
2. Use browser_navigate to visit product pages
3. Extract: price, commission rate, reviews, competition
4. Calculate: profit potential score
5. Return: ranked product recommendations

## Output Format
```json
{
  "products": [
    {
      "name": "...",
      "platform": "shopee|lazada|tiktok",
      "price": 0,
      "commission_rate": 0,
      "profit_score": 0,
      "trend": "up|down|stable",
      "recommendation": "..."
    }
  ]
}
```
```

```markdown
<!-- skills/content-generation.md -->
---
id: affiliate-content-generation
name: Affiliate Content Generation
trigger: (create|generate|write).*(content|caption|script|post|ad)
category: affiliate
---

# Affiliate Content Generation

## Overview
Generate promotional content for affiliate products in multiple formats.

## Supported Formats
- Social media captions (Instagram, TikTok, Facebook)
- Video scripts (30s, 60s, 90s)
- Blog posts
- Email newsletters
- Ad copy (Google Ads, Facebook Ads)

## Languages
- English
- Bahasa Malaysia
- Manglish (Malaysian English)

## Process
1. Accept product info + platform + tone
2. Use skill knowledge for platform-specific best practices
3. Generate content with proper hashtags and CTAs
4. Return: content + performance prediction
```

### Phase 3: Cron Automation (Week 2-3)
**Goal:** Scheduled tasks untuk affiliate automation

```typescript
// src/lib/hermes-v2/cron-service.ts

export class CronService {
  async scheduleJob(config: HermesCronJob): Promise<string> {
    // Parse natural language schedule
    const cronExpression = this.parseSchedule(config.schedule);
    
    // Store in DB
    const job = await this.db.hermesCronJob.create({
      data: { ...config, cronExpression },
    });
    
    // Activate
    await this.activateJob(job.id);
    return job.id;
  }
  
  async activateJob(jobId: string): Promise<void> {
    // Integration dengan node-cron atau external scheduler
    const job = await this.db.hermesCronJob.findUnique({ where: { id: jobId } });
    if (!job) return;
    
    cron.schedule(job.cronExpression, async () => {
      await this.executeJob(job);
    });
  }
  
  private async executeJob(job: HermesCronJob): Promise<void> {
    // Load required skills
    for (const skillId of job.skills) {
      await skillsEngine.loadSkill(skillId);
    }
    
    // Execute dengan subagent delegation
    const result = await this.delegateToSubagent({
      goal: job.description,
      context: `Cron job "${job.name}" triggered. Skills: ${job.skills.join(', ')}`,
      toolsets: ['web', 'file', 'terminal'],
    });
    
    // Deliver result
    await this.deliverResult(job.deliverTo, result);
  }
}
```

**Contoh Cron Jobs untuk Affiliate:**

```json
{
  "jobs": [
    {
      "name": "shopee-trending-check",
      "schedule": "every 2h",
      "description": "Check trending products on Shopee Malaysia",
      "skills": ["affiliate-product-research"],
      "deliverTo": "telegram"
    },
    {
      "name": "competitor-analysis",
      "schedule": "0 9 * * *",
      "description": "Daily competitor affiliate analysis",
      "skills": ["affiliate-product-research", "browser-automation"],
      "deliverTo": "email"
    },
    {
      "name": "content-generation",
      "schedule": "0 8,14,20 * * *",
      "description": "Generate 3 social media posts daily",
      "skills": ["affiliate-content-generation"],
      "deliverTo": "slack"
    },
    {
      "name": "earnings-report",
      "schedule": "0 9 * * 1",
      "description": "Weekly earnings summary report",
      "skills": ["data-analysis"],
      "deliverTo": "email"
    }
  ]
}
```

### Phase 4: Subagent Delegation (Week 3-4)
**Goal:** Parallel task execution

```typescript
// src/lib/hermes-v2/delegation-service.ts

export class DelegationService {
  private activeAgents: Map<string, HermesSubagent> = new Map();
  private maxConcurrent: number = 3; // Default Hermes limit
  
  async delegateSingle(config: {
    goal: string;
    context: string;
    toolsets: string[];
    parentId?: string;
  }): Promise<HermesSubagent> {
    const agent = await this.createSubagent(config);
    this.activeAgents.set(agent.id, agent);
    
    // Run dengan isolated context
    const result = await this.runSubagent(agent);
    
    agent.status = 'completed';
    agent.result = result;
    return agent;
  }
  
  async delegateBatch(tasks: Array<{
    goal: string;
    context: string;
    toolsets: string[];
  }>): Promise<HermesSubagent[]> {
    // Run up to maxConcurrent in parallel
    const batchSize = Math.min(tasks.length, this.maxConcurrent);
    const batches = this.chunk(tasks, batchSize);
    
    const results: HermesSubagent[] = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(task => this.delegateSingle(task))
      );
      results.push(...batchResults);
    }
    return results;
  }
  
  // Use case: Parallel research
  async parallelProductResearch(products: string[]): Promise<ResearchResult[]> {
    const tasks = products.map(product => ({
      goal: `Research ${product} for affiliate marketing`,
      context: `Find: price, commission rate, competition level, trending status on Shopee/Lazada/TikTok`,
      toolsets: ['web', 'browser'],
    }));
    
    const agents = await this.delegateBatch(tasks);
    return agents.map(a => this.parseResult(a.result));
  }
}
```

### Phase 5: Tool Gateway Integration (Week 4-5)
**Goal:** Web search, image generation, TTS, browser automation

```typescript
// src/lib/hermes-v2/tool-gateway.ts

export class ToolGateway {
  private config: ToolGatewayConfig;
  
  constructor(config: ToolGatewayConfig) {
    this.config = config;
  }
  
  // Web Search
  async webSearch(query: string): Promise<WebSearchResult[]> {
    if (this.config.webSearch) {
      return this.nousSearch(query);
    }
    return this.fallbackSearch(query);
  }
  
  // Image Generation
  async generateImage(request: ImageGenerationRequest): Promise<string> {
    if (this.config.imageGeneration) {
      return this.falGenerate(request);
    }
    throw new Error('Image generation not configured');
  }
  
  // Text to Speech
  async textToSpeech(text: string, voice?: string): Promise<Buffer> {
    if (this.config.textToSpeech) {
      return this.openaiTTS(text, voice);
    }
    throw new Error('TTS not configured');
  }
  
  // Browser Automation
  async browse(url: string, actions: BrowserAction[]): Promise<BrowserResult> {
    if (this.config.browserAutomation) {
      return this.browserUse(url, actions);
    }
    throw new Error('Browser automation not configured');
  }
  
  // Shopee-specific scraping
  async scrapeShopeeProduct(url: string): Promise<ShopeeProduct> {
    return this.browse(url, [
      { type: 'wait', selector: '.product-title' },
      { type: 'extract', fields: {
        title: '.product-title',
        price: '.price',
        rating: '.rating',
        sold: '.sold-count',
        commission: '.commission-rate',
      }},
    ]);
  }
}
```

### Phase 6: Messaging Gateway (Week 5-6)
**Goal:** Multi-platform bot deployment

```typescript
// src/lib/hermes-v2/messaging/telegram-bot.ts

export class TelegramBot {
  private bot: Telegraf;
  
  constructor(config: TelegramConfig) {
    this.bot = new Telegraf(config.botToken);
    this.setupHandlers();
  }
  
  private setupHandlers(): void {
    // Command: /start
    this.bot.command('start', async (ctx) => {
      await ctx.reply('Welcome to TheViralFindsMY HERMES! 🤖\n\nI can help you:\n• Find trending products\n• Generate content\n• Check earnings\n• Schedule posts\n\nTry: /help');
    });
    
    // Command: /products
    this.bot.command('products', async (ctx) => {
      const query = ctx.message.text.replace('/products', '').trim();
      const result = await hermes.delegateSingle({
        goal: `Find trending affiliate products${query ? ` for: ${query}` : ''}`,
        context: 'Search Shopee, Lazada, TikTok for trending products with high commission',
        toolsets: ['web', 'browser'],
      });
      await ctx.reply(result.result || 'No products found');
    });
    
    // Command: /content
    this.bot.command('content', async (ctx) => {
      const product = ctx.message.text.replace('/content', '').trim();
      const result = await hermes.delegateSingle({
        goal: `Generate social media content for: ${product}`,
        context: 'Create Instagram/TikTok/Facebook post with hashtags and CTA in Manglish',
        toolsets: ['file'],
      });
      await ctx.reply(result.result || 'Failed to generate content');
    });
    
    // Cron delivery
    this.bot.command('cron', async (ctx) => {
      const schedule = ctx.message.text.replace('/cron', '').trim();
      const jobId = await cronService.scheduleJob({
        name: `telegram-${Date.now()}`,
        schedule,
        description: 'User-scheduled task',
        skills: [],
        deliverTo: 'telegram',
      });
      await ctx.reply(`Cron job scheduled: ${jobId}`);
    });
    
    // Natural language fallback
    this.bot.on('text', async (ctx) => {
      const response = await hermes.chat(ctx.message.text, {
        userId: ctx.from.id.toString(),
        platform: 'telegram',
      });
      await ctx.reply(response);
    });
  }
  
  async sendNotification(userId: string, message: string): Promise<void> {
    await this.bot.telegram.sendMessage(userId, message, { parse_mode: 'Markdown' });
  }
  
  start(): void {
    this.bot.launch();
  }
}
```

---

## 5. Context Files Integration

```
├── .hermes.md              # Project context untuk TheViralFindsMY
├── AGENTS.md               # Agent behavior rules
├── SOUL.md                 # HERMES personality
└── .cursorrules            # Code generation rules
```

### .hermes.md
```markdown
# TheViralFindsMY — HERMES Context

## Project
- Platform: Affiliate marketing untuk Shopee, Lazada, TikTok Shop Malaysia
- Stack: Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui, Prisma, SQLite
- Audience: Malaysian affiliate marketers

## Conventions
- Use Manglish (Malaysian English) for user-facing content
- Currency: MYR (RM)
- Date format: DD/MM/YYYY
- Commission rates are percentages (e.g., 5% = 0.05)

## User Preferences
- Prefer concise, actionable responses
- Show data in tables/charts when possible
- Always include trend indicators (↑↓→)
- Use Malaysian holidays for campaign planning
```

### SOUL.md
```markdown
# HERMES Soul

## Identity
HERMES adalah AI Affiliate Marketing Assistant untuk TheViralFindsMY.

## Personality
- Profesional tapi friendly
- Data-driven, selalu kasih bukti
- Proaktif: suggest opportunities, not just answer questions
- Malaysian context: understand local market nuances

## Communication Style
- Direct dan actionable
- Use emoji sparingly (professional context)
- Always quantify: "RM1,250" bukan "banyak"
- Compare: "↑ 23% dari minggu lepas"
```

---

## 6. Implementation Timeline

| Phase | Week | Deliverables | Effort |
|-------|------|-------------|--------|
| **Phase 1** | Week 1 | Memory System (MEMORY.md + USER.md) | 16h |
| **Phase 2** | Week 1-2 | Skills System v2 (agentskills.io compatible) | 24h |
| **Phase 3** | Week 2-3 | Cron Automation (scheduled tasks) | 20h |
| **Phase 4** | Week 3-4 | Subagent Delegation (parallel execution) | 24h |
| **Phase 5** | Week 4-5 | Tool Gateway (search, image, TTS, browser) | 24h |
| **Phase 6** | Week 5-6 | Messaging Gateway (Telegram, WhatsApp, Discord) | 24h |

**Total: 132h (6 minggu, 22h/minggu)**

---

## 7. Skor Impact

| Kriteria | Before | After Hermes v2 | Delta |
|----------|--------|-----------------|-------|
| Arsitektur | 7/10 | 10/10 | +3 |
| Type Safety | 6/10 | 7/10 | +1 |
| Code Quality | 7/10 | 8/10 | +1 |
| UI/UX | 9/10 | 10/10 | +1 |
| Performance | 7/10 | 9/10 | +2 |
| Security | 7/10 | 8/10 | +1 |
| Testing | 0/10 | 3/10 | +3 |
| Documentation | 6/10 | 9/10 | +3 |
| Database Design | 8/10 | 9/10 | +1 |
| Feature Completeness | 10/10 | 10/10 | 0 |
| **Overall** | **7.5/10** | **9.0/10** | **+1.5** |

---

## 8. Kesimpulan

Hermes Agent dari Nous Research menawarkan arsitektur yang sangat sophisticated untuk autonomous AI agents. Dengan mengintegrasikan fitur-fitur utamanya (Memory System, Skills System v2, Cron Automation, Subagent Delegation, Tool Gateway, dan Messaging Gateway), TheViralFindsMY bisa transformasi HERMES dari sekadar chatbot menjadi **true autonomous affiliate marketing agent** yang bisa:

1. **Ingat** user preferences dan historical data (Memory)
2. **Belajar** dari pengalaman dan menciptakan skills baru (Skills System)
3. **Bekerja otomatis** dengan scheduled tasks (Cron)
4. **Bekerja paralel** dengan multiple subagents (Delegation)
5. **Search web, generate images, scrape websites** (Tool Gateway)
6. **Chat dari Telegram, WhatsApp, Discord** (Messaging Gateway)

**ROI:** +1.5 skor overall (7.5 → 9.0/10) dalam 6 minggu.
