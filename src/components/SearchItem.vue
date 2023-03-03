<template>
  <div class="search-item" @click="open()">
    <i v-if="file.isDirectory()" class="bx bxs-folder"></i>
    <i v-else class="bx bx-file-blank"></i>
    <div class="details">
      <span class="title">{{ file.name }}</span>
      <span>{{ absolutpath }}</span>
    </div>
    <span class="flex"></span>
    <a :href="href" target="_blank" class="bx bx-link-external"></a>
  </div>
</template>

<script scoped lang="ts">
import { defineComponent, inject, PropType } from "vue";
import FileData from "@/domain/file";
import urlJoin from "url-join";

interface DirectoryCtrl {
  openfile: (file: FileData) => void;
}

export default defineComponent({
  name: "SearchItem",
  props: {
    file: {
      type: Object as PropType<FileData>,
      required: true,
    },
  },

  setup() {
    return {
      directoryCtrl: inject<DirectoryCtrl>("directoryCtrl"),
    };
  },

  computed: {
    href(): string {
      if (this.file.isDirectory()) return "#";
      return this.file.url() ?? "#";
    },

    target(): string | undefined {
      if (this.file.isDirectory()) return;
      return "_blank";
    },

    absolutpath(): string {
      return urlJoin("root", this.file.path());
    },
  },

  methods: {
    open() {
      this.directoryCtrl?.openfile(this.file);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "fibonacci-styles";

button.item:not(:hover) > .search-item a {
  visibility: hidden;
}

.search-item {
  display: flex;
  flex-direction: row;
  align-items: center;

  .details {
    display: flex;
    flex-direction: column;
  }

  i,
  a {
    font-size: $fib-7 * 1px;
    margin-right: $fib-6 * 1px;
    margin-left: $fib-5 * 1px;
    color: var(--color-text-secondary);
  }

  a {
    text-decoration: none;
    color: var(--color-accent);
  }

  span {
    color: var(--color-text-secondary);
    white-space: nowrap;

    &.flex {
      width: 100%;
    }

    &.title {
      font-size: larger;
      min-width: fit-content;
      color: var(--color-accent);
    }
  }
}
</style>
