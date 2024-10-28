<template>
  <div class="background-color"></div>

  <div class="container" v-if="!isLoading">
    <!-- 左边的组件 -->
    <div class="colophon">
      <div class="title">{{ storyTitle }}</div>
      <hr class="divider">
      <div class="content-container">{{ storyContent }}</div>
    </div>

    <!-- 右边的组件 -->
    <div class="image-viewer" v-if="imageUrl">
      <img :src="imageUrl" alt="在线生成中..." />
    </div>
  </div>

  <!-- 加载中的提示 -->
  <div v-else class="loading">加载中...</div>
</template>

<script>
import apiClient from '../services/data_service';
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'Story',
  setup() {
    const storyTitle = ref('');
    const storyContent = ref('');
    const imageUrl = ref('');
    const isLoading = ref(true); // 加载状态

    const router = useRouter();
    const route = useRoute();
    const searchId = ref(route.query.id || '');

    const fetchData = async () => {
      if (searchId.value) {
        isLoading.value = true; // 开启加载状态
        try {
          const response = await apiClient.getStory(searchId.value);
          console.log(response)
          storyTitle.value = response.data.title || '';
          storyContent.value = response.data.content || '';
          imageUrl.value = `data:image/gif;base64,${response.data.image}`;
          console.log("Content为",storyContent.value)
        } catch (error) {
          console.error(error);
          storyTitle.value = '';
          storyContent.value = '';
          imageUrl.value = '';
        } finally {
          isLoading.value = false; // 数据加载完毕后关闭加载状态
        }
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      storyTitle,
      storyContent,
      imageUrl,
      isLoading, // 将 isLoading 返回以便模板中使用
      fetchData,
    };
  },
});
</script>


<style scoped>
.container {
  width: 100%;
  display: flex;
  height: calc(100vh - 70px); /* 减去导航栏的高度 */
  padding-top: 70px; /* 为内容添加顶部内边距 */
  position: fixed;
}

.colophon {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  padding-left: 60px;
  padding-right: 60px;
}

/* 内容区域样式 */
.title {
  color: #987444; /* 标题颜色 */
  font-size: 2.5rem; /* 标题大小 */
  margin-top: 2rem;
  font-weight: bold;
  text-align: center; /* 将此行添加到 h2 标签的样式中 */
}

/* 分隔线样式 */
.divider {
  width: 100%; /* 分隔线的宽度 */
  border: 0; /* 移除边框 */
  height: 5px; /* 分隔线的高度 */
  background-color: #e7ded0; /* 分隔线的颜色 */
  margin: 1rem 0; /* 分隔线与内容的间距 */
}

.content-container {
  width: auto;
  margin: 20px auto;
  padding-top: 30px; /* 上边距 */
  padding-bottom: 30px; /* 下边距 */
  padding-left: 50px; /* 左边距 */
  padding-right: 50px; /* 右边距 */
  background-color: #faf8f5;
  border-radius: 8px;
  /* box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
}

.image-viewer {
  flex: 1;
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 高度填满容器 */
  max-width: 100%; /* 最大宽度不超过容器宽度 */
  max-height: 100%; /* 最大高度不超过容器高度 */
  overflow: hidden; /* 如果图片超出容器，隐藏超出部分 */
  position: relative; /* 相对定位，用于绝对定位图片 */
}

.image-viewer img {
  width: 100%; /* 图片宽度自动 */
  height: auto; /* 高度自动，以保持图片比例 */
  max-width: 100%; /* 最大宽度不超过容器宽度 */
  max-height: 100%; /* 最大高度不超过容器高度 */
  object-fit: contain; /* 保持图片比例，图片可能会超出容器 */
}

/* 背景颜色样式 */
.background-color {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #faf8f5;
  z-index: -1;
}
</style>