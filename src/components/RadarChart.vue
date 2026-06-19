<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import type { Radar } from "../types"
import { MAX_SCORE } from "../types"

const props = withDefaults(
  defineProps<{
    radar: Radar
    /** Renders the radar name (top) and profile legend (bottom). Defaults to true. */
    withChrome?: boolean
  }>(),
  { withChrome: true },
)

const WIDTH = 720
const HEIGHT = computed(() => (props.withChrome === false ? 600 : 800))

const subtitleText = computed(() => props.radar.concept?.trim() ?? "")

const SUBTITLE_SINGLE_LINE_MAX = 64

function wrapToTwoLines(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 2) return [text]
  let bestSplit = 1
  let bestDiff = Infinity
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length)
    if (diff < bestDiff) {
      bestDiff = diff
      bestSplit = i
    }
  }
  return [words.slice(0, bestSplit).join(" "), words.slice(bestSplit).join(" ")]
}

// 0 lines = no concept, 1 = fits, 2 = wrapped.
const subtitleLines = computed<string[]>(() => {
  const text = subtitleText.value
  if (props.withChrome === false || !text) return []
  return text.length <= SUBTITLE_SINGLE_LINE_MAX ? [text] : wrapToTwoLines(text)
})

const TITLE_H = computed(() => {
  if (props.withChrome === false) return 0
  const n = subtitleLines.value.length
  return n === 0 ? 60 : n === 1 ? 92 : 116
})

const titleY = computed(() => (subtitleLines.value.length === 0 ? TITLE_H.value / 2 + 4 : 32))
const subtitleFontSize = computed(() => (subtitleLines.value.length > 1 ? 14 : 16))
const subtitleStartY = computed(() => (subtitleLines.value.length > 1 ? 56 : 64))
const subtitleLineHeight = computed(() => (subtitleLines.value.length > 1 ? 18 : 0))
const LEGEND_H = computed(() => (props.withChrome === false ? 0 : 120))
const CHART_TOP = computed(() => TITLE_H.value)
const CHART_BOTTOM = computed(() => HEIGHT.value - LEGEND_H.value)
const CHART_CX = WIDTH / 2
const CHART_CY = computed(() => (CHART_TOP.value + CHART_BOTTOM.value) / 2)
const CHART_R = computed(() =>
  Math.min((CHART_BOTTOM.value - CHART_TOP.value) / 2 - 70, WIDTH / 2 - 100),
)

type Pt = { x: number; y: number }

function angleFor(i: number, total: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / total
}

function pointOnAxis(i: number, total: number, ratio: number): Pt {
  const angle = angleFor(i, total)
  return {
    x: CHART_CX + Math.cos(angle) * CHART_R.value * ratio,
    y: CHART_CY.value + Math.sin(angle) * CHART_R.value * ratio,
  }
}

const axisPoints = computed<Pt[]>(() =>
  props.radar.criteria.map((_, i) => pointOnAxis(i, props.radar.criteria.length, 1)),
)

const ringPaths = computed<string[]>(() => {
  const total = props.radar.criteria.length
  if (total < 3) return []
  return [0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
    const pts = Array.from({ length: total }, (_, i) => pointOnAxis(i, total, ratio))
    return pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
  })
})

type ProfileShape = {
  id: string
  name: string
  color: string
  path: string
  vertices: Pt[]
}

const profileShapes = computed<ProfileShape[]>(() => {
  const total = props.radar.criteria.length
  if (total < 3) return []
  return props.radar.profiles.map((profile) => {
    const vertices = props.radar.criteria.map((criterion, i) => {
      const score = props.radar.scores[profile.id]?.[criterion.id] ?? 0
      return pointOnAxis(i, total, score / MAX_SCORE)
    })
    const path = vertices.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
    return { id: profile.id, name: profile.name, color: profile.color, path, vertices }
  })
})

type Label = { x: number; y: number; anchor: "start" | "middle" | "end"; text: string; dy: string }

type CriterionLabel = {
  x: number
  y: number
  anchor: "start" | "middle" | "end"
  lines: string[]
  firstDy: number
}

const LABEL_FONT_SIZE = 14
const LABEL_LINE_HEIGHT = 17
const LABEL_MARGIN = 8

// Becomes true once "Fredoka" is loaded so wrapping recomputes with accurate widths.
const fontReady = ref(false)
onMounted(() => {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
  if (fonts?.ready) fonts.ready.then(() => (fontReady.value = true))
})

let measureCtx: CanvasRenderingContext2D | null = null
function textWidth(text: string): number {
  if (typeof document !== "undefined") {
    measureCtx ??= document.createElement("canvas").getContext("2d")
    if (measureCtx) {
      measureCtx.font = `500 ${LABEL_FONT_SIZE}px "Fredoka", ui-sans-serif, system-ui, sans-serif`
      return measureCtx.measureText(text).width
    }
  }
  return text.length * LABEL_FONT_SIZE * 0.55
}

// Greedily word-wrap so each line fits maxWidth; long single words stay on their own line.
function wrapToWidth(text: string, maxWidth: number): string[] {
  void fontReady.value // re-wrap once the web font finishes loading
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return [text]
  const lines: string[] = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`
    if (textWidth(candidate) <= maxWidth) current = candidate
    else {
      lines.push(current)
      current = words[i]
    }
  }
  lines.push(current)
  return lines
}

const criterionLabels = computed<CriterionLabel[]>(() => {
  const total = props.radar.criteria.length
  return props.radar.criteria.map((criterion, i) => {
    const labelRadius = CHART_R.value + 28
    const angle = angleFor(i, total)
    const x = CHART_CX + Math.cos(angle) * labelRadius
    const y = CHART_CY.value + Math.sin(angle) * labelRadius
    const cosA = Math.cos(angle)
    let anchor: "start" | "middle" | "end" = "middle"
    if (cosA > 0.2) anchor = "start"
    else if (cosA < -0.2) anchor = "end"

    // Horizontal room from the anchor point to the nearest SVG edge.
    let maxWidth: number
    if (anchor === "start") maxWidth = WIDTH - x - LABEL_MARGIN
    else if (anchor === "end") maxWidth = x - LABEL_MARGIN
    else maxWidth = 2 * Math.min(x - LABEL_MARGIN, WIDTH - x - LABEL_MARGIN)

    const lines = wrapToWidth(criterion.name || "Untitled", maxWidth)
    const extra = (lines.length - 1) * LABEL_LINE_HEIGHT

    // Stack lines away from the chart: top labels grow upward, bottom downward, sides center.
    const sinA = Math.sin(angle)
    let firstDy: number
    if (sinA < -0.5) firstDy = -extra
    else if (sinA > 0.5) firstDy = 10
    else firstDy = 5 - extra / 2
    return { x, y, anchor, lines, firstDy }
  })
})

const scoreRingLabels = computed<Label[]>(() => {
  if (props.radar.criteria.length < 3) return []
  return [1, 2, 3, 4, 5].map((score) => {
    const ratio = score / MAX_SCORE
    const x = CHART_CX + 4
    const y = CHART_CY.value - CHART_R.value * ratio
    return { x, y, anchor: "start" as const, text: String(score), dy: "0.35em" }
  })
})

const titleText = computed(() => props.radar.name || "Untitled radar")

const legendItems = computed(() => {
  // up to 5 profiles — fit in one row if possible, else two rows
  return props.radar.profiles.map((p) => ({
    id: p.id,
    name: p.name || "Untitled",
    color: p.color,
  }))
})

const legendLayout = computed(() => {
  const count = legendItems.value.length
  if (count === 0) return { rows: [] as Array<typeof legendItems.value> }
  const perRow = count <= 3 ? count : Math.ceil(count / 2)
  const rows: Array<typeof legendItems.value> = []
  for (let i = 0; i < count; i += perRow) {
    rows.push(legendItems.value.slice(i, i + perRow))
  }
  return { rows }
})

const insufficientCriteria = computed(() => props.radar.criteria.length < 3)
</script>

<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="`Radar chart: ${titleText}`"
    class="w-full h-auto"
    style="font-family: &quot;Fredoka&quot;, ui-sans-serif, system-ui, sans-serif"
  >
    <rect :width="WIDTH" :height="HEIGHT" fill="#ffffff" />

    <!-- Title -->
    <text
      v-if="withChrome !== false"
      :x="WIDTH / 2"
      :y="titleY"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="28"
      font-weight="600"
      fill="#0f172a"
    >
      {{ titleText }}
    </text>

    <!-- Concept (subtitle, wraps to two lines when long) -->
    <text
      v-for="(line, i) in subtitleLines"
      :key="`subtitle-${i}`"
      :x="WIDTH / 2"
      :y="subtitleStartY + i * subtitleLineHeight"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="subtitleFontSize"
      fill="#64748b"
    >
      {{ line }}
    </text>

    <!-- Empty state -->
    <text
      v-if="insufficientCriteria"
      :x="CHART_CX"
      :y="CHART_CY"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="18"
      fill="#94a3b8"
    >
      Add at least 3 criteria to see the chart
    </text>

    <g v-else>
      <!-- Rings -->
      <path
        v-for="(d, i) in ringPaths"
        :key="`ring-${i}`"
        :d="d"
        fill="none"
        stroke="#e2e8f0"
        stroke-width="1"
      />
      <!-- Axes -->
      <line
        v-for="(p, i) in axisPoints"
        :key="`axis-${i}`"
        :x1="CHART_CX"
        :y1="CHART_CY"
        :x2="p.x"
        :y2="p.y"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- Score ring labels -->
      <text
        v-for="(l, i) in scoreRingLabels"
        :key="`score-${i}`"
        :x="l.x"
        :y="l.y"
        :text-anchor="l.anchor"
        :dy="l.dy"
        font-size="11"
        fill="#94a3b8"
      >
        {{ l.text }}
      </text>

      <!-- Profile shapes -->
      <g v-for="shape in profileShapes" :key="shape.id">
        <path
          :d="shape.path"
          :fill="shape.color"
          fill-opacity="0.18"
          :stroke="shape.color"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <circle
          v-for="(v, i) in shape.vertices"
          :key="`${shape.id}-v-${i}`"
          :cx="v.x"
          :cy="v.y"
          r="3.5"
          :fill="shape.color"
        />
      </g>

      <!-- Criterion labels (word-wrapped to stay inside the canvas) -->
      <text
        v-for="(l, i) in criterionLabels"
        :key="`label-${i}`"
        :y="l.y"
        :text-anchor="l.anchor"
        font-size="14"
        font-weight="500"
        fill="#0f172a"
      >
        <tspan
          v-for="(line, j) in l.lines"
          :key="`label-${i}-${j}`"
          :x="l.x"
          :dy="j === 0 ? l.firstDy : LABEL_LINE_HEIGHT"
        >
          {{ line }}
        </tspan>
      </text>
    </g>

    <!-- Legend -->
    <g v-if="withChrome !== false" :transform="`translate(0, ${CHART_BOTTOM + 24})`">
      <g
        v-for="(row, rowIdx) in legendLayout.rows"
        :key="`row-${rowIdx}`"
        :transform="`translate(${WIDTH / 2 - (row.length * 140) / 2}, ${rowIdx * 28})`"
      >
        <g v-for="(item, i) in row" :key="item.id" :transform="`translate(${i * 140}, 0)`">
          <rect width="14" height="14" rx="3" :fill="item.color" />
          <text x="22" y="11" font-size="14" fill="#0f172a">{{ item.name }}</text>
        </g>
      </g>
    </g>
  </svg>
</template>
