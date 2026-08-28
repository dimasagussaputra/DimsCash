# DimsCash 💰

> Aplikasi pencatat keuangan pribadi modern yang dibangun dengan Next.js 16, TypeScript, Tailwind CSS v4, dan Supabase.

> Link Deploy Vercel: https://dims-cash.vercel.app/

![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Tentang Project

**DimsCash** adalah aplikasi manajemen keuangan pribadi (personal finance tracker) yang membantu pengguna mencatat pemasukan & pengeluaran, memvisualisasikan arus kas, dan mengelola kategori transaksi dengan antarmuka yang bersih, responsif, dan modern.

Dibangun dengan **Next.js 16 App Router** mengadopsi **React Server Components** sebagai default, **Server Actions** untuk mutasi data, dan **Supabase** sebagai backend-as-a-service (database PostgreSQL, Auth, Storage, Realtime).

---

## 🛠 Tech Stack

### Frontend

| Kategori | Teknologi | Versi | Deskripsi |
|----------|-----------|-------|-----------|
| **Framework** | [Next.js](https://nextjs.org/) | 16.3.1 | App Router, Server Components, Server Actions, Turbopack |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | 5.x | Strict mode, type-safe API routes & components |
| **UI Library** | [React](https://react.dev/) | 19.2.8 | Concurrent features, Server Components support |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first, CSS-first config, OKLCH colors |
| **Komponen UI** | [shadcn/ui](https://ui.shadcn.com/) | 4.18.0 | Aksesibel, customizable, berbasis Radix UI |
| **Base UI** | [@base-ui/react](https://base-ui.com/) | 1.7.0 | Headless UI primitives untuk komponen kompleks |
| **Ikon** | [Lucide React](https://lucide.dev/) | 1.33.0 | SVG icons konsisten, tree-shakeable |
| **Chart** | [Recharts](https://recharts.org/) | 3.10.1 | Composable charting library (Bar, Pie, Line) |
| **Form** | [React Hook Form](https://react-hook-form.com/) | 7.85.0 | Performant, minimal re-renders |
| **Validasi** | [Zod](https://zod.dev/) | 3.25.76 | Schema validation type-safe |
| **Date Utils** | [date-fns](https://date-fns.org/) | 4.4.0 | Modular, immutable date manipulation |
| **Notifikasi** | [Sonner](https://sonner.emilkowal.ski/) | 2.0.8 | Toast notifications accessible |
| **Utilities** | clsx, tailwind-merge, cva | latest | Class name composition & variant management |

### Backend & Database

| Kategori | Teknologi | Deskripsi |
|----------|-----------|-----------|
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) | Relational DB dengan Row Level Security (RLS) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) | SSR session management dengan `@supabase/ssr` |
| **API** | Next.js Server Components & Server Actions | Zero-API boilerplate, type-safe end-to-end |
| **Storage** | [Supabase Storage](https://supabase.com/storage) | Avatar upload, CDN delivery |
| **Realtime** | Supabase Realtime | (Tersedia) Live updates untuk collaborative features |

### Development & DevOps

| Kategori | Teknologi |
|----------|-----------|
| **Deployment** | [Vercel](https://vercel.com/) |
| **Package Manager** | npm / pnpm / bun |
| **Linting** | ESLint 9 + `eslint-config-next` |
| **Type Checking** | TypeScript strict mode |
| **CSS Processing** | `@tailwindcss/postcss` |
| **Git Hooks** | (Optional) Husky + lint-staged |

---

## ✨ Fitur Utama

### 📊 Dashboard
- **Total Saldo** — Ringkasan saldo keseluruhan dengan toggle *hide/show* nominal (persist ke `localStorage`)
- **Arus Kas (Cashflow)** — Grafik batang pemasukan vs pengeluaran 6/12 bulan terakhir dengan toggle periode
- **Pengeluaran per Kategori** — Donut chart dengan warna semantik per kategori (Food=orange, Transport=blue, dll)
- **Transaksi Terbaru** — 5 transaksi terakhir dengan quick actions

### 💳 Manajemen Transaksi
- **CRUD Lengkap** — Tambah, edit, hapus transaksi
- **Filter & Pencarian** — Berdasarkan kategori, tipe, rentang tanggal
- **Pagination** — Server-side pagination untuk performa
- **Validasi Form** — Zod schema validation client & server

### 🏷️ Manajemen Kategori
- **Kategori Income & Expense** — Terpisah dengan icon picker (Lucide icons)
- **Kategori Default** — 8 expense + 6 income kategori otomatis dibuat saat signup
- **Custom Kategori** — User bisa tambah/edit/hapus kategori sendiri

### 👤 Profil & Autentikasi
- **Auth SSR** — Login/Register dengan Supabase Auth, session di cookie HttpOnly
- **Avatar Upload** — Upload foto profil ke Supabase Storage
- **Ganti Password** — Secure password update
- **Logout** — Session termination

---

## 🏗 Arsitektur & Pola

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 App Router                  │
├─────────────────────────────────────────────────────────────┤
│  Server Components (Default)                                │
│  ├── Dashboard Page (RSC) → fetch data via Server Actions  │
│  ├── Components (Client/Server)                             │
│  │   ├── Dashboard: BalanceCard, CashflowChart, ExpenseChart│
│  │   ├── Transactions: List, Form, Filters, Pagination     │
│  │   ├── Categories: Manager, Form                          │
│  │   └── UI: Button, Card, Input, Select, Dialog, etc.     │
│  └── Server Actions (app/api/actions.ts)                    │
│       ├── createTransaction, updateTransaction, delete...   │
│       ├── createCategory, updateCategory, deleteCategory    │
│       └── updateProfile, changePassword, uploadAvatar       │
├─────────────────────────────────────────────────────────────┤
│  Supabase Client (SSR)                                      │
│  ├── createClient() → Server Components                     │
│  ├── createBrowserClient() → Client Components              │
│  └── Middleware → Session refresh & route protection        │
└─────────────────────────────────────────────────────────────┘
```

### Key Patterns
- **Server Components by Default** — Fetch data di server, kirim HTML ke client
- **Server Actions untuk Mutasi** — Type-safe form submissions tanpa API routes manual
- **Supabase SSR** — Cookie-based session sync antar server/client
- **Path Aliases** — `@/*` mapped ke root project (`tsconfig.json`)
- **Feature-based Structure** — Components grouped by domain (`dashboard/`, `transactions/`, `categories/`, `ui/`)

---

## 📋 Prasyarat

| Tool | Versi Minimum | Install Guide |
|------|---------------|---------------|
| **Node.js** | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **pnpm** (recommended) | 9.x | `npm i -g pnpm` |
| **Supabase Account** | - | [supabase.com](https://supabase.com/) |
| **Git** | 2.x | [git-scm.com](https://git-scm.com/) |

---

## ⚡ Instalasi Cepat

### 1. Clone Repository
```bash
git clone https://github.com/your-username/DimsCash.git
cd DimsCash
```

### 2. Install Dependencies
```bash
pnpm install
# atau
npm install
# atau
bun install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial Supabase:
```env
# Supabase (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service Role Key untuk admin operations (server-only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Catatan**: Kategori default (8 expense + 6 income) otomatis dibuat via database trigger `handle_new_user()` saat user signup pertama kali.

### 4. Setup Database
1. Buka **Supabase Dashboard** → project Anda
2. Buka **SQL Editor**
3. Buka file `supabase/migrations/0000_combined.sql`
4. Copy **seluruh isi file** → paste ke SQL Editor
5. Klik **Run** untuk eksekusi

> File `0000_combined.sql` berisi semua migrasi yang digabung (schema, tables, triggers, RLS, storage, policies, seed kategori Indonesia, dan budgets). Cukup jalankan sekali.

### 5. Run Development Server
```bash
pnpm dev
# atau npm run dev
```
Buka [http://localhost:3000](http://localhost:3000)

---


### Security
- **Row Level Security (RLS)** aktif di semua tabel
- **Policies**: User hanya bisa akses data milik sendiri
- **Trigger**: `handle_new_user()` → auto-create profile & default categories on signup
- **Trigger**: `set_updated_at()` → auto-update `updated_at` column
- **Function**: `enforce_transaction_category_type()` → validasi type match category

### Default Categories (Seeded on Signup)
| Expense (8) | Income (6) |
|-------------|------------|
| Food & Beverage 🍔 | Salary 💼 |
| Transportation 🚌 | Freelance 💻 |
| Shopping 🛍️ | Business 🏢 |
| Education 📚 | Investment 📈 |
| Health 🏥 | Gift 🎁 |
| Entertainment 🎮 | Other 📦 |
| Bills 🧾 | |
| Other 📦 | |

---

## 📁 Struktur Project

```
DimsCash/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: Login, Register
│   ├── (dashboard)/              # Route group: Protected dashboard routes
│   │   ├── dashboard/            # Dashboard page
│   │   ├── transactions/         # Transactions CRUD
│   │   ├── categories/           # Categories management
│   │   └── profile/              # Profile settings
│   ├── api/
│   │   └── actions.ts            # Server Actions (mutations)
│   ├── layout.tsx                # Root layout + providers
│   ├── page.tsx                  # Redirect → /dashboard
│   └── globals.css               # Global styles + CSS variables
├── components/                   # React Components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── balance-card.tsx      # Total Saldo card
│   │   ├── cashflow-chart.tsx    # Bar chart arus kas
│   │   ├── expense-chart.tsx     # Donut chart kategori
│   │   ├── recent-transactions.tsx
│   │   └── dashboard-greeting.tsx
│   ├── transactions/             # Transaction components
│   ├── categories/               # Category components
│   ├── profile/                  # Profile components
│   ├── layout/                   # Sidebar, MobileNav
│   └── ui/                       # shadcn/ui components (Button, Card, Input, etc.)
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client (SSR)
│   ├── services/                 # Business logic / data fetching
│   │   ├── dashboard.service.ts  # Dashboard queries
│   │   ├── transaction.service.ts
│   │   ├── category.service.ts
│   │   └── profile.service.ts
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Helper functions (cn, formatCurrency, etc.)
├── types/                        # TypeScript types
│   ├── dashboard.ts
│   ├── transaction.ts
│   └── profile.ts
├── supabase/
│   └── migrations/               # SQL migration (0000_combined.sql)
├── scripts/
│   ├── seed-user.mjs             # Seed test user
│   └── localize-categories.mjs   # Localize category names
├── public/                       # Static assets
├── .env.local                    # Local env (gitignored)
├── .env.example                  # Env template
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── package.json
├── tailwind.config.ts            # (v4: di globals.css)
├── eslint.config.mjs
└── README.md
```

---

## 🛠 Development Commands

```bash
# Development server dengan Turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting (ESLint)
pnpm lint

# Type checking (TypeScript)
pnpm tsc --noEmit

# Seed test user (requires Supabase)
pnpm seed

# Format code (jika pakai Prettier)
pnpm format
```

### Code Style Guidelines
- **TypeScript strict mode** — No `any`, proper typing
- **ESLint + Prettier** — Run `pnpm lint` sebelum commit
- **Component Structure** — Server Components default, `'use client'` hanya saat perlu (interactivity, hooks, browser API)
- **Naming** — PascalCase components, camelCase functions/variables, kebab-case files
- **CSS** — Tailwind utility classes, CSS variables untuk theming (`globals.css`)


## 📞 Support & Contact

- **GitHub**: https://github.com/dimasagussaputra
- **Email**: agusdimas186@gmail.com

---

<div align="center">
  <sub>Built with ❤️ using Next.js 16, TypeScript, Tailwind CSS v4, and Supabase</sub>
</div>
