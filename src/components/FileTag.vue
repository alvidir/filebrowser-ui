<template>
  <div class="file-tag" :class="{ 'custom-color': !!color }" @click.stop>
    <label class="round-corners fib-5">
      {{ tag }}
    </label>
    <regular-card v-if="active">
      <div class="tag-info">
        <span>
          <i v-if="iconClass" :class="iconClass"></i>
          &nbsp; {{ title }}
        </span>
        <small> {{ description }} </small>
      </div>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as constants from "@/constants";

export default defineComponent({
  name: "FileTag",
  events: [],
  props: {
    tag: String,
    title: String,
    description: String,
    iconClass: String,
    color: String,
    active: Boolean,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.file-tag {
  width: fit-content;
  $text-color: v-bind(color);
  transition-delay: 10s;

  &:hover .regular-card {
    visibility: visible;
  }

  &.custom-color {
    label {
      color: $text-color;
    }

    .regular-card {
      border-color: $text-color;

      span {
        color: $text-color;
      }
    }
  }

  label {
    border: 1px solid var(--color-border-disabled);
    background: var(--color-bg-primary);
    transition: background $default-duration;
    padding: $fib-3 * 1px $fib-5 * 1px;
    font-size: small;

    &:not(:first-child) {
      margin-left: $fib-4 * 1px;
    }
  }

  .regular-card {
    @extend .shadow-box;

    position: absolute;
    margin-top: $fib-5 * 1px;
    width: $fib-13 * 1px;
    visibility: hidden;

    &:hover {
      visibility: visible;
    }

    a {
      &:not(:hover) {
        color: var(--color-text-secondary);
      }
    }

    i {
      color: var(--color-text-secondary);
      font-size: large;
    }

    .tag-info {
      display: flex;
      flex-direction: column;
    }

    span {
      font-weight: 600;
    }

    small {
      margin-top: $fib-6 * 1px;
      color: var(--color-text-secondary);
    }
  }
}
</style>
