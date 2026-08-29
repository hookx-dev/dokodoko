/**
 * firebase-admin はedgeランタイムで使えないため、Firebase Auth REST API
 * (accounts:lookup) でIDトークンを検証する軽量な代替手段。
 */
export async function verifyIdToken(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as { users?: Array<{ localId: string }> };
  return data.users?.[0]?.localId ?? null;
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}
