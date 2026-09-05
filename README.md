Veluno — Agentic Commerce Platform
Veluno is an enterprise-grade, agent-to-agent (A2A) and consumer-facing agentic commerce platform optimized for high-end workspace hardware and precision audio gear. It bridges the gap between autonomous AI buyer bots and human-centric merchant systems through zero-trust architectural security and real-time telemetry.

Key Features
Agent-to-Agent (A2A) Simulation: Programmatic negotiation pathways supporting autonomous bot-to-merchant discovery and automated cart calculations.

UCP / ACP Protocol Compliance: Exposes structured machine-readable catalog endpoints with dynamic query parameter filtering (/api/catalog) for autonomous buyer bots.

Contextual Session-Based Cross-Selling: Tracks past purchases within an active session using persistent memory to inject intelligent ecosystem recommendations (e.g., custom artisan keycaps or cables).

Zero-Trust Ephemeral Checkout: Features a 5-minute cryptographic payment lock, itemized discount and tax audits, and strict authentication guardrails.

Unified Authentication & Profile Management: Secure login and registration modals with profile onboarding (Name, Email, Phone, Avatar) and persistent localStorage synchronization.

Tech Stack
Frontend: React, Tailwind CSS, Lucide React, Vite

Architecture: Component-driven dark editorial aesthetic featuring metallic hardware motifs and zero-trust telemetry panels

├── src/
│   ├── components/       # Core UI components (Navbar, Concierge, Catalog, Security, Cart)
│   ├── api/              # Machine-readable UCP/ACP endpoints & audit logging
│   ├── utils/            # Session storage and cross-persistence logic
│   └── App.tsx           # Main application router and state container

git clone https://github.com/YajurvaMaharana/FlowPay.git

npm install

npm run dev
