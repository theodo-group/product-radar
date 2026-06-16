<script setup lang="ts">
import type { Radar } from '../types'
import { MIN_SCORE, MAX_SCORE } from '../types'
import { useRadars } from '../storage'

const props = defineProps<{ radar: Radar }>()
const { update } = useRadars()

const SCALE: number[] = []
for (let i = MIN_SCORE; i <= MAX_SCORE; i++) SCALE.push(i)

function getScore(profileId: string, criterionId: string): number {
  return props.radar.scores[profileId]?.[criterionId] ?? 0
}

function setScore(profileId: string, criterionId: string, value: number): void {
  update(props.radar.id, (r) => {
    if (!r.scores[profileId]) r.scores[profileId] = {}
    r.scores[profileId][criterionId] = value
  })
}
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold mb-2">Scores</h2>
    <p class="text-xs text-base-content/60 mb-3">
      0 = worst on this Criterion, 5 = best.
    </p>
    <div class="overflow-x-auto rounded-lg border border-base-300 bg-base-100">
      <table class="table table-sm">
        <thead>
          <tr>
            <th class="text-left">Profile \ Criterion</th>
            <th v-for="c in radar.criteria" :key="c.id" class="text-left">
              {{ c.name || 'Untitled' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in radar.profiles" :key="p.id">
            <td class="font-medium whitespace-nowrap">
              <span
                class="inline-block w-3 h-3 rounded mr-2 align-middle"
                :style="{ background: p.color }"
                aria-hidden="true"
              />
              {{ p.name || 'Untitled' }}
            </td>
            <td v-for="c in radar.criteria" :key="c.id">
              <div class="flex gap-1">
                <button
                  v-for="value in SCALE"
                  :key="value"
                  type="button"
                  class="btn btn-xs"
                  :class="
                    getScore(p.id, c.id) === value ? 'btn-primary' : 'btn-ghost'
                  "
                  @click="setScore(p.id, c.id, value)"
                  :aria-label="`Score ${value} for ${p.name} on ${c.name}`"
                >
                  {{ value }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
