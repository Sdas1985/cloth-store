# 👑 Roxy Fashion BD — World-Class Bangladeshi Fashion E-Commerce Platform

A production-grade, mobile-first fashion e-commerce web application designed for Bangladesh, featuring **Men's Luxury Panjabi** and **Women's Designer Clothing**.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, and a dual-engine persistent database (Local SQLite + Production Supabase / PostgreSQL).

---

## 🌟 Key Features

1. **Mobile-First Luxury Experience**
   - Strictly **2 product cards per row** on mobile devices (`grid-cols-2`) with high-resolution visual cards.
   - Dual primary action buttons:
     - **ORDER NOW**: Instant checkout for the selected item and variant without requiring adding to cart first.
     - **ADD TO BAG**: Real-time counter badge with interactive slide-over cart drawer.
   - Dual typography system: **Hind Siliguri** for elegant Bengali text and **Inter** for numerals & English descriptions.
   - Curated luxury color palette: Royal Burgundy (`#631322`), Warm Ivory (`#FAF9F5`), Gold accents (`#D4AF37`), and Deep Charcoal (`#1C1917`).

2. **Frictionless Bangladeshi Cash on Delivery (COD) Checkout**
   - **No mandatory account creation** — fastest 1-step checkout in Bangladesh.
   - **Searchable 64 Districts Dropdown**: Auto-complete matching Bengali (`চট্টগ্রাম`, `ঢাকা`), English (`Chattogram`, `Dhaka`), and aliases (`ctg`, `cxsbzr`).
   - **Smart Delivery Calculation**:
     - Chattogram District: **৳80** default
     - All other 63 Districts: **৳150** default
     - Free delivery threshold: Free delivery automatically applied on orders over **৳3,000**.
     - All delivery charges and thresholds are reconfigurable directly from the Admin Dashboard without touching code.
   - **Phone Normalization**: Accepts `01XXXXXXXXX`, `+8801XXXXXXXXX`, with spaces, dashes, or Bengali numerals (`০১৭...`), normalizing to canonical 11 digits.
   - **Fraud & Block Protection**: Instant server-side prevention of orders from blocked fraudulent numbers.

3. **Super Admin Dashboard (20 Operational Modules)**
   - **Overview**: Real-time gross revenue, order fulfillment counts, low stock alerts, conversion metrics, and suspicious orders queue.
   - **Order Management**: Searchable, filterable table with detailed order view modal (eye icon), customer order history, risk assessment, invoice printing, and fulfillment status updates.
   - **Product Management**: Support for both **Simple Products** and **Variable Products** with dynamic size/color matrix, inventory per variant, and SKUs.
   - **Categories & Subcategories**: Live tree management for collections.
   - **Attribute Management**: Predefined & custom sizes and colors with visual HEX swatches.
   - **Inventory Management**: Real-time stock audit and inventory movement logging.
   - **Checkout Abandonment Recovery**: Privacy-aware session tracking of abandoned checkouts with follow-up status (Contacted, Recovered, Opt-out).
   - **Fraud Review**: Phone number blocking with mandatory reason and unblock capability.
   - **Delivery Settings**: Dynamic configuration of district fees and free delivery thresholds.
   - **Coupons & Promotions**: Percentage & fixed discounts with expiry dates and minimum order limits.
   - **Audit Logs**: Immutable log of administrative actions.

---

## 🚀 Running Locally

### 1. Requirements
- Node.js 18+ (tested on Node.js 20+)
- npm or pnpm

### 2. Setup
```bash
# Clone or navigate to the project directory
cd "e:/roxy cloth store"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application is now live at:
- **Storefront:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔐 Default Admin Credentials

| Credential | Value |
| :--- | :--- |
| **Login URL** | `/admin/login` |
| **Email** | `admin@roxy.com` |
| **Password** | `admin123456` |
| **Role** | `super_admin` |

---

## 🧪 Automated Acceptance Tests

To verify all 20 critical business and database specifications:

```bash
npx tsx scripts/test-acceptance.ts
```

All 20 tests verify:
- 64 Bangladesh districts & aliases search
- Dynamic delivery calculation (Chattogram ৳80, Outside ৳150, Free on ৳3000+)
- Phone number normalization & invalid phone rejection
- Simple & Variable products variant matrix
- Bcrypt password authentication & JWT server actions
- Transactional order placement with stock decrement
- Customer fraud blocking with mandatory reason & unblocking
- Privacy-compliant checkout abandonment session lifecycle
- Stock restoration on cancellation
- Admin delivery fee updates without checkout rewrite
- Non-sequential public order references (`ROX-XXXX-XXXXXX`)
- Immutable administrative audit logs

---

## 🗄️ Database Architecture & Production PostgreSQL

The project includes an intelligent dual-database driver (`src/lib/db.ts`):
- **Development (Zero-Config):** Automatically initializes SQLite (`data/roxy_store.db`) when `DATABASE_URL` is not present.
- **Production (Supabase / Neon / PostgreSQL):** Automatically connects to PostgreSQL using connection pooling when `DATABASE_URL` is set.

### Deploying with Supabase or Managed PostgreSQL:
1. Create a PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Execute the provided migration script:
   - Script location: `migrations/001_initial_schema.sql`
   - Paste into Supabase SQL Editor and run.
3. Configure environment variables in `.env.local` or Vercel dashboard:
   ```env
   DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
   JWT_SECRET="generate-a-secure-random-32-char-secret"
   ```

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Environment Variables**, configure:
   - `DATABASE_URL`: Your Supabase or PostgreSQL connection string.
   - `JWT_SECRET`: A secure random secret for administrative authentication.
4. Deploy! Vercel will automatically build the Next.js App Router application.

---

## 📄 License & Attribution
Designed & developed for **Roxy Fashion BD** — World-Class Bangladeshi Fashion E-Commerce.
