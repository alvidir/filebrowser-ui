<script setup lang="ts">
import { inject } from "vue";
import Warning from "@/domain/warning";

interface WarningCtrl {
  all: () => Array<Warning>;
  remove: (index: number) => void;
}

const warningCtrl = inject<WarningCtrl>("warningCtrl");
</script>

<template>
  <div id="warning-list">
    <transition-group name="list">
      <notice-card
        v-for="(warning, index) in warningCtrl?.all()"
        :key="warning"
        v-bind="warning"
        @close="warningCtrl?.remove(index)"
        closeable
      />
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
@import "fibonacci-styles";

#warning-list {
  position: absolute;
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
