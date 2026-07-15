// The @particle-network/universal-account-sdk package ships types at
// dist/index.d.ts but its package.json "exports" map does not expose a types
// condition, so TypeScript cannot resolve them under bundler resolution. Shim it
// as untyped until upstream fixes the exports map.
declare module "@particle-network/universal-account-sdk";
