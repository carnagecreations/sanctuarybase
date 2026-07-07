<template>
  <div class="skeleton-wrap">
    <div v-for="n in count" :key="n" class="skeleton-card">
      <div class="skel-row">
        <div class="skel-circle pulse"></div>
        <div class="skel-lines">
          <div class="skel-line wide pulse"></div>
          <div class="skel-line narrow pulse"></div>
        </div>
        <div class="skel-badge pulse"></div>
      </div>
      <div class="skel-line full pulse" style="margin-top:10px"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ count: { type: Number, default: 4 } })
</script>

<style scoped>
.skeleton-wrap { display: flex; flex-direction: column; gap: 8px; }
.skeleton-card {
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
}
.skel-row { display: flex; align-items: center; gap: 10px; }
.skel-circle { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skel-badge { width: 60px; height: 20px; border-radius: 10px; flex-shrink: 0; }
.skel-line { height: 10px; border-radius: 5px; }
.skel-line.wide { width: 60%; }
.skel-line.narrow { width: 40%; }
.skel-line.full { width: 100%; }

.pulse {
  background: var(--surface-2);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}
</style>
