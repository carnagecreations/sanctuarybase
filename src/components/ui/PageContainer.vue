<template>
  <div class="page-container">
    <slot />
  </div>
</template>

<style scoped>
.page-container {
  padding: 18px;
  padding-bottom: 100px;   /* clears fixed bottom nav */
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}
</style>
