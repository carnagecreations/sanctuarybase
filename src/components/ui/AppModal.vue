<template>
  <Teleport to="body">
    <Transition name="app-modal-fade">
      <div
        v-if="open"
        class="app-modal-overlay"
        @mousedown="onOverlayMousedown"
        @mouseup="onOverlayMouseup"
      >
        <div
          ref="dialogEl"
          class="app-modal"
          :class="[`app-modal--${size}`]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @keydown="onKeydown"
        >
          <div class="app-modal__header">
            <h2 :id="titleId" class="app-modal__title">{{ title }}</h2>
            <button
              class="app-modal__close"
              type="button"
              aria-label="Close dialog"
              @click="close"
            >✕</button>
          </div>
          <div class="app-modal__body">
            <slot />
          </div>
          <div v-if="$slots.actions" class="app-modal__actions">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// Reusable accessible dialog — real focus trap, Escape-to-close, scroll lock,
// and focus restoration on close. Every hand-rolled `.modal-overlay` div in
// this codebase was missing all of this; new modals should use this instead
// of copy-pasting another one-off overlay.
import { ref, computed, watch, onBeforeUnmount, useId } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  // 'sm' | 'md' | 'lg'
  size: { type: String, default: 'md' },
  // Set false for destructive/multi-step flows where an accidental outside
  // click or Escape shouldn't silently discard user input.
  closeOnOverlay: { type: Boolean, default: true },
  closeOnEscape: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const dialogEl = ref(null)
const titleId = useId()
let lastFocused = null
let overlayMousedownTarget = null

const close = () => emit('close')

// mousedown/mouseup pairing (not a plain @click.self) so a drag that starts
// inside the dialog and is released over the backdrop — e.g. selecting text
// and overshooting — doesn't close the modal out from under the user.
const onOverlayMousedown = (e) => { overlayMousedownTarget = e.target }
const onOverlayMouseup = (e) => {
  if (props.closeOnOverlay && e.target === e.currentTarget && overlayMousedownTarget === e.currentTarget) {
    close()
  }
  overlayMousedownTarget = null
}

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const onKeydown = (e) => {
  if (e.key === 'Escape' && props.closeOnEscape) {
    e.stopPropagation()
    close()
    return
  }
  if (e.key !== 'Tab' || !dialogEl.value) return
  const focusable = Array.from(dialogEl.value.querySelectorAll(focusableSelector))
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

// Some callers wrap this component in their own `v-if` instead of toggling
// the `open` prop (e.g. `<AppModal v-if="show" :open="true" @close="...">`)
// — in that pattern `open` never actually transitions to false, the whole
// component just unmounts. Both paths need the same cleanup, so it lives in
// one function called from the watcher AND onBeforeUnmount.
const cleanupOnClose = () => {
  document.body.style.overflow = ''
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus()
  lastFocused = null
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    lastFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    await nextRender()
    const focusable = dialogEl.value?.querySelectorAll(focusableSelector)
    ;(focusable?.[0] || dialogEl.value)?.focus()
  } else {
    cleanupOnClose()
  }
}, { immediate: true })

function nextRender() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

onBeforeUnmount(() => {
  if (props.open) cleanupOnClose()
})
</script>

<style scoped>
.app-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.app-modal {
  background: var(--surface, #fff);
  border-radius: var(--rl, 16px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  outline: none;
}

.app-modal--sm { max-width: 400px; }
.app-modal--md { max-width: 560px; }
.app-modal--lg { max-width: 800px; }

.app-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.app-modal__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.app-modal__close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--ink-2);
  cursor: pointer;
  padding: 4px 8px;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r, 8px);
  transition: all 0.15s;
}

.app-modal__close:hover {
  background: var(--bg);
  color: var(--ink);
}

.app-modal__close:focus-visible {
  box-shadow: 0 0 0 3px rgba(78, 255, 197, 0.35);
}

.app-modal__body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.app-modal__actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.app-modal-fade-enter-active,
.app-modal-fade-leave-active {
  transition: opacity 0.15s ease;
}

.app-modal-fade-enter-from,
.app-modal-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .app-modal-fade-enter-active,
  .app-modal-fade-leave-active {
    transition: none;
  }
}
</style>
