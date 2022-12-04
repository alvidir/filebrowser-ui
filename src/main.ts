import { createApp } from "vue";
import App from "./App.vue";
import { include as includeFields } from "vue-fields/src/main";
import { include as includeDock } from "vue-dock/src/main";
import { include as includeButtons } from "vue-buttons/src/main";
import { include as includeCardsComponents } from "vue-cards/src/main";
import clickOutside from "./directives/ClickOutside";

const app = createApp(App);
includeCardsComponents(app);
includeButtons(app);
includeFields(app);
includeDock(app);

app.directive("click-outside", clickOutside);
app.mount("#app");
