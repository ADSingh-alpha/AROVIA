// ============================================================
//  AROVIA — Mock Data & Types
// ============================================================

export type Role = "founder" | "investor" | "admin";

export type Startup = {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  stage: "Pre-Seed" | "Seed" | "Series A" | "Series B";
  ask: number;        // USD
  equity: number;     // %
  raised: number;     // USD so far this session
  valuation: number;  // USD
  traction: string;
  status: "live" | "review" | "closed" | "upcoming";
  founder: string;
  avatar: string;
  color: string;
  viewers: number;
  metrics: { month: string; revenue: number; users: number }[];
};

export type ChatMessage = {
  id: string;
  sender: string;
  role: Role;
  text: string;
  ts: number;
};

export type Offer = {
  id: string;
  investor: string;
  amount: number;
  equity: number;
  ts: number;
  status: "pending" | "accepted" | "rejected";
};

export type PortfolioCompany = {
  id: string;
  name: string;
  industry: string;
  invested: number;
  equity: number;
  currentVal: number;
  stage: string;
  color: string;
};

export type Document = {
  id: string;
  name: string;
  type: "pitch-deck" | "financial-model" | "cap-table" | "credential";
  size: string;
  uploadedAt: string;
  status: "verified" | "pending" | "rejected";
};

// ------------------------------------------------------------------
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];

export const STARTUPS: Startup[] = [
  {
    id: "neuropay",
    name: "NeuroPay",
    tagline: "AI-native payment infrastructure for the next billion users",
    industry: "FinTech",
    stage: "Seed",
    ask: 500_000,
    equity: 8,
    raised: 320_000,
    valuation: 6_250_000,
    traction: "42K MAU · $1.2M ARR · 3x YoY",
    status: "live",
    founder: "Priya Mehta",
    avatar: "PM",
    color: "#8338ec",
    viewers: 214,
    metrics: months.map((m, i) => ({ month: m, revenue: 40000 + i * 18000, users: 8000 + i * 4200 })),
  },
  {
    id: "greenstack",
    name: "GreenStack",
    tagline: "Carbon credit tokenization on zero-knowledge rails",
    industry: "CleanTech",
    stage: "Pre-Seed",
    ask: 1_200_000,
    equity: 12,
    raised: 450_000,
    valuation: 10_000_000,
    traction: "14 enterprise pilots · 18K tonnes CO₂ offset",
    status: "live",
    founder: "Arjun Sharma",
    avatar: "AS",
    color: "#06d6a0",
    viewers: 187,
    metrics: months.map((m, i) => ({ month: m, revenue: 20000 + i * 12000, users: 2000 + i * 800 })),
  },
  {
    id: "cognify",
    name: "Cognify",
    tagline: "Real-time LLM orchestration for enterprise workflows",
    industry: "AI / ML",
    stage: "Series A",
    ask: 800_000,
    equity: 6,
    raised: 800_000,
    valuation: 13_333_333,
    traction: "120 enterprise clients · $4.8M ARR",
    status: "closed",
    founder: "Leila Nasser",
    avatar: "LN",
    color: "#3a86ff",
    viewers: 98,
    metrics: months.map((m, i) => ({ month: m, revenue: 100000 + i * 60000, users: 5000 + i * 2000 })),
  },
  {
    id: "fluxcore",
    name: "FluxCore",
    tagline: "Autonomous robotics middleware for warehouse automation",
    industry: "DeepTech",
    stage: "Series A",
    ask: 2_000_000,
    equity: 10,
    raised: 900_000,
    valuation: 20_000_000,
    traction: "8 pilot deployments · $6.1M pipeline",
    status: "live",
    founder: "Chen Wei",
    avatar: "CW",
    color: "#fb5607",
    viewers: 312,
    metrics: months.map((m, i) => ({ month: m, revenue: 80000 + i * 40000, users: 1000 + i * 300 })),
  },
  {
    id: "medblock",
    name: "MedBlock",
    tagline: "Decentralized medical records with patient-owned keys",
    industry: "HealthTech",
    stage: "Seed",
    ask: 750_000,
    equity: 9,
    raised: 0,
    valuation: 8_333_333,
    traction: "3 hospital MoUs · HIPAA certified",
    status: "upcoming",
    founder: "Sara Johnson",
    avatar: "SJ",
    color: "#ff006e",
    viewers: 0,
    metrics: months.map((m, i) => ({ month: m, revenue: 10000 + i * 8000, users: 500 + i * 200 })),
  },
  {
    id: "quantumsec",
    name: "QuantumSec",
    tagline: "Post-quantum cryptography SDK for financial institutions",
    industry: "CyberSec",
    stage: "Series B",
    ask: 5_000_000,
    equity: 7,
    raised: 2_100_000,
    valuation: 71_428_571,
    traction: "31 bank clients · $18M ARR",
    status: "review",
    founder: "Marcus Bell",
    avatar: "MB",
    color: "#ffbe0b",
    viewers: 54,
    metrics: months.map((m, i) => ({ month: m, revenue: 500000 + i * 200000, users: 15000 + i * 5000 })),
  },
];

export const MOCK_CHAT: ChatMessage[] = [
  { id: "1", sender: "Alex Chen", role: "investor", text: "What's your CAC vs LTV ratio currently?", ts: Date.now() - 240000 },
  { id: "2", sender: "Priya Mehta", role: "founder", text: "CAC is $14, LTV is $420 — 30x ratio. Improving monthly.", ts: Date.now() - 180000 },
  { id: "3", sender: "Sarah Kim", role: "investor", text: "Impressive growth. How defensible is the moat against Stripe?", ts: Date.now() - 120000 },
  { id: "4", sender: "Raj Patel", role: "investor", text: "I'm interested in leading this round. What's the SAFE terms?", ts: Date.now() - 60000 },
  { id: "5", sender: "Moderator", role: "admin", text: "📢 Q&A open for 5 more minutes. Submit offers via the Commitment Panel.", ts: Date.now() - 30000 },
];

export const MOCK_OFFERS: Offer[] = [
  { id: "o1", investor: "Alex Chen", amount: 150_000, equity: 2.4, ts: Date.now() - 90000, status: "pending" },
  { id: "o2", investor: "Sarah Kim", amount: 100_000, equity: 1.6, ts: Date.now() - 45000, status: "pending" },
];

export const PORTFOLIO_COMPANIES: PortfolioCompany[] = [
  { id: "p1", name: "NeuroPay",   industry: "FinTech",   invested: 150_000, equity: 2.4, currentVal: 240_000, stage: "Seed",     color: "#8338ec" },
  { id: "p2", name: "FluxCore",   industry: "DeepTech",  invested: 500_000, equity: 5.0, currentVal: 1_100_000, stage: "Series A", color: "#fb5607" },
  { id: "p3", name: "Cognify",    industry: "AI / ML",   invested: 200_000, equity: 1.5, currentVal: 320_000, stage: "Series A", color: "#3a86ff" },
  { id: "p4", name: "GreenStack", industry: "CleanTech", invested: 80_000,  equity: 0.96, currentVal: 115_000, stage: "Pre-Seed", color: "#06d6a0" },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: "d1", name: "NeuroPay_PitchDeck_v3.pdf",      type: "pitch-deck",      size: "4.2 MB", uploadedAt: "2025-10-20", status: "verified" },
  { id: "d2", name: "Financial_Model_Q4_2025.xlsx",   type: "financial-model", size: "1.8 MB", uploadedAt: "2025-10-21", status: "verified" },
  { id: "d3", name: "Cap_Table_October_2025.xlsx",    type: "cap-table",       size: "0.9 MB", uploadedAt: "2025-10-22", status: "pending" },
  { id: "d4", name: "Team_Credentials_Bundle.zip",   type: "credential",      size: "12.4 MB", uploadedAt: "2025-10-23", status: "verified" },
];
