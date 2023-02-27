<template>
  <div class="new-project-dialog" v-click-outside="close">
    <submit-button color="var(--color-accent)" @click="open">
      <i class="bx bxs-bulb"></i>
      {{ NEW_PROJECT }}
    </submit-button>
    <regular-card :class="{ active: active }" @close="close" closable>
      <template #header>
        <span class="card-title">
          <i class="bx bxs-bulb"></i>&nbsp; Start building your new project
        </span>
        <small>
          It will be created at
          <a href="#">{{ directory(path) }}</a>
        </small>
      </template>
      <div class="apps">
        <regular-button
          v-for="tool in tools"
          :key="tool.id"
          class="app"
          color="var(--color-button)"
        >
          <img :src="tool.iconUri" :alt="tool.name" />
          <small>{{ tool.name }}</small>
        </regular-button>
      </div>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import * as utils from "@/utils";
import Tool from "@/domain/tool";

export const SUBMIT_EVENT_NAME = "submit";

const NEW_PROJECT = "New project";

export default defineComponent({
  name: "NewFolder",
  events: [SUBMIT_EVENT_NAME],
  props: {
    path: {
      type: String,
      required: true,
    },
    tools: {
      type: Object as PropType<Array<Tool>>,
      required: true,
    },
  },

  setup() {
    const directory = utils.directory;

    return {
      NEW_PROJECT,
      directory,
    };
  },

  data() {
    return {
      active: false,
    };
  },

  methods: {
    open() {
      this.active = true;
    },

    close() {
      if (!this.active) return;
      this.active = false;
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.new-project-dialog {
  position: relative;

  .card-title {
    color: var(--color-accent);
  }

  .apps {
    display: grid;
    position: relative;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: $fib-6 * 1px;
  }

  button.regular.app {
    display: flex;
    flex-direction: column;
    color: var(--color-text-primary);
    position: relative;
    aspect-ratio: 1/1;
    width: 100%;
    height: auto;

    &:hover {
      background: transparent !important;
    }

    &:not(:hover) {
      border-color: transparent !important;
    }

    &:focus,
    &.off {
      border: 1px solid var(--color-border-active) !important;
    }

    img {
      height: $fib-8 * 1px;
    }

    small {
      margin-top: $fib-6 * 1px;
    }
  }

  .regular-card {
    @extend .shadow-box;

    position: absolute;
    margin-top: $fib-5 * 1px;
    min-width: $fib-13 * 1px;
    visibility: hidden;

    border-color: var(--color-accent);

    &.active {
      visibility: visible;
    }

    i {
      color: var(--color-text-secondary);
    }
  }
}
</style>
