// Magic / wallet actions reject with a "user canceled" error when the person
// closes the OTP or signing popup. That's a normal cancel, not a failure, so we
// detect it to avoid logging it as an error (which trips the Next dev overlay)
// and to show a gentle message instead.
export function isUserRejection(error: unknown): boolean {
  const e = error as { code?: number; message?: string } | null;
  const msg = (e?.message ?? "").toLowerCase();
  return (
    e?.code === 4001 || // EIP-1193 user rejected
    msg.includes("cancel") || // "User canceled action" / "cancelled"
    msg.includes("denied") ||
    msg.includes("rejected")
  );
}
