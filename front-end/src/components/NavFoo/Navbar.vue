<template>
  <div class="navbar">
    <div class="nav-left">
      <h2>径山藏数字化</h2>
    </div>
    <div class="nav-right">
      <div class="navbar-content">
        <div class="user-info">
          <!-- 条件渲染用户名 -->
          <span v-if="isLoggedIn && userName">Hello {{ userName }}.</span> <!-- 用户名不为空且已登录 -->
          <span v-else>Please log in.</span> <!-- 用户名为空或未登录 -->
        </div>
        <div class="nav-buttons">
          <button @click="goToHome">首页</button> <!-- 绑定点击事件 -->
          <button @click="goToOverview">总览</button>
          <button @click="goToOrigination">缘起</button>
          <button>资讯</button>
          <button @click="goToLogin">登录</button>
          <!-- 可以继续添加更多按钮 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; // 导入 useRouter 钩子

export default {
  setup() {
    const isLoggedIn = ref(true); // 假设这是一个响应式引用，表示用户是否登录
    const userName = ref('Coca Cola'); // 假设这是用户的用户名
    const router = useRouter(); // 使用 useRouter 钩子

    // 定义跳转到首页的方法
    const goToHome = () => {
      router.push('/'); // 导航到根路径
    };

    const goToLogin = () => {
      router.push('/login'); // 导航到根路径
    };

    const goToOverview = () => {
      router.push('/overview?page=1');
    }

    const goToOrigination = () => {
      router.push('/origination');
    }

    return {
      isLoggedIn,
      userName,
      goToHome,
      goToLogin,
      goToOverview,
      goToOrigination,
    };
  }
}
</script>

<style scoped>
.navbar {
  position: fixed; /* 固定定位 */
  top: 0; /* 距离顶部0 */
  left: 0; /* 距离左侧0 */
  width: 100%; /* 宽度占满整个屏幕 */
  height: 50px;
  background-color: #e7ded0;
  padding: 10px 0; /* 上下填充 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 可选：添加阴影效果 */
  z-index: 1000; /* 确保在最上层 */
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.navbar-content {
  display: flex;
  align-items: center;
  width: 100%;
  /* max-width: 1200px; */
  margin: 0 auto; /* 水平居中 */
}

.nav-left, .nav-right {
  display: flex;
  align-items: center; /* 垂直居中 */
}

.nav-left {
  margin-right: 25%;
}

.nav-right {
  margin-left: 25%;
}

.user-info {
  display: flex;
  align-items: center;
}
  
.user-info span {
  margin-right: 10px; /* 用户名与图标的间距 */
}

.nav-buttons {
  display: flex;
  gap: 10px; /* 设置按钮之间的间距 */
}

.nav-buttons button {
  padding: 5px 10px; /* 按钮内填充 */
  background-color: #8b6600; /* 按钮背景颜色 */
  color: white; /* 按钮文字颜色 */
  border: none; /* 移除边框 */
  border-radius: 4px; /* 按钮圆角 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s; /* 背景颜色渐变效果 */
  width: 60px;
  height: 40px;
}

.nav-buttons button:hover {
  background-color: #cc9900; /* 鼠标悬停时的背景颜色 */
}
</style>