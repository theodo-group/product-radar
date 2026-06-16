<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRadars } from '../storage'

const router = useRouter()
const { radars, createBlank, remove } = useRadars()

const sorted = computed(() =>
  [...radars.value].sort((a, b) => b.updatedAt - a.updatedAt),
)

function createAndOpen(): void {
  const radar = createBlank()
  router.push({ name: 'editor', params: { id: radar.id } })
}

function open(id: string): void {
  router.push({ name: 'editor', params: { id } })
}

function confirmDelete(id: string, name: string): void {
  if (confirm(`Delete "${name}"? This cannot be undone.`)) remove(id)
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-6 py-10">
    <div class="flex items-end justify-between mb-8">
      <div>
        <h1 class="text-3xl font-semibold">Your radars</h1>
        <p class="text-base-content/60 mt-1">
          Compare up to 5 Profiles across 3–7 Criteria on a 0–5 scale.
        </p>
      </div>
      <button class="btn btn-primary" @click="createAndOpen">+ New radar</button>
    </div>

    <div
      v-if="sorted.length === 0"
      class="card bg-base-100 border border-base-300 border-dashed"
    >
      <div class="card-body items-center text-center py-16">
        <p class="text-base-content/70">No radars yet.</p>
        <button class="btn btn-primary mt-3" @click="createAndOpen">
          Create your first radar
        </button>
      </div>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="r in sorted"
        :key="r.id"
        class="card bg-base-100 shadow-sm hover:shadow-md transition cursor-pointer border border-base-300"
        @click="open(r.id)"
      >
        <div class="card-body">
          <h2 class="card-title text-lg truncate">{{ r.name || 'Untitled radar' }}</h2>
          <p class="text-sm text-base-content/60">
            {{ r.criteria.length }} criteria · {{ r.profiles.length }} profile{{
              r.profiles.length === 1 ? '' : 's'
            }}
          </p>
          <p class="text-xs text-base-content/40 mt-1">
            Updated {{ formatDate(r.updatedAt) }}
          </p>
          <div class="card-actions justify-end mt-2">
            <button
              class="btn btn-ghost btn-xs text-error"
              @click.stop="confirmDelete(r.id, r.name)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
