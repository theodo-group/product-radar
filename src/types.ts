export type Criterion = {
  id: string
  name: string
}

export type Profile = {
  id: string
  name: string
  color: string
}

export type Radar = {
  id: string
  name: string
  criteria: Criterion[]
  profiles: Profile[]
  /** scores[profileId][criterionId] = 0..5 */
  scores: Record<string, Record<string, number>>
  createdAt: number
  updatedAt: number
}

export const MIN_CRITERIA = 3
export const MAX_CRITERIA = 7
export const MIN_PROFILES = 1
export const MAX_PROFILES = 5
export const MIN_SCORE = 0
export const MAX_SCORE = 5

export const PROFILE_PALETTE = [
  '#e11d48', // rose-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#db2777', // pink-600
  '#65a30d', // lime-600
] as const
