<script setup lang="ts">
import { defineProps } from "vue";

interface Props {
  name?: string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="file-tag" :class="{ 'custom-color': !!color }" @click.stop>
    <label class="round-corners fib-5">
      {{ name }}
    </label>
    <regular-card v-if="title">
      <div class="tag-info">
        <span>
          <i v-if="icon" :class="icon"></i>
          &nbsp; {{ title }}
        </span>
        <small> {{ description }} </small>
      </div>
    </regular-card>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

$text-color: v-bind(color);

.theme-light .custom-color label {
  border: 1px solid $text-color;
}

.file-tag {
  width: fit-content;

  &:hover .regular-card:not(:hover) {
    transition-delay: $fib-9 * 0.01s;
    transition-property: visibility;
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
    transition: background $medium-fade;
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

    a {
      &:not(:hover) {
        color: var(--color-text-secondary);
      }
    }

    i {
      color: $text-color;
      font-size: large;
    }

    img {
      max-height: $fib-7 * 1px;
      margin-right: $fib-5 * 1px;
      filter: invert(56%) sepia(13%) saturate(1160%) hue-rotate(292deg)
        brightness(90%) contrast(100%);
    }

    .tag-info {
      display: flex;
      flex-direction: column;
    }

    span {
      display: flex;
      align-items: center;
      font-weight: 600;
    }

    small {
      margin-top: $fib-6 * 1px;
      color: var(--color-text-secondary);
    }
  }
}
</style>
