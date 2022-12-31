import { createApp } from "vue";
import App from "./App.vue";
import { include as includeFields } from "vue-fields/src/main";
import { include as includeDock } from "vue-dock/src/main";
import { include as includeButtons } from "vue-buttons/src/main";
import { include as includeCardsComponents } from "vue-cards/src/main";
import { include as includeDirectives } from "vue-directives/src/main";

const app = createApp(App);
includeCardsComponents(app);
includeButtons(app);
includeFields(app);
includeDock(app);
includeDirectives(app);

app.mount("#app");
