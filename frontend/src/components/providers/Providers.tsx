"use client";

import { MagicAccountProvider, MockAccountProvider } from "./AccountProvider";

export interface ParticleKeys {
  projectId?: string;
  clientKey?: string;
  appId?: string;
}

// Keys are read from server env in the root layout and passed down, so they are
// never in a NEXT_PUBLIC_ variable. The Magic and Particle client SDKs still
// need their publishable keys in the browser (unavoidable), so lock the app
// domain allowlist in each dashboard. Missing keys fall back to mock mode.
export function Providers({
  magicApiKey,
  particle,
  children,
}: {
  magicApiKey?: string;
  particle: ParticleKeys;
  children: React.ReactNode;
}) {
  const { projectId, clientKey, appId } = particle;

  if (!magicApiKey || !projectId || !clientKey || !appId) {
    return <MockAccountProvider>{children}</MockAccountProvider>;
  }

  return (
    <MagicAccountProvider
      magicApiKey={magicApiKey}
      projectId={projectId}
      clientKey={clientKey}
      appId={appId}
    >
      {children}
    </MagicAccountProvider>
  );
}
