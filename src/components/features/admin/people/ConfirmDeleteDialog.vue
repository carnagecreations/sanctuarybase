<template>
  <AppModal :open="true" title="Remove person?" size="sm" @close="$emit('cancel')">
    <p class="confirm-message">Remove {{ person.name }} from the CRM? This action cannot be undone.</p>
    <template #actions>
      <AppButton variant="secondary" @click="$emit('cancel')">Cancel</AppButton>
      <AppButton variant="primary" @click="$emit('confirm')">Remove</AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import { AppButton, AppModal } from '../../../ui'

defineProps({
  person: { type: Object, required: true },
})

defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
.confirm-message {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.5;
  margin: 0;
}
</style>
