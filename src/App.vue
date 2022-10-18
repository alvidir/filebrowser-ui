<template>
  <dock id="sidenav" :active="true" :position="'left'">
    <dock-item id="0" placeholder="first item"><label>Aa</label></dock-item>
    <dock-item id="1" placeholder="second item"><label>Bb</label></dock-item>
    <dock-item id="2" placeholder="third item"><label>Cc</label></dock-item>
    <dock-item id="3" placeholder="fourth item"><label>Dd</label></dock-item>
    <dock-item id="4" placeholder="fifth item"><label>Ee</label></dock-item>
    <dock-item id="5" placeholder="sixth item"><label>Ff</label></dock-item>
    <dock-separator></dock-separator>
    <dock-item id="6" placeholder="seventh item"><label>Gg</label></dock-item>
  </dock>
  <div id="main-container">
    <div class="narrowed">
      <div id="actions-container">
        <search-field id="search-field" :placeholder="'Search'" large />
        <span id="action-buttons">
          <submit-button>
            <i class="bx bxs-bulb"></i>
            {{ NEW_DIRECTORY }}
          </submit-button>
          <regular-button>
            <i class="bx bxs-file-plus"></i>
            {{ NEW_FILE }}
          </regular-button>
          <regular-button>
            <i class="bx bxs-folder-plus"></i>
            {{ NEW_FOLDER }}
          </regular-button>
        </span>
      </div>

      <div id="files-view">
        <dir-list :files="files" path="path/to/directory" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Filebrowser from "@/filebrowser.service";
import { Error, Directory } from "@/model";
import DirList from "@/components/DirList.vue";
import { GetDefaultTheme } from "fibonacci-styles/util";

const FilebrowserService = new Filebrowser(process.env.VUE_APP_FILEBROWSER_URI);
const NEW_DIRECTORY = "New directory";
const NEW_FILE = "New file";
const NEW_FOLDER = "New folder";

export default defineComponent({
  name: "App",
  components: {
    DirList,
  },

  setup() {
    return {
      NEW_DIRECTORY,
      NEW_FILE,
      NEW_FOLDER,
    };
  },

  data() {
    return {
      files: [
        { name: "second file", isDir: false, updatedAt: Date.now() },
        { name: "first file", isDir: false, updatedAt: Date.now() },
        {
          name: "third file",
          isDir: false,
          updatedAt: Date.now(),
          tags: ["first tag", "second tag"],
        },
        {
          name: "first folder",
          isDir: true,
          updatedAt: Date.now(),
          size: { value: 3, unit: "items" },
          tags: ["another tag"],
        },
        {
          name: "second folder",
          isDir: true,
          updatedAt: Date.now(),
          size: { value: 10, unit: "items" },
        },
      ],
    };
  },

  methods: {},

  mounted() {
    GetDefaultTheme(process.env.VUE_APP_THEME_STORAGE_KEY);
    FilebrowserService.getDirectory()
      .then((dir: Directory) => console.log("got directory: ", dir))
      .catch((err: Error) => console.log("got error: ", err))
      .finally(() => console.log("done."));
  },
});
</script>

<style lang="scss">
@import "fibonacci-styles";

* {
  @extend .theme-dark;
  margin: 0;
  padding: 0;
  font-family: "Raleway", Helvetica, Arial, sans-serif;
}

body {
  background: var(--color-background-secondary);
}

#sidenav {
  z-index: 2;
}

#main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: fit-content;
  width: 100%;

  .narrowed {
    width: $fib-13 * 3px;
    padding: 0 $fib-6 * 1px;
  }
}

#actions-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $fib-11 * 1px 0;
  min-width: fit-content;
}

#search-field {
  width: $fib-14 * 1px;
  z-index: 1;
}

#action-buttons {
  display: flex;
  justify-content: center;
  margin-top: $fib-8 * 1px;
  white-space: nowrap;
  width: 40%;
  min-width: fit-content;

  button {
    &:not(:first-child) {
      margin-left: $fib-5 * 1px;

      i {
        font-size: $fib-7 * 1px;
        color: var(--color-secondary-text);
        padding-right: $fib-6 * 1px;
      }
    }

    &.submit {
      background: var(--color-accent);
      border: none;
    }
  }
}

#files-view {
  margin: $fib-9 * 1px;
  margin-top: none;
}

#app {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>
