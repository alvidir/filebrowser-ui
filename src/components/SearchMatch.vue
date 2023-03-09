<template>
  <a
    class="search-item"
    draggable="false"
    :href="href"
    :target="target"
    @click="open"
  >
    <i v-if="match.file.isDirectory()" class="bx bxs-folder"></i>
    <i v-else class="bx bx-file-blank"></i>
    <div class="details">
      <span class="name">
        <span>{{ filename[0] }}</span>
        <span class="match">{{ filename[1] }}</span>
        <span>{{ filename[2] }}</span>
      </span>
      <span>
        <span class="prefix">path:&nbsp;</span>
        <span>{{ absolutpath[0] }}</span>
        <span class="match">{{ absolutpath[1] }}</span>
        <span>{{ absolutpath[2] }}</span>
      </span>
    </div>
    <span class="flex"></span>
    <span>{{ "\u2BA8" }}</span>
  </a>
</template>

<script scoped lang="ts">
import { defineComponent, inject, PropType } from "vue";
import FileData from "@/domain/file";
import SearchMatch from "@/domain/search";
import { pathSeparator } from "@/domain/path";

interface DirectoryCtrl {
  openfile: (file: FileData) => void;
}

export default defineComponent({
  name: "SearchItem",
  props: {
    match: {
      type: Object as PropType<SearchMatch>,
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
      if (this.match.file.isDirectory()) return "#";
      return this.match.file.url() ?? "#";
    },

    target(): string | undefined {
      if (this.match.file.isDirectory()) return;
      return "_blank";
    },

    filename(): string[] {
      const absolute = this.match.file.path();
      const index = absolute.lastIndexOf(pathSeparator) + 1;
      const name = this.match.file.name;

      const before = name.substring(0, this.match.start - index);
      const after = name.substring(this.match.end - index);
      const match = name.substring(
        this.match.start - index,
        this.match.end - index
      );

      return [before, match, after];
    },

    absolutpath(): string[] {
      const absolute = this.match.file.path();
      const before = absolute.substring(0, this.match.start);
      const match = absolute.substring(this.match.start, this.match.end);
      const after = absolute.substring(this.match.end);
      return [before, match, after];
    },
  },

  methods: {
    open() {
      if (this.match.file.isDirectory()) {
        this.directoryCtrl?.openfile(this.match.file);
      }
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "fibonacci-styles";

button.item:not(:hover) > .search-item > span {
  visibility: hidden;
}

.search-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;

  & > i {
    font-size: large;
    margin-right: $fib-6 * 1px;
    margin-left: $fib-5 * 1px;
    color: var(--color-text-secondary);
  }

  & > span {
    font-size: $fib-7 * 1px;
    margin-right: $fib-6 * 1px;
    color: var(--color-accent);
    text-decoration: none;

    &.flex {
      width: 100%;
    }
  }
}

.details {
  display: flex;
  flex-direction: column;

  span {
    color: var(--color-text-secondary);
    white-space: nowrap;

    &.name {
      font-size: larger;
      min-width: fit-content;
    }

    &.match {
      color: var(--color-accent);
    }

    &.prefix {
      font-weight: 600;
    }
  }
}
</style>
