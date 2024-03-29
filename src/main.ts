import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import includeFields from "vue-fields/src/main";
import includeButtons from "vue-buttons/src/main";
import includeCards from "vue-cards/src/main";
import includeMenus from "vue-menus/src/main";
import includeProfile from "vue-profile/src/main";
import includeDirectives from "vue-directives/src/main";

const app = createApp(App);
includeDirectives(app);
includeCards(app);
includeButtons(app);
includeProfile(app);
includeFields(app);
includeMenus(app);

const pinia = createPinia();
app.use(pinia);

app.mount("#app");
