<template>
  <div class="background-image"></div>

  <div class="search-page">
    <img src="../assets/logo.png" alt="logo" class="logo"/>
    <form @submit.prevent="handleSubmit">
      <input type="text" v-model="searchText" placeholder="输入搜索内容">
      <button type="submit">搜索</button>
    </form>
  </div>
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-left">
        <img src="../assets/cropped-eagle.png" alt="Footer Logo" />
        <p>
          InnovativE SoftwAre TechnoloGy DeveLopment CentEr,&nbsp;
          <a href="http://eagle.zju.edu.cn/" target="_blank">
            EAGLE-Lab
          </a>
        </p>
      </div>
      <div className="footer-right">
        <p>WEBSITE BY ✉︎ xlz24@163.com</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Home',
  data(): { searchText: string } {
    return {
      searchText: ''
    };
  },
  methods: {
    handleSubmit(): void {
      if (this.searchText) {
        const encodedText = encodeURIComponent(this.searchText);
        window.location.href = `/search?wd=${encodedText}`;
      }
    }
  }
});
</script>

<style scoped>
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/gate2.png');
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: -1; /* 确保背景在内容之下 */
  opacity: 0.3
}

.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* 使容器高度占满整个视口高度 */
  margin-top: -25vh; /* 向上移动25%的视口高度 */
}

.logo {
  margin-bottom: 20px;
  height: auto;
  max-width: 400px;
}

form {
  display: flex;
  height: 60px;
  width: 750px;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #8b6600;
  border-radius: 4px 0 0 4px;
  /* 移除聚焦环 */
  &:focus {
    outline: none;
  }
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #8b6600;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #cc9900;
}

.footer {
    background-color: #8b6600; /* 背景颜色 */
    width: 100%; /* 宽度为100% */
    height: 100px; /* 固定高度 */
    position: fixed;
    bottom: 0; /* 位于底部 */
    left: 0; /* 位于左侧 */
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: space-between; /* 左右两端对齐 */
    padding: 0 20px; /* 左右内边距 */
    box-sizing: border-box; /* 边框计算在宽度内 */
    color: #f5f5f5; /* 文字颜色 */
    font-size: 14px; /* 字体大小 */
}

.footer-content {
    display: flex;
    width: 100%; /* 占满整个底部宽度 */
    /* max-width: 1200px; */
    margin: 0 auto; /* 水平居中 */
    padding-top: 20px;
}

.footer-left, .footer-right {
    display: flex;
    align-items: center; /* 垂直居中 */
}

.footer-right {
    margin-left: auto; /* 将右侧内容推到容器的右侧 */
}

.footer-content img {
    width: 50px; /* 或其他尺寸 */
    height: auto; /* 保持图片比例 */
    margin-right: 10px; /* 在图片右侧添加间隔 */
}
</style>