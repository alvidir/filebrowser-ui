import { createApp } from "vue";
import App from "./App.vue";
import { include as includeFields } from "vue-fields/src/main";
import { include as includeDock } from "vue-dock/src/main";
import { include as includeButtons } from "vue-buttons/src/main";

const app = createApp(App);
includeButtons(app);
includeFields(app);
includeDock(app);

app.mount("#app");
