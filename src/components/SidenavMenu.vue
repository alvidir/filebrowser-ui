<template>
  <dock-menu>
    <button class="no-hover no-tooltip">
      <img
        class="logo"
        src="https://raw.githubusercontent.com/alvidir/statics/main/pictures/svg/alvidir_logo.svg"
        alt=""
      />
    </button>
    <button v-for="tool in tools" :key="tool.name" @click="onClick(tool)">
      <i class="icon-greek-pillar-outline"></i>
      <label>Agora</label>
    </button>
    <button class="flex">
      <i class="bx bx-cog"></i>
      <label>Settings</label>
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
import { defineComponent } from "vue";
import Tool from "@/domain/tool";

export default defineComponent({
  name: "SidenavMenu",

  computed: {
    tools(): Array<Tool> {
      return Tool.all();
    },
  },

  methods: {
    onClick(tool: Tool) {
      console.log(tool.name);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
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

.icon {
  box-sizing: border-box;
  padding: 4px;
}
</style>
