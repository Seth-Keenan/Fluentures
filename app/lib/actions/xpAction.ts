export async function addXp(delta: number): Promise<number | null> {
  try {
    const res = await fetch("/api/xp/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ delta }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.xp === "number" ? data.xp : null;
  } catch {
    return null;
  }
}

// Convenience: dispatch a DOM event so UI can show toast(s)
export function dispatchXpToast(amount: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("xp-toast", { detail: { amount } }));
}
