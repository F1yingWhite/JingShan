<template>
  <div class="background-color"></div>

  <div class="overview-bar-container">
    <div class="overview-bar-left">
      <img src="../assets/cropped-eagle.png" alt="Logo" class="logo" />
      <div class="overview-buttons">
        <button @click="toggleView('colophon')">牌记</button>
        <button @click="toggleView('preface and postscript')">序跋</button>
        <button @click="toggleView('individual')">故事</button>
      </div>
    </div>

    <div class="overview-bar-right">
      <div class="user-info">
        <span v-if="isLoggedIn && userName">Hello {{ userName }}.</span>
        <span v-else>Please log in.</span>
      </div>
      <div class="nav-buttons">
        <button class="nav-button" @click="goToHome">首页</button>
        <button class="nav-button" @click="goToOverview">总览</button>
        <button class="nav-button" @click="goToOrigination">缘起</button>
        <button class="nav-button">资讯</button>
        <button class="nav-button" @click="goToLogin">登录</button>
      </div>
    </div>
  </div>

  <div class="overview-container" v-if="viewContent === 0">
    <h1>牌记总览</h1>
    <div v-if="colophonOverview.length === 0">No colophon data available.</div>
    <hr class="table-header-line" /> <!-- 添加顶部横线 -->
    <table class="list-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>内容</th>
          <th>经名</th>
          <th>卷数</th>
          <th>册数</th>
          <th>千字文</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in colophonOverview" :key="index">
          <td>{{ item.id }}</td>
          <td @click="goToColophon(item.id)" class="clickable-cell">{{ truncateContent(item.content) }}</td>
          <td>{{ item.scripture_name }}</td>
          <td>{{ item.volume_id }}</td>
          <td>{{ item.chapter_id }}</td>
          <td>{{ item.qianziwen }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <span>第 {{ showPage }} 页，共 {{ colophonLastPage }} 页</span> <!-- 显示当前页数 -->
      <button class="page-switch-button" v-if="showPage > 1" @click="goToPage(showPage - 1)">上一页</button>
      <input type="number" v-model="currentPageInput" min="1" :max="colophonLastPage" @keyup.enter="goToPageDirectly">
      <button class="page-switch-button" @click="goToPageDirectly">跳转</button>
      <button class="page-switch-button" v-if="showPage < colophonLastPage" @click="goToPage(showPage + 1)">下一页</button>
    </div>
  </div>

  <div class="overview-container" v-else-if="viewContent === 1">
    <h1>序跋总览</h1>
    <div v-if="prefaceAndPostscriptOverview.length === 0">No preface and postscript data available.</div>
    <hr class="table-header-line" /> <!-- 添加顶部横线 -->
    <table class="list-table">
      <thead>
        <tr>
          <th>序号</th>
          <th>典籍</th>
          <th>经译者</th>
          <th>序跋篇名</th>
          <th>类别</th>
          <th>朝代</th>
          <th>作者</th>
          <th>册</th>
          <th>页</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in prefaceAndPostscriptOverview" :key="index">
          <td>{{ item.id }}</td>
          <td>{{ item.classic }}</td>
          <td>{{ item.translator }}</td>
          <td @click="goToPrefaceAndPostscript(item.id)" class="clickable-cell">{{ item.title }}</td>
          <td>{{ item.category }}</td>
          <td>{{ item.dynasty }}</td>
          <td>{{ item.author }}</td>
          <td>{{ item.copy_id }}</td>
          <td>{{ item.page_id }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <span>第 {{ showPage }} 页，共 {{ prefaceAndPostscriptLastPage }} 页</span> <!-- 显示当前页数 -->
      <button class="page-switch-button" v-if="showPage > 1" @click="goToPage(showPage - 1)">上一页</button>
      <input type="number" v-model="currentPageInput" min="1" :max="prefaceAndPostscriptLastPage"
        @keyup.enter="goToPageDirectly">
      <button class="page-switch-button" @click="goToPageDirectly">跳转</button>
      <button class="page-switch-button" v-if="showPage < prefaceAndPostscriptLastPage"
        @click="goToPage(showPage + 1)">下一页</button>
    </div>
  </div>

  <div class="overview-container" v-else-if="viewContent === 2">
    <h1>佛经故事</h1>
    <div v-if="storyOverview.length === 0">No story data available.</div>
    <hr class="table-header-line" /> <!-- 添加顶部横线 -->
    <table class="list-table">
      <thead>
        <tr>
          <th>编号</th>
          <th>篇名</th>
          <th>内容</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in storyOverview" :key="index">
          <td>{{ item.id }}</td>
          <td @click="goToStory(item.id)" class="clickable-cell">{{ item.title }}</td>
          <td>{{ truncateContent(item.content) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <span>第 {{ showPage }} 页，共 {{ storyLastPage }} 页</span> <!-- 显示当前页数 -->
      <button class="page-switch-button" v-if="showPage > 1" @click="goToPage(showPage - 1)">上一页</button>
      <input type="number" v-model="currentPageInput" min="1" :max="storyLastPage" @keyup.enter="goToPageDirectly">
      <button class="page-switch-button" @click="goToPageDirectly">跳转</button>
      <button class="page-switch-button" v-if="showPage < storyLastPage" @click="goToPage(showPage + 1)">下一页</button>
    </div>
  </div>
</template>

<script>
import apiClient from '../services/data_service';
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'Overview',
  setup() {
    const colophonOverview = ref([]);
    const prefaceAndPostscriptOverview = ref([]);
    const storyOverview = ref([]);

    const colophonLastPage = ref(1); // 从后端获取总页数
    const prefaceAndPostscriptLastPage = ref(1); // 从后端获取总页数
    const storyLastPage = ref(1); // 从后端获取总页数

    const showPage = ref(1);
    const currentPageInput = ref(1); // 用于绑定输入框的页码
    const viewContent = ref(0); // 定义一个响应式变量来跟踪是否展示colophon结果

    const router = useRouter();
    const route = useRoute();

    // 初始化当前页码
    showPage.value = route.query.page ? parseInt(route.query.page) : 1;
    currentPageInput.value = showPage.value;

    const fetchData = (page) => {
      apiClient.getOverview(page).then(response => {
        if (response.data && response.data.colophon) {
          colophonOverview.value = response.data.colophon;
          colophonLastPage.value = response.data.colophon_last; // 后端返回了总页数
          prefaceAndPostscriptOverview.value = response.data.preface_and_postscript;
          prefaceAndPostscriptLastPage.value = response.data.preface_and_postscript_last; // 后端返回了总页数
          storyOverview.value = response.data.story;
          storyLastPage.value = response.data.story_last; // 后端返回了总页数
        } else {
          colophonOverview.value = [];
          prefaceAndPostscriptOverview.value = [];
          storyOverview.value = [];
        }
      }).catch(error => {
        console.error(error);
        colophonOverview.value = [];
        prefaceAndPostscriptOverview.value = [];
        storyOverview.value = [];
      });
    };

    // 在组件挂载时调用获取数据的方法
    onMounted(() => {
      fetchData(showPage.value);
    });

    // 添加一个方法来截断内容
    const truncateContent = (content) => {
      if (!content) return '';
      return content.length > 40 ? content.substring(0, 40) + '...' : content;
    };

    const goToColophon = (id) => {
      // 构建URL
      const url = `/colophon?id=${encodeURIComponent(id)}`;
      // 在新标签页中打开URL
      window.open(url, '_blank');
    };

    const goToPrefaceAndPostscript = (id) => {
      const url = `/preface-and-postscript?id=${encodeURIComponent(id)}`;
      window.open(url, '_blank');
    }

    const goToStory = (id) => {
      const url = `/story?id=${encodeURIComponent(id)}`;
      window.open(url, '_blank');
    }

    // 添加一个方法来跳转到指定页
    const goToPage = (page) => {
      if (page < 1) {
        console.error('Page number cannot be less than 1');
        return;
      }
      if ((viewContent.value === 0 && page > colophonLastPage.value) ||
        (viewContent.value === 1 && page > prefaceAndPostscriptLastPage.value) ||
        (viewContent.value === 2 && page > storyLastPage.value)) {
        console.error('Page number cannot be greater than the last page');
        return;
      }
      showPage.value = page;
      currentPageInput.value = page; // 更新输入框的页码
      router.push(`/overview?page=${encodeURIComponent(page)}`);
      fetchData(page);
    };

    // 添加一个方法来直接跳转到输入的页码
    const goToPageDirectly = () => {
      const page = parseInt(currentPageInput.value);
      if ((page >= 1 && viewContent.value === 0 && page <= colophonLastPage.value) ||
        (page >= 1 && viewContent.value === 1 && page <= prefaceAndPostscriptLastPage.value) ||
        (page >= 1 && viewContent.value === 2 && page <= storyLastPage.value)) {
        goToPage(page);
      } else {
        console.error('Invalid page number');
      }
    };

    // 定义切换视图的方法
    const toggleView = (view) => {
      viewContent.value = view === 'colophon' ? 0 :
        view === 'preface and postscript' ? 1 : 2;
      goToPage(1);
    };

    // 定义跳转到首页的方法
    const goToHome = () => {
      router.push('/');
    };

    const goToOverview = () => {
      router.push('/overview?page=1');
    }

    const goToOrigination = () => {
      router.push('/origination');
    }

    const goToLogin = () => {
      router.push('/login'); // 导航到根路径
    };

    return {
      colophonOverview,
      prefaceAndPostscriptOverview,
      storyOverview,
      colophonLastPage,
      prefaceAndPostscriptLastPage,
      storyLastPage,
      viewContent,
      truncateContent,
      toggleView,
      goToHome,
      goToOverview,
      goToOrigination,
      goToLogin,
      goToColophon,
      goToPrefaceAndPostscript,
      goToStory,
      goToPage,
      showPage,
      currentPageInput, // 将输入框的页码绑定到这个变量
      goToPageDirectly
    };
  },
});
</script>

<style scoped>
.background-color {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  background-color: #faf8f5;
  /* background-color: #39c5bb; */
  z-index: -1;
  /* 确保背景在内容之下 */
}

/* 搜索框容器样式 */
.overview-bar-container {
  position: fixed;
  /* 固定定位 */
  top: 0;
  /* 距离顶部0 */
  left: 0;
  /* 距离左侧0 */
  width: 100%;
  /* 宽度占满整个屏幕 */
  height: 50px;
  /* 根据需要调整高度 */
  background-color: #e7ded0;
  padding: 10px 0;
  /* 上下填充 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  /* 可选：添加阴影效果 */
  z-index: 1000;
  /* 确保在最上层 */
  display: flex;
  /* 使用flex布局 */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
}

.overview-bar-left {
  display: flex;
  /* 使用flex布局 */
  align-items: center;
  /* 垂直居中对齐子元素 */
  margin-right: 20%;
}

.overview-bar-right {
  display: flex;
  /* 使用flex布局 */
  align-items: center;
  /* 垂直居中对齐子元素 */
  margin-left: 5%;
}

/* 搜索框样式 */
.overview-bar {
  flex: 1;
  /* 使搜索框占据剩余空间 */
  display: flex;
  /* 使用flex布局 */
  align-items: center;
  /* 垂直居中 */
  padding: 0 20px;
  /* 根据需要调整内边距 */
  min-width: 400px;
  max-width: 600px;
}

/* Logo样式 */
.logo {
  margin-left: 10px;
  /* 距离容器左侧20px */
  margin-right: 20px;
  height: 70px;
  /* 根据实际尺寸调整 */
  padding-bottom: 10px
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 10px;
  /* 用户名与图标的间距 */
}

.overview-buttons {
  display: flex;
  gap: 10px;
  /* 设置按钮之间的间距 */
}

.overview-buttons button {
  width: 80px;
  height: 40px;
  padding: 5px 10px;
  /* 按钮内填充 */
  background-color: #8b6600;
  /* 按钮背景颜色 */
  color: white;
  /* 按钮文字颜色 */
  border: none;
  /* 移除边框 */
  border-radius: 4px;
  /* 按钮圆角 */
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s;
  /* 背景颜色渐变效果 */
}

.overview-buttons button:hover {
  background-color: #cc9900;
  /* 鼠标悬停时的背景颜色 */
}

.nav-buttons {
  display: flex;
  gap: 10px;
  /* 设置按钮之间的间距 */
}

.nav-buttons button {
  padding: 5px 10px;
  /* 按钮内填充 */
  background-color: #8b6600;
  /* 按钮背景颜色 */
  color: white;
  /* 按钮文字颜色 */
  border: none;
  /* 移除边框 */
  border-radius: 4px;
  /* 按钮圆角 */
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s;
  /* 背景颜色渐变效果 */
  width: 60px;
  height: 40px;
}

.nav-buttons button:hover {
  background-color: #cc9900;
  /* 鼠标悬停时的背景颜色 */
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

.overview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 70px;
}

h1 {
  color: #987444;
  font-size: 2.5rem;
  /* 字体大小 */
}

.list-table {
  width: 100%;
  border-collapse: collapse;
}

.list-table th,
.list-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  /* 保留横向边框 */
}

.list-table th {
  background-color: #f2f2f2;
}

.list-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.list-table tr:hover {
  background-color: #f1f1f1;
}

.list-table .clickable-cell {
  cursor: pointer;
  color: #987444;
  /* 修改为与标题颜色一致 */
}

.list-table .clickable-cell:hover {
  background-color: #e9e9e9;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

/* 分页按钮特定的样式，提高了特异性 */
.pagination .page-switch-button {
  margin: 0 10px;
  /* 分页按钮的外边距 */
  background-color: #987444;
  /* 分页按钮的背景颜色，与通用按钮颜色区分 */
  border-radius: 4px;
  /* 分页按钮的圆角 */
}

/* 分页按钮悬浮状态下的样式 */
.pagination .page-switch-button:hover {
  background-color: #a58b61;
  /* 分页按钮悬浮状态下的背景颜色 */
}

input[type="number"] {
  margin: 0 10px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-header-line {
  border: 0;
  height: 4px;
  /* 调整横线的高度 */
  background-color: #987444;
  /* 调整横线的颜色 */
  width: 100%;
  /* 使横线填满整个容器宽度 */
}
</style>