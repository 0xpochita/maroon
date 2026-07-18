# Maroon - Architecture

Onboarding doc for developers (hi Alven 👋). Explains how the frontend is put
together, how data flows, and where the important pieces live. Everything here is
taken from the actual code - if something drifts, trust the code and update this.

---

## 1. What Maroon is

A consumer DeFi-yield app: "invisible" one-tap earning for people who are not
web3 natives (Polymarket-style UI). A user logs in with email, deposits USDC,
and earns real vault yield across chains - without managing wallets, gas, or
bridging.

Two pillars make that possible:
- **Magic** - email login that creates an embedded EOA (and can sign EIP-7702).
- **Particle Universal Accounts (UA), EIP-7702 mode** - turns that EOA into a
  chain-abstracted account: one login, one balance, transactions on any
  supported chain, gas paid from the unified balance.
- **LI.FI Earn** - the vault data layer + the Composer that builds deposit
  calldata and cross-chain routing.

---

## 2. Tech stack

| Area | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.10 |
| UI runtime | React | 19.2.4 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | ^4 |
| State | Zustand | ^5 |
| Auth / embedded wallet | `magic-sdk` (+ `@magic-ext/oauth2`) | ^33 / ^15 |
| Chain abstraction | `@particle-network/universal-account-sdk` | ^2.0.3 |
| Ethers | `ethers` | ^6 |
| Animation | `framer-motion` | ^12 |
| Charts | `recharts` | ^3 |
| AI copilot | `ai` (Vercel AI SDK) + `@ai-sdk/openai-compatible` (OpenRouter) / `@ai-sdk/anthropic` + `zod` | ^6 / ^2 / ^3 / ^3 |
| Icons | `lucide-react`, `react-icons` | - |
| Lint/format | Biome | 2.2.0 |
| Package manager | pnpm | - |

> ⚠️ This is **Next.js 16** - APIs and conventions differ from older versions.
> When touching framework internals, read `node_modules/next/dist/docs/` first
> (see `AGENTS.md`).

Scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint` (biome),
`pnpm format` (biome).

---

## 3. Directory structure

```
frontend/
├─ src/
│  ├─ app/                          # Next App Router
│  │  ├─ layout.tsx                 # root: fonts, <html>, theme bootstrap, StoreInitializer, viewport
│  │  ├─ globals.css                # Tailwind v4 tokens + dark theme (:root/.dark + @theme inline)
│  │  ├─ (main)/                    # route group with the app shell
│  │  │  ├─ layout.tsx              # wraps children in <AppShell>
│  │  │  ├─ page.tsx                # "/"  home
│  │  │  ├─ defi/page.tsx           # "/defi"  vault browser (category/chain via searchParams)
│  │  │  ├─ invest/page.tsx         # "/invest"  AI yield copilot flow (see §8b)
│  │  │  ├─ vault/[id]/page.tsx     # "/vault/:id"  vault detail
│  │  │  └─ profile/page.tsx        # "/profile"  account + positions
│  │  └─ api/
│  │     ├─ allocate/route.ts       # POST: AI plan (Claude or mock) over the LI.FI universe
│  │     └─ lifi/
│  │        ├─ quote/route.ts          # POST: LI.FI Composer deposit quote (server, key-safe)
│  │        └─ portfolio/[address]/route.ts  # GET: user's active vault positions
│  ├─ components/(main)/            # all UI (see §5)
│  ├─ components/providers/StoreInitializer.tsx
│  ├─ components/ui/PillButton.tsx
│  ├─ lib/                          # logic + integrations (see §9)
│  ├─ stores/                       # Zustand stores (see §6)
│  └─ types/earn.ts                 # Vault / Protocol / EarnPlan types
├─ public/Assets/Images/Logo/       # brand, chain, defi-protocol, token logos
├─ docs/                            # (this file) team docs - committed
└─ agents/                          # plans + internal notes - gitignored
```

---

## 4. Routing & rendering model

- App Router with a single route group `(main)` that applies the shell
  (`AppShell`) to every page.
- **Server components fetch data; client components hold interactivity.**
  - `defi/page.tsx`, `vault/[id]/page.tsx` are **async server components** that
    call `fetchVaults()` / `getVaultById()` (which read `LIFI_API_KEY` on the
    server) and pass plain data down.
  - Interactive pieces (`"use client"`) read from Zustand and call browser-only
    SDKs (Magic, Particle UA).
- Route params: `defi` reads `searchParams` (`?category=`, `?chain=`);
  `vault/[id]` reads the dynamic `id` (the vault address).

App shell (`components/(main)/AppShell`):

```
<> (outside flow: GlobalModals overlays)
 └─ <div min-h-screen flex-col>
     ├─ TopBar          (brand, search, Deposit, Saved/Wallet/Notification/Profile menus)
     ├─ CategoryNav     (Trending / DeFi / Best yield / … tabs, horizontal scroll)
     ├─ <main flex-1>   {page}
     └─ Footer          (mt-auto → pinned bottom)
</>
```

`GlobalModals` renders the single instances of `AuthModal`, `DepositModal`,
`EarnModal`, controlled by the UI store - so any button anywhere opens them
without local modal state.

---

## 5. Component map (by feature)

- **Shell / chrome**: `AppShell`, `TopBar`, `CategoryNav`, `Footer`,
  `NotificationMenu`, `ProfileMenu`, `SavedMenu`, `WalletMenu`.
- **Home** (`Home/`): `index` (layout), `FeaturedHero` (+ `YieldChart`,
  `ActivityFeed`), `AllVaultsBrowser` (search/filter/saved + grid), `HomeRail`
  (`PromoCard`, `TopVaults`, `AllVaults`).
- **Browse** (`VaultBrowser/`): `index` (server: filters by category/chain) →
  `BrowserResults` (client: header + toolbar + grid) + `ChainFilter` (sidebar on
  desktop, chip strip on mobile).
- **Grid**: `VaultGrid` → `VaultCard` (+ `SaveButton`, `VaultAvatar`).
- **Detail** (`VaultDetails/`): stats, "How it works" cards, `YieldTrend` chart,
  about; desktop sticky Earn panel + mobile fixed Earn bar.
- **Toolbar** (`VaultToolbar/parts.tsx`): shared `IconBtn`, `SearchField`,
  `FilterPopover`, `Empty` - used by both home and every category tab so the
  search/filter/saved UX is identical.
- **Deposit / earn**: `EarnButton` (trigger), `EarnModal` (amount + confirm),
  `DepositModal` (fund the account - crypto/cash), `AuthModal` (email login).
- **Profile** (`Profile/`): account card + tabs Positions / Holdings / Activity.

---

## 6. State management (Zustand)

Four stores in `src/stores/`. Components subscribe with selectors.

| Store | File | Holds | Key actions |
|---|---|---|---|
| Account | `account.ts` | `status`, `address`, `balanceUsd`, `assets`, `configured`, `mock` | `configure(keys)`, `loginWithEmail`, `logout`, `refresh`, `openOnramp`, `deposit` |
| UI | `ui.ts` | `authMode`, `depositOpen`, `earnVault` | `openAuth/closeAuth`, `openDeposit/closeDeposit`, `openEarn/closeEarn` |
| Saved | `saved.ts` | `items` (bookmarked vaults) | `toggle`, `has` - persisted (`persist`, `maroon:saved`, `skipHydration`) |
| Theme | `theme.ts` | `dark` | `toggle`, `init` - writes `.dark` class + `localStorage` |

**Bootstrapping** - `components/providers/StoreInitializer.tsx` runs once on
mount (rendered in root `layout.tsx`):
1. `useSavedStore.persist.rehydrate()` (skipHydration avoids SSR mismatch)
2. `useThemeStore.getState().init()`
3. `useAccountStore.getState().configure(keys)` - keys passed from server env.

Notes:
- Selectors return **stable references** (subscribe to `s.items`, derive with
  `useMemo`) to avoid the "getServerSnapshot" infinite loop.
- **Mock mode**: if account keys are missing, the account store runs with a mock
  address + assets so the whole UI is clickable without secrets.

---

## 7. Auth & wallet (Magic + Particle UA, EIP-7702)

```
User → AuthModal (email OTP)
     → Magic (lib/magic.ts, getMagic): loginWithEmailOTP
     → embedded EOA + provider (magic.rpcProvider)
     → account store status = "ready", address set
```

- `lib/magic.ts` - singleton `Magic` client on **Base** (chainId 8453). Its
  embedded EOA is the only wallet type that can sign the **EIP-7702
  authorization** Particle UA needs (AuthKit-style wallets can't).
- The EOA is wrapped by a **Universal Account** (`lib/ua.ts`,
  `newUniversalAccount`) with `smartAccountOptions.useEIP7702: true`. No new
  address, no contract deploy - the EOA is upgraded in place per tx.

Why EIP-7702 matters: it's the Particle "Universal Accounts Track" requirement.
See `agents/docs/track-requirements-verification.md` (local) for the checklist.

---

## 8. Deposit flow (the core cross-chain path)

`EarnButton` → `EarnModal` → `account.deposit` → `lib/ua.ts` `depositToVault`:

```
1. Get Magic signer + owner EOA
2. Guard: isUaChain(vault.chainId)?  (see §10) - else clear error
3. POST /api/lifi/quote  → LI.FI Composer builds deposit calldata
                           {transactionRequest:{to,data,value,chainId}}
                           (LIFI_API_KEY stays server-side)
4. ua.createUniversalTransaction({ chainId, expectTokens, transactions:[{to,data,value}] })
   → UA sources USDC from the unified balance (possibly another chain)
5. finalize():
   - for each userOp with eip7702Auth → magic.wallet.sign7702Authorization(...)
   - sign tx.rootHash with the signer
   - ua.sendTransaction(tx, rootSignature, authorizations)
6. Particle relayer executes on-chain: fronts native gas, runs the deposit,
   deducts gas+fees (USD-equiv) from the user's balance
```

Gas: paid from the unified balance **by default** (chain abstraction). There is
no `universalGas` flag in SDK v2.0.3 - see `agents/docs/gas-fees-and-gasless.md`.

`depositUsdc` is a simpler fallback (`createTransferTransaction`) for vaults
without a LI.FI address.

---

## 8b. AI invest flow (`/invest`) - "MARAI"

A Stax-style AI copilot that turns a plain-language goal into a diversified
basket of **real LI.FI vaults** and deposits into all of them in one flow. No
smart contract of our own - the "verification" layer Stax has is intentionally
omitted; trust rests on the LI.FI data + the existing UA deposit path.

Phase machine (`components/(main)/Invest/useInvest.ts`), one route renders the
screen for the current phase:

```
goal → thinking → plan → placing → success
 • goal  "Build my plan"     → POST /api/allocate            (Claude or mock)
 • plan  nudge chips         → re-POST /api/allocate with a risk hint appended
 • plan  "Deposit $X"        → account.depositPlan(legs)     (one UA deposit / leg)
 • placing                   → per-leg checklist follows the real deposits
 • success                   → receipt + "what you own now"
```

- **Allocation** (`lib/server/allocate.ts`, server-only): the universe is always
  real - `fetchVaults()` filtered to depositable UA-chain vaults. The **brain**
  (`getModel()`) is chosen by env, priority **OpenRouter > Anthropic > heuristic**:
  OpenRouter via `@ai-sdk/openai-compatible` (base `openrouter.ai/api/v1`) when
  `OPENROUTER_API_KEY` is set; else native Claude via `@ai-sdk/anthropic` when
  `ANTHROPIC_API_KEY` is set; else a **deterministic heuristic** that picks/weights
  vaults by category. Both LLM paths use `generateText` + a manual JSON parse
  validated against `AllocationSchema` (not `generateObject`) - this works across
  OpenRouter models and native Anthropic without depending on provider
  structured-output support, and `maxOutputTokens` is bounded (2000) so a
  low-credit key can afford the call (OpenRouter rejects with 402 if the max
  possible output exceeds the key's remaining credit). Any error falls back to the
  heuristic, so the flow never dead-ends. The mock swaps **only the brain** -
  vault data is always real LI.FI. Note: `@ai-sdk/openai-compatible` is pinned to
  `^2` (its `^3` targets AI SDK v7 / `LanguageModelV4`; we're on `ai@6` / provider
  `3.0.14`).
- **Risk** (`lib/risk.ts`): derived from LI.FI category tags (stablecoins/
  low-risk/liquid-staking/lending/high-risk) + an APY nudge, weight-blended to a
  0-10000 bps score → `safe|balanced|degen` label + a 5-dash meter. Not a market
  calculation; a grounded heuristic, same idea as Stax's risk score.
- **Execution**: `stores/account.ts` `depositPlan(legs)` loops `depositToVault`
  (or `depositUsdc`) once per leg via the Universal Account, one refresh at the
  end. Mock account mode returns `{ok, ids:["mock",...]}`. Gated behind login
  (`InvestFlowView` opens the auth modal if not ready and not mock).
- **Keyless caveat**: without `LIFI_API_KEY`, `fetchVaults` returns only the
  mock + Lido pseudo-vaults, and only the 3 Lido ones are depositable - so the
  keyless universe is thin. A rich AI plan needs `LIFI_API_KEY` (which the vault
  browser already uses); `ANTHROPIC_API_KEY` is what upgrades the brain from
  heuristic to Claude.

Rename the copilot in one place: `AI_NAME` in `components/(main)/Invest/parts.tsx`.

---

## 9. Data layer & API routes

`src/lib/`:

| File | Role |
|---|---|
| `lifi.ts` | **Server** vault fetching. `fetchVaults()` pulls per chain by `tvl` + `apy` (variety), caps per protocol, dedupes; `getVaultById`; `getPositions` (client → portfolio route); `Position` type; protocol/chain logo + name maps. |
| `ua.ts` | Universal Account: `newUniversalAccount`, `depositToVault`, `depositUsdc`, `finalize`. Imports the Particle SDK (client-only usage). |
| `ua-chains.ts` | SDK-free `UA_CHAIN_IDS` + `isUaChain()` (safe to import in client). |
| `magic.ts` | Magic client singleton. |
| `tokens.ts` | `tokenLogo(symbol)` (local + Trustwallet CDN fallback). |
| `format.ts` | `formatUsd`, `formatPercent`, `formatCompactUsd` (deterministic - no `Intl` compact, to avoid hydration mismatches). |
| `mock/earn.ts` | Mock vaults, `categories`, `chainLogos`, `earnPlans` - fallback + home content. |

**API routes** (`src/app/api/lifi/`) exist so secret keys never reach the
client:
- `POST /api/lifi/quote` - proxies LI.FI Composer `quote` with `LIFI_API_KEY`.
- `GET /api/lifi/portfolio/[address]` - fetches a wallet's active positions and
  joins them to the vault list (name/APY/logo/chain), key server-side.

Rule: **any request needing a secret goes through a server route.** No
`NEXT_PUBLIC_*` for sensitive values.

---

## 10. Chain support & deposit gating

Particle UA (v2.0.3) supports 6 chains; we deposit on the EVM ones we ship
vaults for: **Ethereum (1), Base (8453), Arbitrum (42161), BNB Chain (56)**.

The browse list (LI.FI) is wider (also Optimism/Polygon/Avalanche) to showcase
the data layer. So:
- `lib/ua-chains.ts` → `isUaChain(chainId)`.
- `EarnButton` disables Earn (+ tooltip) on non-UA chains.
- `depositToVault` guards and throws a clear message.

Details + Primary Assets (USDC sourcing) in
`agents/docs/supported-chains-and-usdc.md` (local).

---

## 11. Theming / dark mode

Tailwind v4, CSS-first. In `globals.css`:
- Colors defined as plain CSS vars on `:root` and overridden on `.dark`.
- `@theme inline` maps `--color-x: var(--x)` (var-of-var) so utilities like
  `bg-surface` resolve through the overridable var → `.dark` cascades to every
  utility.
- `@custom-variant dark (&:where(.dark, .dark *))`.
- Theme is applied **before paint** via an inline script in `layout.tsx`
  (reads `localStorage` / `prefers-color-scheme`), `<html suppressHydrationWarning>`.
- Toggle lives in `ProfileMenu` → `theme` store.

The palette is intentionally red-free (blue primary, green success, purple high).

---

## 12. Responsive strategy

Mobile-first, additive; desktop (`sm:`/`lg:`) untouched. Highlights:
- Shell padding `px-4 sm:px-6`; explicit `viewport` export in `layout.tsx`.
- TopBar hides the decorative search + secondary menus below `sm`.
- Dropdowns/popovers/modals are viewport-safe (`w-[min(...,calc(100vw-1.5rem))]`,
  `max-h-[90vh] overflow-y-auto`).
- Chain filter → horizontal chip strip on mobile; vault detail → fixed bottom
  Earn bar on mobile.

Full plan: `agents/plan/responsive-mobile/PLAN.md` (local).

---

## 13. Environment variables

Put these in `frontend/.env.local` (never commit; `.env*` is blocked by a
pre-commit hook). Template: `.env.example`.

| Var | Used by | Notes |
|---|---|---|
| `MAGIC_API_KEY` | Magic login / 7702 signer | Publishable key `pk_live_...` |
| `PARTICLE_PROJECT_ID` | Universal Accounts | from dashboard.particle.network |
| `PARTICLE_CLIENT_KEY` | Universal Accounts | |
| `PARTICLE_APP_ID` | Universal Accounts | |
| `LIFI_API_KEY` | vault + quote + portfolio routes + AI universe | **server-only** |
| `OPENROUTER_API_KEY` | `/api/allocate` (AI plan) | **server-only**; preferred brain when set |
| `OPENROUTER_MODEL` | `/api/allocate` | optional; defaults to `anthropic/claude-sonnet-4.5` |
| `ANTHROPIC_API_KEY` | `/api/allocate` (AI plan) | **server-only**; used only if `OPENROUTER_API_KEY` empty; absent too → heuristic |
| `AI_MODEL` | `/api/allocate` (Anthropic path) | optional; defaults to `claude-sonnet-5` |

Without keys, the app runs in **mock mode** (UI works, no real tx). All keys
stay server-side; sensitive values are never exposed as `NEXT_PUBLIC_*`.

---

## 14. Running locally

```bash
pnpm install
# add frontend/.env.local (see §13) - optional; app runs in mock mode without it
pnpm dev            # http://localhost:3000
pnpm build          # production build (run before pushing)
pnpm lint           # biome check src
```

To exercise a real cross-chain deposit: fill keys, log in with email, fund the
EOA with USDC on a UA chain (e.g. Base), then Earn into a vault on a different
UA chain (e.g. Arbitrum).

---

## 15. Conventions & gotchas

- **Next 16 is not the Next you know** - read the bundled docs before touching
  framework behavior.
- **Secrets are server-only.** Add a route under `app/api/` instead of a
  `NEXT_PUBLIC_` var.
- **Deterministic formatting** on anything server-rendered (see `format.ts`) to
  avoid hydration mismatches.
- **Biome** is the linter/formatter (not ESLint/Prettier). `pnpm lint` /
  `pnpm format`. It can OOM occasionally - just re-run.
- **`agents/` is gitignored** (plans + internal notes); **`docs/` is committed**
  (this file). Deeper design/verification notes live in `agents/docs/`.
- **Commits**: conventional style, keep the header ≤72 chars (commitlint via
  husky enforces body line length too).

---

## 16. Where to look first (quick index)

| I want to… | Start here |
|---|---|
| Change the shell / nav | `components/(main)/AppShell`, `TopBar`, `CategoryNav` |
| Change vault cards / grid | `VaultGrid/VaultCard.tsx`, `VaultGrid/index.tsx` |
| Change browse filters | `VaultBrowser/BrowserResults.tsx`, `ChainFilter.tsx`, `VaultToolbar/parts.tsx` |
| Change vault data / APY / logos | `lib/lifi.ts` |
| Change the deposit flow | `lib/ua.ts`, `EarnModal`, `api/lifi/quote/route.ts` |
| Change the AI invest flow | `components/(main)/Invest/*`, `lib/server/allocate.ts`, `lib/risk.ts`, `api/allocate/route.ts` |
| Change login | `AuthModal`, `lib/magic.ts`, `stores/account.ts` |
| Change positions / profile | `Profile/index.tsx`, `api/lifi/portfolio/[address]/route.ts` |
| Change theme/colors | `app/globals.css`, `stores/theme.ts` |
| Add a supported chain | `lib/ua-chains.ts`, `lib/lifi.ts` (`POPULAR_CHAINS`) |
```
