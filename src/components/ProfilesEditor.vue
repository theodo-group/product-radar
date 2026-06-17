<script setup lang="ts">
import type { Radar } from "../types"
import { MIN_PROFILES, MAX_PROFILES, PROFILE_PALETTE } from "../types"
import { useRadars } from "../storage"

const props = defineProps<{ radar: Radar }>()
const { update, blankProfile } = useRadars()

function addProfile(): void {
  update(props.radar.id, (r) => {
    if (r.profiles.length >= MAX_PROFILES) return
    r.profiles.push(blankProfile(`Profile ${r.profiles.length + 1}`, r.profiles.length))
  })
}

function removeProfile(profileId: string): void {
  update(props.radar.id, (r) => {
    if (r.profiles.length <= MIN_PROFILES) return
    r.profiles = r.profiles.filter((p) => p.id !== profileId)
  })
}

function renameProfile(profileId: string, name: string): void {
  update(props.radar.id, (r) => {
    const p = r.profiles.find((x) => x.id === profileId)
    if (p) p.name = name
  })
}

function setColor(profileId: string, color: string): void {
  update(props.radar.id, (r) => {
    const p = r.profiles.find((x) => x.id === profileId)
    if (p) p.color = color
  })
}
</script>

<template>
  <section>
    <div class="flex items-baseline justify-between mb-2">
      <h2 class="text-lg font-semibold">Profiles</h2>
      <span class="text-xs text-base-content/50">
        {{ radar.profiles.length }} / {{ MAX_PROFILES }} · min {{ MIN_PROFILES }}
      </span>
    </div>
    <p class="text-xs text-base-content/60 mb-3">
      Each Profile is one shape on the radar (e.g. <em>Us today</em>, <em>Us 2027</em>,
      <em>Acme Corp</em>).
    </p>
    <ul class="flex flex-col gap-3">
      <li
        v-for="p in radar.profiles"
        :key="p.id"
        class="flex flex-col gap-2 p-3 rounded-lg border border-base-300 bg-base-100"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-block w-4 h-4 rounded"
            :style="{ background: p.color }"
            aria-hidden="true"
          />
          <input
            type="text"
            class="input input-bordered input-sm flex-1"
            :value="p.name"
            @input="renameProfile(p.id, ($event.target as HTMLInputElement).value)"
            placeholder="Profile name"
          />
          <button
            class="btn btn-ghost btn-sm text-error"
            :disabled="radar.profiles.length <= MIN_PROFILES"
            @click="removeProfile(p.id)"
            :title="
              radar.profiles.length <= MIN_PROFILES ? `Minimum ${MIN_PROFILES} profile` : 'Remove'
            "
          >
            ✕
          </button>
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="color in PROFILE_PALETTE"
            :key="color"
            type="button"
            class="w-6 h-6 rounded transition border-2"
            :style="{ background: color }"
            :class="
              p.color === color
                ? 'border-base-content scale-110'
                : 'border-transparent hover:scale-105'
            "
            :aria-label="`Set color ${color}`"
            @click="setColor(p.id, color)"
          />
        </div>
      </li>
    </ul>
    <button
      class="btn btn-outline btn-sm mt-3"
      :disabled="radar.profiles.length >= MAX_PROFILES"
      @click="addProfile"
    >
      + Add profile
    </button>
  </section>
</template>
