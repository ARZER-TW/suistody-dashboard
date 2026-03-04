# Suistody Dashboard

Web dashboard for managing Sui Vaults with policy-based AI Agent custody.

Built with Next.js 16, React 19, Tailwind CSS v4, and @mysten/dapp-kit. Connects to the @suistody/core SDK for on-chain vault operations.

- **Version**: 0.1.0
- **Framework**: Next.js 16.1.6 (webpack mode)
- **Wallet**: @mysten/dapp-kit (Sui Wallet, etc.)
- **Network**: Sui testnet (configurable)

## Features

- Wallet connect via dapp-kit ConnectButton
- Live SUI/USD price from Pyth oracle (30s refresh)
- Vault list with status badges (active/paused/locked)
- Vault detail page (balance, policy, stats, events, agents)
- Create vault with full policy configuration
- Deposit / Withdraw all funds
- Pause / Unpause vault
- Update vault policy
- Authorize / Revoke agents (with confirmation dialog)

## Setup

### Prerequisites

- Node.js 20+
- @suistody/core built locally (`cd ../suistody-core && npm run build`)

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PACKAGE_ID` | Yes | Deployed Move contract address |
| `NEXT_PUBLIC_SUI_NETWORK` | Yes | `testnet`, `devnet`, or `mainnet` |

### Install and Run

```bash
npm install
npm run dev       # Development server (localhost:3000)
npm run build     # Production build
npm start         # Production server
```

Both `dev` and `build` use `--webpack` flag (not Turbopack) to support `file:` local dependencies.

## Architecture

### @mysten/sui v1/v2 Compatibility

The dashboard uses `@mysten/sui@2.x` (required by dapp-kit), while @suistody/core uses v1.x. Compatibility is bridged through:

1. **`lib/sui-compat.ts`** -- Aliased as `@mysten/sui/client` via tsconfig paths. `SuiClient` extends v2's `SuiJsonRpcClient` with auto network inference from URL.
2. **`next.config.ts`** -- Webpack alias maps `@mysten/sui/transactions` to v2 dist.
3. **`hooks/use-sign-execute.ts`** -- Accepts `tx: unknown` and casts to v2 Transaction type.
4. **`components/providers.tsx`** -- Uses v2 `createNetworkConfig` with required `network` prop.

### Project Structure

```
app/
  layout.tsx              # Root layout: dark mode, Geist font, Providers
  page.tsx                # Home: VaultList + CreateVaultButton
  globals.css             # Tailwind v4 + dark mode variant
  vault/[id]/page.tsx     # Vault detail (dynamic, server-rendered)

components/               # 11 React components (all "use client")
  connect-button.tsx      # dapp-kit ConnectButton wrapper
  create-vault-button.tsx # Toggle for CreateVaultForm
  create-vault-form.tsx   # Vault creation with policy params
  providers.tsx           # QueryClient + SuiClient + Wallet providers
  sui-price.tsx           # Live SUI/USD price (Pyth, 30s refresh)
  vault-actions.tsx       # Deposit, WithdrawAll, Pause/Unpause
  vault-agents.tsx        # Agent management (authorize, revoke)
  vault-card.tsx          # Vault card with status badge
  vault-detail.tsx        # Full vault detail view
  vault-list.tsx          # Grid of VaultCards
  vault-policy-form.tsx   # Edit policy form

hooks/
  use-sign-execute.ts     # v1/v2 Transaction bridge hook

lib/
  sui-compat.ts           # v1/v2 SuiClient compatibility shim
  suistody.ts             # ensureInit() for @suistody/core
```

## Dependencies

| Package | Version | Role |
|---------|---------|------|
| `next` | `16.1.6` | React framework |
| `react` | `19.2.3` | UI library |
| `@mysten/dapp-kit` | `^1.0.3` | Sui wallet integration |
| `@mysten/sui` | `^2.5.0` | Sui SDK (v2) |
| `@suistody/core` | `file:../suistody-core` | Vault SDK (local) |
| `@tanstack/react-query` | `^5.90.21` | Data fetching |
| `tailwindcss` | `^4` | Styling |

## License

MIT
