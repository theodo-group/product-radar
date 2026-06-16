<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <header class="bg-base-100 border-b border-base-300">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link to="/" class="text-xl font-semibold tracking-tight">
          product-radar
        </router-link>
        <span class="text-xs text-base-content/50">browser-local · 0–5 scale</span>
      </div>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
