<template>
  <div>
    <regular-button>
      <i class="bx bxs-folder-plus"></i>
      {{ NEW_FOLDER }}
    </regular-button>
    <regular-card>
      <template #header>
        <span><i class="bx bxs-folder-plus"></i>&nbsp; Add a new folder</span>
        <small
          >It will be created at
          <a href="#">{{ path }}</a>
        </small>
      </template>
      <regular-field placeholder="folder name"></regular-field>
      <template #footer>
        <regular-button>Cancel</regular-button>
        <submit-button>Create</submit-button>
      </template>
    </regular-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

const NEW_FOLDER = "New folder";

export default defineComponent({
  name: "NewFolder",
  events: [],
  props: {
    path: String,
  },

  setup() {
    return {
      NEW_FOLDER,
    };
  },

  data() {
    return {};
  },

  computed: {},

  methods: {},
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "fibonacci-styles";

.regular-card {
  @extend .shadow-box;

  position: absolute;
  margin-top: $fib-5 * 1px;
  min-width: $fib-13 * 1px;

  a {
    &:not(:hover) {
      color: var(--color-text-secondary);
    }
  }

  i {
    color: var(--color-text-secondary);
  }
}
</style>
