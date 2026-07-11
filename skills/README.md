# Skills

Project knowledge for building on Particle Network Universal Accounts. Each
folder is a `SKILL.md` with implementation-grade context distilled from the docs
linked in `reference.md`.

| Skill                          | Use it when                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| `particle-universal-accounts`  | Understanding concepts: unified balance, universal gas, 4337/7702 |
| `particle-ua-sdk-reference`    | You need exact SDK API: config, methods, types, response shapes   |
| `particle-ua-web-integration`  | Wiring UA into a Next.js/React/Node app (4 signer recipes)         |
| `particle-ua-transactions`     | Building transfers, contract calls, buy/sell/convert, Solana, fees |
| `particle-ua-7702-mode`        | Gasless in-place EOA upgrade via embedded (WaaS) wallets           |
| `particle-ua-server`           | Backend signing, transaction history, low-level REST API          |
| `particle-ua-patterns`         | Deposit/withdraw UX flows and a balance breakdown widget          |

Suggested reading order:

1. `particle-universal-accounts` for the mental model.
2. `particle-ua-web-integration` to wire a signer and send the first tx.
3. `particle-ua-transactions` for the specific operations your app needs.
4. Reach into `particle-ua-sdk-reference`, `particle-ua-7702-mode`,
   `particle-ua-server`, and `particle-ua-patterns` as needed.

Docs source of truth: `reference.md` and https://developers.particle.network/llms.txt
