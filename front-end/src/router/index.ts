import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import Search from '@/components/Search.vue';
import Individual from '@/components/Individual.vue';
import Colophon from '@/components/Colophon.vue';
import PrefaceAndPostscript from '@/components/PrefaceAndPostscript.vue';
import Story from '@/components/Story.vue';
import Login from '@/components/Login.vue';
import Overview from '@/components/Overview.vue';
import Origination from '@/components/Origination.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false, layout: 'default' }, // 不需要授权
  },
  {
    path: '/search',
    name: 'Search',
    component: Search,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/individual',
    name: 'Individual',
    component: Individual,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/colophon',
    name: 'Colophon',
    component: Colophon,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/preface-and-postscript',
    name: 'PrefaceAndPostscript',
    component: PrefaceAndPostscript,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/story',
    name: 'Story',
    component: Story,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权 
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
  {
    path: '/origination',
    name: 'Origination',
    component: Origination,
    meta: { requiresAuth: false, layout: 'none' }, // 不需要授权
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否登录，这里简单使用 localStorage 模拟
    if (!localStorage.getItem('user')) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;