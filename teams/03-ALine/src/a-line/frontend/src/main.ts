import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import i18n from "./lang/index";

import App from "./App.vue";
import router from "./router";
// import "ant-design-vue/dist/antd.css";
import 'ant-design-vue/dist/antd.variable.min.css';
import "./design/app.less";

import DefaultLayout from "./layout/default/index.vue";
import Null from "./layout/null/index.vue";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);
app.use(i18n);

app.component("layout-default", DefaultLayout);
app.component("layout-null", Null);

app.mount("#app");
