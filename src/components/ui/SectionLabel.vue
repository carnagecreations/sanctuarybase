<template>
  <div class="section-label">
    <div class="section-label__accent"></div>
    <slot />
  </div>
</template>

<style scoped>
.section-label {
  font-size: 13px;
  font-weight: 900;
  color: var(--ink);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 32px 0 18px;
  opacity: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.section-label__accent {
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--mint) 0%, var(--teal-d) 100%);
  box-shadow: 0 2px 8px rgba(78, 255, 197, 0.3);
  flex-shrink: 0;
}

.section-label::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--mint) 0%, transparent 100%);
  opacity: 0.3;
}
</style>
