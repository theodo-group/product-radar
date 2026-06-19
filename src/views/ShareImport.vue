<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useRadars } from "../storage"
import { decodeRadar } from "../utils/share"

const route = useRoute()
const router = useRouter()
const { importRadar } = useRadars()

const failed = ref(false)

onMounted(() => {
  const raw = route.query.d
  const encoded = Array.isArray(raw) ? raw[0] : raw
  if (typeof encoded === "string" && encoded.length > 0) {
    const payload = decodeRadar(encoded)
    const radar = payload ? importRadar(payload) : undefined
    if (radar) {
      router.replace({ name: "editor", params: { id: radar.id } })
      return
    }
  }
  failed.value = true
})
</script>

<template>
  <section class="max-w-lg mx-auto px-6 py-16 text-center">
    <div v-if="failed" class="card bg-base-100 border border-base-300">
      <div class="card-body items-center">
        <h1 class="text-xl font-semibold">This share link is invalid</h1>
        <p class="text-base-content/60">The link may be incomplete or corrupted.</p>
        <button class="btn btn-primary mt-2" @click="router.replace({ name: 'list' })">
          Go to my radars
        </button>
      </div>
    </div>
    <p v-else class="text-base-content/60">Importing shared radar…</p>
  </section>
</template>
