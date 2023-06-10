<script setup lang="ts">
import { useWarningStore } from "@/stores/warning";
const warningStore = useWarningStore();
</script>

<template>
  <div id="warning-list">
    <transition-group name="list">
      <notice-card
        v-for="warning in warningStore.warnings"
        :key="warning"
        v-bind="warning"
        @close="warningStore.remove(warning)"
        closeable
      />
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
@import "fibonacci-styles";

#warning-list {
  position: fixed;
  width: fit-content;
  margin: $fib-7 * 1px;
  right: 0;
  z-index: 2;

  .notice-card {
    width: $fib-13 * 1px;

    &:not(:first-child) {
      margin-top: $fib-6 * 1px;
    }
  }
}

.list-move {
  transition: transform $slower-fade;
}

.list-enter-active,
.list-leave-active {
  transition: all $slower-fade;
}

.list-enter-from {
  opacity: 0;
  transform: translateX($fib-7 * 1px);
}

.list-leave-to {
  opacity: 0;
}
</style>
