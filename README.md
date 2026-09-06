# HireIQ — AI-Powered Recruitment & Statutory Closing Platform

HireIQ is a full-stack, AI-orchestrated applicant tracking and hiring intelligence platform designed for modern engineering teams. It bridges the gap between resume screening, live technical evaluation, and legally compliant statutory offer management under the **Nigerian Labour Act (Cap L1, LFN 2004)** and **Pension Reform Act 2014 (PRA 2014)**.

---

## Key Features

### 1. ATS Workflow & Pipeline Engine
* Strict stage progression: `APPLIED` → `SCREENING` → `ASSESSMENT` → `INTERVIEW` → `OFFER` → `HIRED`.
* Kanban board interface with real-time candidate scorecard modals.
* Stage-gated access ensuring compliant offer documents can only be issued to candidates in the `OFFER` stage.

### 2. AI CV Intelligence & Anti-Inflation Detection
* Automated resume matching against discrete, structured `JobRequirement` criteria.
* Metric inflation detection (identifying suspicious seniority claims, team sizes, and impact metrics).
* Grounded probing questions auto-generated for technical interview loops.

### 3. Technical Assessment & Live Studio
* In-browser sandboxed coding assessment suite evaluating correctness, algorithmic time complexity ($O(N)$), and AI code boilerplate.
* Real-time interview intelligence studio with transcript ingestion and post-interview scorecard generation.

### 4. Statutory Offer & Closing Engine (Compliance Module)
* **Nigerian Labour Act (Cap L1, LFN 2004) Compliance**: Pre-configured contractual terms covering statutory probation periods, annual leave mandates, notice periods, and HMO coverage.
* **Pension Reform Act 2014 (PRA 2014)**: Automated monthly pension calculations (8% employee deduction, 10% employer contribution).
* **USD FX Pegging**: Built-in quarterly adjustment clauses indexed against CBN NAFEM benchmark rates.
* **Two-Stage Offer Dispatch**: Dedicated workspace decoupling initial draft generation from candidate delivery.
* **Server-Side PDF Sealing (`pdf-lib`)**: Server-rendered, tamper-evident contract generation embedding candidate canvas signatures, timestamps, IP audit logs, and document references.
* **On-Demand PDF Streaming**: Real-time export endpoint (`/api/v1/offers/[offerId]/pdf`) for one-click contract downloads.

### 5. Multi-Channel Referee Verification
* Cross-channel dispatch supporting both **WhatsApp Instant Forms** (`wa.me`) and direct email verifications.
* AI-assisted reference feed matching referee claims against candidate resume declarations.

---

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript, Server Actions, Route Handlers)
* **Database & ORM**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
* **Vector & Intelligence Core**: `pgvector` for similarity search, embedding pipelines, and hiring memory
* **Document Processing**: `pdf-lib` for immutable server-side PDF generation
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide Icons
* **Validation**: Zod schema validation

---

## Project Structure

```text
├── app/
│   ├── (candidate)/
│   │   └── candidate/offers/[offerId]/    # Candidate digital signing portal
│   ├── (recruiter)/
│   │   └── dashboard/
│   │       ├── offers/                    # Recruiter statutory offers board
│   │       │   └── new/                   # Dedicated offer generator workspace
│   │       ├── intelligence/              # Hiring memory & RAG retrieval
│   │       └── ...
│   └── api/
│       └── v1/
│           ├── offers/                    # Offer management endpoints
│           │   ├── [offerId]/accept/      # Digital execution & PDF sealing
│           │   ├── [offerId]/send/        # Two-stage offer dispatch
│           │   └── [offerId]/pdf/         # Dynamic PDF buffer streaming
│           └── ...
├── lib/
│   ├── pdf/
│   │   └── generateOfferPdf.ts            # pdf-lib statutory contract engine
│   ├── prisma.ts                          # Prisma client instance
│   └── errors.ts                          # Centralized error handler
├── prisma/
│   └── schema.prisma                      # Data models (Offer, Application, etc.)
└── public/
    └── offers/                            # Storage for executed PDF contracts

```

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone [https://github.com/](https://github.com/)<your-username>/<repo-name>.git
cd <repo-name>
npm install

```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hireiq?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma db seed # Optional: seed sample roles and candidates

```

### 4. Start the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## Statutory Contract Pipeline Workflow

1. **Advance Candidate**: Move a candidate to `OFFER` on the recruitment board.
2. **Draft Offer**: Navigate to `/dashboard/offers/new`, enter salary terms, review the statutory preview, and generate a draft.
3. **Dispatch**: Click **Send Offer to Candidate** to lock the validity period and generate a signed portal URL.
4. **Digital Execution**: The candidate signs the agreement via HTML5 canvas at `/candidate/offers/[offerId]`.
5. **Sealing & Storage**: The server stamps the signature, metadata, and legal terms using `pdf-lib`, writes the PDF, updates the offer to `ACCEPTED`, and sets the candidate stage to `HIRED`.

---

## License

This project is licensed under the MIT License.

```
