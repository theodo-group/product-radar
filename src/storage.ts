import { ref, watch } from "vue"
import type { Radar, Criterion, Profile } from "./types.ts"
import {
  MIN_CRITERIA,
  MAX_CRITERIA,
  MIN_PROFILES,
  MAX_PROFILES,
  MIN_SCORE,
  MAX_SCORE,
  PROFILE_PALETTE,
} from "./types.ts"

const STORAGE_KEY = "product-radar:radars"

function loadAll(): Radar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Default concept for radars saved before the field existed.
    return parsed.map((r: Radar) => ({ ...r, concept: r.concept ?? "" }))
  } catch {
    return []
  }
}

const radars = ref<Radar[]>(loadAll())

watch(
  radars,
  (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  },
  { deep: true },
)

function uid(): string {
  return crypto.randomUUID()
}

function blankCriterion(name = ""): Criterion {
  return { id: uid(), name }
}

function blankProfile(name = "", colorIndex = 0): Profile {
  return {
    id: uid(),
    name,
    color: PROFILE_PALETTE[colorIndex % PROFILE_PALETTE.length],
  }
}

function ensureScores(radar: Radar): void {
  for (const profile of radar.profiles) {
    if (!radar.scores[profile.id]) radar.scores[profile.id] = {}
    for (const criterion of radar.criteria) {
      if (radar.scores[profile.id][criterion.id] == null) {
        radar.scores[profile.id][criterion.id] = 0
      }
    }
  }
  // garbage-collect scores for removed entities
  for (const profileId of Object.keys(radar.scores)) {
    if (!radar.profiles.find((p) => p.id === profileId)) {
      delete radar.scores[profileId]
      continue
    }
    for (const criterionId of Object.keys(radar.scores[profileId])) {
      if (!radar.criteria.find((c) => c.id === criterionId)) {
        delete radar.scores[profileId][criterionId]
      }
    }
  }
}

export function useRadars() {
  function list(): Radar[] {
    return radars.value
  }

  function get(id: string): Radar | undefined {
    return radars.value.find((r) => r.id === id)
  }

  function createBlank(name = "Untitled radar"): Radar {
    const criteria: Criterion[] = []
    for (let i = 0; i < MIN_CRITERIA; i++) criteria.push(blankCriterion(`Criterion ${i + 1}`))

    const profiles: Profile[] = []
    for (let i = 0; i < MIN_PROFILES; i++) profiles.push(blankProfile(`Profile ${i + 1}`, i))

    const now = Date.now()
    const radar: Radar = {
      id: uid(),
      name,
      concept: "",
      criteria,
      profiles,
      scores: {},
      createdAt: now,
      updatedAt: now,
    }
    ensureScores(radar)
    radars.value.push(radar)
    return radar
  }

  function update(id: string, mutate: (r: Radar) => void): void {
    const radar = get(id)
    if (!radar) return
    mutate(radar)
    ensureScores(radar)
    radar.updatedAt = Date.now()
  }

  function duplicate(id: string): Radar | undefined {
    const source = get(id)
    if (!source) return undefined
    const now = Date.now()
    const radar: Radar = {
      ...JSON.parse(JSON.stringify(source)),
      id: uid(),
      name: `${source.name || "Untitled radar"} (copy)`,
      createdAt: now,
      updatedAt: now,
    }
    radars.value.push(radar)
    return radar
  }

  function remove(id: string): void {
    const idx = radars.value.findIndex((r) => r.id === id)
    if (idx >= 0) radars.value.splice(idx, 1)
  }

  // Build a fresh, owned radar from an untrusted payload (e.g. a share link).
  // Everything is validated and clamped — a malformed payload yields undefined
  // rather than corrupting the store. Inner criterion/profile ids are kept so
  // the scores map stays consistent; only the radar id and timestamps are new.
  function importRadar(payload: unknown): Radar | undefined {
    if (!payload || typeof payload !== "object") return undefined
    const p = payload as Partial<Radar>

    const criteria: Criterion[] = (Array.isArray(p.criteria) ? p.criteria : [])
      .filter((c): c is Criterion => !!c && typeof c === "object")
      .slice(0, MAX_CRITERIA)
      .map((c) => ({ id: typeof c.id === "string" ? c.id : uid(), name: String(c.name ?? "") }))

    const profiles: Profile[] = (Array.isArray(p.profiles) ? p.profiles : [])
      .filter((pr): pr is Profile => !!pr && typeof pr === "object")
      .slice(0, MAX_PROFILES)
      .map((pr, i) => ({
        id: typeof pr.id === "string" ? pr.id : uid(),
        name: String(pr.name ?? ""),
        color:
          typeof pr.color === "string" ? pr.color : PROFILE_PALETTE[i % PROFILE_PALETTE.length],
      }))

    if (criteria.length < MIN_CRITERIA || profiles.length < MIN_PROFILES) return undefined

    const rawScores = (p.scores && typeof p.scores === "object" ? p.scores : {}) as Record<
      string,
      Record<string, unknown>
    >
    const scores: Radar["scores"] = {}
    for (const profile of profiles) {
      scores[profile.id] = {}
      for (const criterion of criteria) {
        const v = Number(rawScores[profile.id]?.[criterion.id])
        scores[profile.id][criterion.id] = Number.isFinite(v)
          ? Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(v)))
          : 0
      }
    }

    const now = Date.now()
    const radar: Radar = {
      id: uid(),
      name: String(p.name ?? "Shared radar"),
      concept: String(p.concept ?? ""),
      criteria,
      profiles,
      scores,
      createdAt: now,
      updatedAt: now,
    }
    ensureScores(radar)
    radars.value.push(radar)
    return radar
  }

  return {
    radars,
    list,
    get,
    createBlank,
    update,
    duplicate,
    remove,
    importRadar,
    blankCriterion,
    blankProfile,
  }
}
