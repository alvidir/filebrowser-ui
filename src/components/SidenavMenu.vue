<template>
  <dock-menu>
    <button class="no-hover no-tooltip">
      <img
        class="logo"
        src="https://raw.githubusercontent.com/alvidir/statics/main/pictures/svg/alvidir_logo.svg"
        alt=""
      />
      <label>This tooltip is never shown</label>
    </button>
    <button @click="onClick">
      <i class="bx bxs-pyramid"></i>
      <label>Tools</label>
    </button>
    <button>
      <i class="bx bxs-trash"></i>
      <label>Trash</label>
    </button>
    <button class="flex">
      <i class="bx bx-cog"></i>
      <label>Settings</label>
      <!-- <regular-menu class="tooltip bottom delayed" active="true">
        <button>option 1</button>
        <button>option 2</button>
        <button>option 3</button>
      </regular-menu> -->
    </button>
    <span></span>
    <button>
      <img
        class="fitted larger"
        src="https://assets.rawpixel.com/cover_png_400/Y29sbGVjdGlvbi9jb3Zlci9zY3JlZW5fc2hvdF8yMDE3LTA5LTE0X2F0XzMuMTQuMTBfcG0ucG5n.png?s=GkJuAnvHugH9-RJK6N_Y0MbIdONQw8fHcH4IS33-n_E"
        alt=""
      />
      <div class="tooltip">
        <span class="title">Username</span>
        <small>Something interesting</small>
      </div>
    </button>
  </dock-menu>
</template>

<script scoped lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "SidenavMenu",
  events: [],
  props: {
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      required: true,
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "fibonacci-styles";

.column {
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  justify-content: left;
  font-weight: 600;
}

.regular-menu.tooltip {
  padding: 0px !important;
}
</style>
