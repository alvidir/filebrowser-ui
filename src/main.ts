import { createApp } from "vue";
import App from "./App.vue";
import includeFields from "vue-fields/src/main";
import includeButtons from "vue-buttons/src/main";
import includeCards from "vue-cards/src/main";
import includeMenus from "vue-menus/src/main";

const app = createApp(App);
includeCards(app);
includeButtons(app);
includeFields(app);
includeMenus(app);

app.mount("#app");
