import type { Radar } from "../types.ts"

/** The slice of a radar that travels in a share link. Volatile fields (id,
 *  timestamps) are dropped — they get regenerated when the link is imported. */
export type SharePayload = Pick<Radar, "name" | "concept" | "criteria" | "profiles" | "scores">

// btoa/atob only handle Latin-1, but names and concepts can be any Unicode, so
// we round-trip through UTF-8 bytes and use the URL-safe base64 alphabet.
function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeRadar(radar: Radar): string {
  const payload: SharePayload = {
    name: radar.name,
    concept: radar.concept,
    criteria: radar.criteria,
    profiles: radar.profiles,
    scores: radar.scores,
  }
  return toBase64Url(JSON.stringify(payload))
}

export function decodeRadar(encoded: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded))
    if (!parsed || typeof parsed !== "object") return null
    return parsed as SharePayload
  } catch {
    return null
  }
}
