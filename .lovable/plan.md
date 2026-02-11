

# Matte Dark SaaS Dashboard

## Overview
A pixel-perfect dark-themed financial dashboard with sidebar navigation, matching the "Matte Dark SaaS" aesthetic from the reference image. Dark mode only, with a sleek charcoal color palette.

## Pages & Layout

### 1. Dashboard Layout (Main Shell)
- Fixed sidebar (250px) on the left + main content area on the right
- Full dark theme: `zinc-950` background, `zinc-900` sidebar
- Top header bar with "Dashboard" title and sidebar collapse toggle icon

### 2. Sidebar Navigation
- **Logo area**: "Acme Inc." branding with a blue asterisk/sparkle icon
- **Search bar**: Dark input field at the top with search icon and muted placeholder
- **Main Menu group** (collapsible with chevron):
  - Dashboard (active state with subtle `bg-white/5` highlight)
  - Wallet
  - Cards
  - Transactions (with red "6" notification badge)
  - Budget
  - Goals
- **Analytics group** (collapsible):
  - Analytics
  - Cash Flow (with red "2" notification badge)
  - Investments
- **Others group** (collapsible):
  - Help Center
- All items: 16px Lucide icons, 14px text, proper spacing

### 3. Dashboard Content Area
- **Bento grid of stat cards** with `rounded-2xl`, dark card backgrounds, no borders:
  - **Total Balance card**: Shows "$8,800", green "+3.1% vs last month", mini bar chart visualization (blue/cyan gradient bars fading to gray)
  - **Income card** (partially visible): Similar layout with purple accent
  - **Usage Category card**: Large "$15,200 total transactions" header, vertical bar chart below (dark gray bars) with Y-axis labels (10k–30k)

### 4. Design Details
- All text uses `font-normal` or `font-medium`; large dollar amounts use `font-semibold`
- Icons are thin stroke (`stroke-[1.5]`)
- Cards use subtle background contrast, no visible borders
- Notification badges are pill-shaped with solid pink/red background
- Charts rendered with Recharts using dark theme styling

