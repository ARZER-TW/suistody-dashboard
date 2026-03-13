# Suistody Dashboard - CLAUDE.md

## Project Overview

Next.js 16 web dashboard (v0.1.0) for managing Sui Vaults. Uses webpack mode (not Turbopack) and bridges @mysten/sui v1/v2 APIs via compatibility shim.

- Framework: Next.js 16.1.6 + React 19 + Tailwind CSS v4
- Components: 11 React components (all "use client")
- Source: 1322 lines across all .ts/.tsx files
- No test framework configured

## Development Commands

```bash
npm run dev       # Next.js dev server (webpack mode, port 3000)
npm run build     # Production build (webpack mode)
npm start         # Start production server
npm run lint      # ESLint
```

## Key Technical Decisions

### Webpack over Turbopack
- `next dev --webpack` and `next build --webpack` are used instead of Turbopack
- Reason: Turbopack cannot resolve symlinked `file:` local dependencies (@suistody/core)
- Trade-off: slower dev server, but correct dependency resolution

### @mysten/sui v1 vs v2 Compatibility Shim
- Dashboard requires `@mysten/sui@2.x` (mandated by @mysten/dapp-kit@1.x)
- @suistody/core is built against v1.x API
- Solution: multi-layer shim

**Layer 1 - `lib/sui-compat.ts`** (tsconfig paths alias for `@mysten/sui/client`):
- `SuiClient` class extends v2's `SuiJsonRpcClient`
- Auto-infers `network` param from fullnode URL (v2 requires it, v1 didn't)
- Re-exports `getJsonRpcFullnodeUrl` as `getFullnodeUrl`

**Layer 2 - `next.config.ts`** (webpack alias):
- `@mysten/sui/transactions` -> v2 dist path
- `transpilePackages: ["@suistody/core"]`

**Layer 3 - `hooks/use-sign-execute.ts`**:
- Accepts `tx: unknown`, casts to v2 Transaction type
- Bridges wallet signing between v1 and v2 transaction formats

**Layer 4 - `components/providers.tsx`**:
- Uses v2 `createNetworkConfig` with `network` prop (v1 didn't need this)

### Dark Mode
- `<html className="dark">` hardcoded in `app/layout.tsx`
- `globals.css` uses `@custom-variant dark (&:where(.dark, .dark *))` for Tailwind v4

### @suistody/core Initialization
- `lib/suistody.ts` calls `initSuistody()` with `NEXT_PUBLIC_*` env vars
- `ensureInit()` is called before SDK operations in components

## Project Structure

```
app/
  layout.tsx              # Root: dark mode, Geist font, Providers, header (SuiPrice + ConnectButton)
  page.tsx                # Home: VaultList + CreateVaultButton
  globals.css             # Tailwind v4 + dark mode custom variant
  vault/[id]/page.tsx     # Vault detail (async params for Next.js 16)

components/
  connect-button.tsx      # dapp-kit ConnectButton wrapper
  create-vault-button.tsx # Toggle for CreateVaultForm
  create-vault-form.tsx   # Full vault creation form with policy params
  providers.tsx           # QueryClientProvider + SuiClientProvider + WalletProvider
  sui-price.tsx           # Live SUI/USD price (Pyth oracle, 30s refresh)
  vault-actions.tsx       # Deposit, WithdrawAll, Pause/Unpause buttons
  vault-agents.tsx        # Authorize/Revoke agents with confirmation
  vault-card.tsx          # Vault card: status badge, balance, budget
  vault-detail.tsx        # Full vault detail: policy, stats, events, agents
  vault-list.tsx          # Grid of VaultCards from getOwnedVaults
  vault-policy-form.tsx   # Edit policy form

hooks/
  use-sign-execute.ts     # Custom hook bridging v1/v2 Transaction types

lib/
  sui-compat.ts           # v1/v2 SuiClient compatibility shim
  suistody.ts             # ensureInit() with NEXT_PUBLIC env vars
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_PACKAGE_ID` | Deployed Move contract address |
| `NEXT_PUBLIC_SUI_NETWORK` | `testnet`, `devnet`, or `mainnet` |

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Home page: vault list + create vault |
| `/vault/[id]` | Dynamic | Vault detail page (server-rendered) |

## Restrictions

- All components use `"use client"` directive
- No API routes -- all data fetched directly from Sui RPC
- No test framework -- manual testing only
- Private repo (not published to npm)
- Repository: https://github.com/ARZER-TW/suistody-dashboard (private). CI: GitHub Actions.
