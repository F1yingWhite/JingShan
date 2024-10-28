import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index'; // 引入路由配置

const app = createApp(App, { strict: false });
app.use(router);
app.mount('#app');