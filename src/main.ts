import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { setupStore } from "@/views/flyflow/stores/store";
import { setupDirective } from "@/directive";

import "@/permission";
// import Vconsole from 'vconsole' // 引入 vconsole
// new Vconsole() //
// 本地SVG图标
import "virtual:svg-icons-register";

// 国际化
import i18n from "@/lang/index";

import { ElLoading } from 'element-plus'

// 设置icon
import installIcon from '@/views/flyflow/utils/icon'



// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

//打印
import print  from 'vue3-print-nb'


const app = createApp(App);




app.use(print)
// 全局注册 自定义指令(directive)
setupDirective(app);
// 全局注册 状态管理(store)
setupStore(app);

app.use(router)
	.use(installIcon) // 注册全局图标
	.use(i18n).mount("#app");

app.directive("focus", {
  mounted(el) {
    el.focus();
  },
});
app.directive("enterNumber", {
  mounted(el, { value = 100 }, vnode) {
    el = el.nodeName == "INPUT" ? el : el.children[0];
    var RegStr =
      value == 0
        ? `^[\\+\\-]?\\d+\\d{0,0}`
        : `^[\\+\\-]?\\d+\\.?\\d{0,${value}}`;
    el.addEventListener("input", function () {
      el.value = el.value.match(new RegExp(RegStr, "g"));
      el.dispatchEvent(new Event("input"));
    });
  },
});

