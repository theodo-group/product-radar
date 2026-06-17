<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { useRadars } from "../storage"
import RadarChart from "../components/RadarChart.vue"
import CriteriaEditor from "../components/CriteriaEditor.vue"
import ProfilesEditor from "../components/ProfilesEditor.vue"
import ScoreGrid from "../components/ScoreGrid.vue"
import { svgToPngBlob, downloadBlob, copyBlobToClipboard, slugify } from "../utils/png"

const props = defineProps<{ id: string }>()
const router = useRouter()
const { get, update } = useRadars()

const radar = computed(() => get(props.id))

watchEffect(() => {
  if (!radar.value) {
    router.replace({ name: "list" })
  }
})

function setName(name: string): void {
  update(props.id, (r) => {
    r.name = name
  })
}

function setConcept(concept: string): void {
  update(props.id, (r) => {
    r.concept = concept
  })
}

const chartContainer = ref<HTMLElement | null>(null)
const toast = ref<{ kind: "success" | "error"; text: string } | null>(null)

function flash(kind: "success" | "error", text: string, ms = 2200): void {
  toast.value = { kind, text }
  setTimeout(() => {
    toast.value = null
  }, ms)
}

function getSvg(): SVGSVGElement | null {
  return chartContainer.value?.querySelector("svg") ?? null
}

async function downloadPng(): Promise<void> {
  const svg = getSvg()
  if (!svg || !radar.value) return
  try {
    const blob = await svgToPngBlob(svg, 2)
    downloadBlob(blob, `${slugify(radar.value.name)}.png`)
    flash("success", "PNG downloaded")
  } catch (err) {
    console.error(err)
    flash("error", "Could not export PNG")
  }
}

async function copyPng(): Promise<void> {
  const svg = getSvg()
  if (!svg) return
  try {
    const blob = await svgToPngBlob(svg, 2)
    await copyBlobToClipboard(blob)
    flash("success", "Copied to clipboard")
  } catch (err) {
    console.error(err)
    flash("error", "Clipboard copy not supported here — try Download")
  }
}
</script>

<template>
  <section v-if="radar" class="max-w-6xl mx-auto px-6 py-8">
    <!-- Top bar -->
    <div class="flex flex-wrap items-start gap-3 mb-6">
      <button class="btn btn-ghost btn-sm mt-1" @click="router.push({ name: 'list' })">
        ← All radars
      </button>
      <div class="flex-1 min-w-[200px] flex flex-col gap-2">
        <input
          type="text"
          class="input input-bordered input-lg font-semibold"
          :value="radar.name"
          @input="setName(($event.target as HTMLInputElement).value)"
          placeholder="Untitled radar"
          aria-label="Radar name"
        />
        <input
          type="text"
          class="input input-bordered input-sm"
          :value="radar.concept"
          @input="setConcept(($event.target as HTMLInputElement).value)"
          placeholder="Concept — name the product and its typical performances"
          aria-label="Radar concept"
        />
      </div>
      <div class="flex gap-2 mt-1">
        <button class="btn btn-outline" @click="copyPng">Copy PNG</button>
        <button class="btn btn-primary" @click="downloadPng">Download PNG</button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="mb-4">
      <div class="alert" :class="toast.kind === 'success' ? 'alert-success' : 'alert-error'">
        <span>{{ toast.text }}</span>
      </div>
    </div>

    <!-- Layout: chart left, editors right -->
    <div class="grid lg:grid-cols-[1fr_360px] gap-6">
      <div
        ref="chartContainer"
        class="card bg-base-100 border border-base-300 shadow-sm p-4 flex items-center justify-center"
      >
        <RadarChart :radar="radar" />
      </div>
      <div class="flex flex-col gap-6">
        <CriteriaEditor :radar="radar" />
        <ProfilesEditor :radar="radar" />
      </div>
    </div>

    <!-- Score grid below, full width -->
    <div class="mt-8">
      <ScoreGrid :radar="radar" />
    </div>
  </section>
</template>
