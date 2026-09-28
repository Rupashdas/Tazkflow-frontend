<script setup lang="ts">
// TEMPORARY design check. Task 2 replaces this whole file with <RouterView />.
import { ref } from 'vue'
import { ACCENTS, applyAccent, applyAppearance, type AccentName } from '@/lib/theme'

const accent = ref<AccentName>('blue')

function pick(name: AccentName) {
  accent.value = name
  applyAccent(name)
}
</script>

<template>
  <div class="min-h-screen bg-page p-10">
    <div class="mx-auto max-w-[720px]">
      <p class="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Design check</p>
      <h1 class="mt-2 text-[28px] font-bold tracking-[-0.02em] text-text">Tokens and theme</h1>
      <p class="mt-2 text-secondary">Body text sits at 16px with a 1.55 line height.</p>

      <div class="mt-8 flex gap-3">
        <button
          class="h-[50px] rounded-control bg-accent px-5 text-[15px] font-semibold text-accent-contrast"
          @click="applyAppearance('light')"
        >
          Light
        </button>
        <button
          class="h-[50px] rounded-control border border-border-strong bg-surface px-5 text-[15px] font-medium text-text"
          @click="applyAppearance('dark')"
        >
          Dark
        </button>
        <button
          class="h-[50px] rounded-control border border-border-strong bg-surface px-5 text-[15px] font-medium text-text"
          @click="applyAppearance('os')"
        >
          System
        </button>
      </div>

      <div class="mt-4 flex gap-3">
        <button
          v-for="name in ACCENTS"
          :key="name"
          class="h-11 rounded-control border px-4 text-[15px] capitalize"
          :class="
            name === accent
              ? 'border-accent bg-accent-soft text-accent-soft-text font-semibold'
              : 'border-border-strong bg-surface text-secondary'
          "
          @click="pick(name)"
        >
          {{ name }}
        </button>
      </div>

      <div class="mt-8 rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 class="text-[20px] font-semibold text-text">Card</h2>
        <p class="mt-2 text-secondary">Surface, border and shadow come from tokens.</p>
        <div class="mt-5 flex items-center gap-3">
          <span class="rounded-chip bg-accent-soft px-3.5 py-1.5 text-[14px] font-semibold text-accent-soft-text">
            Admin
          </span>
          <span class="rounded-chip bg-success-soft px-3.5 py-1.5 text-[14px] font-semibold text-success-text">
            ● Active
          </span>
          <span class="rounded-chip bg-danger-soft px-3.5 py-1.5 text-[14px] font-semibold text-danger-text">
            ● Removed
          </span>
          <a class="text-[15px] font-semibold text-accent-text" href="#">A link</a>
        </div>
      </div>
    </div>
  </div>
</template>
