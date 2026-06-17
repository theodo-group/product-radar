import { ref, watch } from "vue"
import type { Radar, Criterion, Profile } from "./types.ts"
import { MIN_CRITERIA, MIN_PROFILES, PROFILE_PALETTE } from "./types.ts"

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

  function remove(id: string): void {
    const idx = radars.value.findIndex((r) => r.id === id)
    if (idx >= 0) radars.value.splice(idx, 1)
  }

  return {
    radars,
    list,
    get,
    createBlank,
    update,
    remove,
    blankCriterion,
    blankProfile,
  }
}
