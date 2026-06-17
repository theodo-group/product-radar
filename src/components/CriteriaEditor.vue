<script setup lang="ts">
import type { Radar } from "../types"
import { MIN_CRITERIA, MAX_CRITERIA } from "../types"
import { useRadars } from "../storage"

const props = defineProps<{ radar: Radar }>()
const { update, blankCriterion } = useRadars()

function addCriterion(): void {
  update(props.radar.id, (r) => {
    if (r.criteria.length >= MAX_CRITERIA) return
    r.criteria.push(blankCriterion(`Criterion ${r.criteria.length + 1}`))
  })
}

function removeCriterion(criterionId: string): void {
  update(props.radar.id, (r) => {
    if (r.criteria.length <= MIN_CRITERIA) return
    r.criteria = r.criteria.filter((c) => c.id !== criterionId)
  })
}

function renameCriterion(criterionId: string, name: string): void {
  update(props.radar.id, (r) => {
    const c = r.criteria.find((x) => x.id === criterionId)
    if (c) c.name = name
  })
}
</script>

<template>
  <section>
    <div class="flex items-baseline justify-between mb-2">
      <h2 class="text-lg font-semibold">Criteria</h2>
      <span class="text-xs text-base-content/50">
        {{ radar.criteria.length }} / {{ MAX_CRITERIA }} · min {{ MIN_CRITERIA }}
      </span>
    </div>
    <p class="text-xs text-base-content/60 mb-3">
      Phrase each Criterion so higher is better (e.g. <em>Affordability</em>, not <em>Price</em>).
    </p>
    <ul class="flex flex-col gap-2">
      <li v-for="c in radar.criteria" :key="c.id" class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered input-sm flex-1"
          :value="c.name"
          @input="renameCriterion(c.id, ($event.target as HTMLInputElement).value)"
          placeholder="Criterion name"
        />
        <button
          class="btn btn-ghost btn-sm text-error"
          :disabled="radar.criteria.length <= MIN_CRITERIA"
          @click="removeCriterion(c.id)"
          :title="
            radar.criteria.length <= MIN_CRITERIA ? `Minimum ${MIN_CRITERIA} criteria` : 'Remove'
          "
        >
          ✕
        </button>
      </li>
    </ul>
    <button
      class="btn btn-outline btn-sm mt-3"
      :disabled="radar.criteria.length >= MAX_CRITERIA"
      @click="addCriterion"
    >
      + Add criterion
    </button>
  </section>
</template>
