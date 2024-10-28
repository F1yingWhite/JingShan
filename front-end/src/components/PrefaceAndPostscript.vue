<template>
  <div class="background-color"></div>

  <div class="container">
    <!-- 左边的组件 -->
    <div class="colophon">
      <div class="info">
        <div class="flex-container">
          <div class="flex-container-left">
            <h1>序跋篇名</h1>
            <h2>{{ prefaceAndPostscriptTitle }}</h2>
          </div>
          <div class="flex-container-right">
            <h1>典籍</h1>
            <h2>{{ prefaceAndPostscriptClassic }}</h2>
          </div>
        </div>
      </div>
      <br>
      <hr class="divider">
      <div class="info">
        <div class="flex-container">
          <div class="flex-container-left">
            <h1>作者</h1>
            <h2>{{ prefaceAndPostscriptAuthor }}</h2>
          </div>
          <div class="flex-container-right">
            <h1>经译者</h1>
            <h2>{{ prefaceAndPostscriptTranslator }}</h2>
          </div>
        </div>
      </div>
      <br>
      <hr class="divider">
      <div class="info">
        <div class="flex-container">
          <div class="flex-container-left">
            <h1>类别</h1>
            <h2>{{ prefaceAndPostscriptCategory }}</h2>
          </div>
          <div class="flex-container-right">
            <h1>朝代</h1>
            <h2>{{ prefaceAndPostscriptDynasty }}</h2>
          </div>
        </div>
      </div>
      <br>
      <hr class="divider">
      <div class="info">
        <div class="flex-container">
          <div class="flex-container-left">
            <h1>册</h1>
            <h2>{{ prefaceAndPostscriptCopyId }}</h2>
          </div>
          <div class="flex-container-right">
            <h1>页</h1>
            <h2>{{ prefaceAndPostscriptPageId }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- 右边的组件 -->
    <div class="pdf-viewer">
      <div id="pdf-viewer"></div>
    </div>
  </div>
</template>

<script>
import PDFObject from 'pdfobject';
import apiClient from '../services/data_service';
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'PrefaceAndPostscript',
  setup() {
    const prefaceAndPostscriptTitle = ref('');
    const prefaceAndPostscriptClassic = ref('');
    const prefaceAndPostscriptAuthor = ref('');
    const prefaceAndPostscriptTranslator = ref('');
    const prefaceAndPostscriptCategory = ref('');
    const prefaceAndPostscriptDynasty = ref('');
    const prefaceAndPostscriptCopyId = ref('');
    const prefaceAndPostscriptPageId = ref('');

    const router = useRouter();
    const route = useRoute();
    const searchId = ref(route.query.id ? route.query.id : '');

    // PDF页数偏差值
    const pdfPageOffset = {
      '001': 6,
      '002': 0,
      '003': 0,
      '004': 0,
      '005': 0,
      '006': 0,
      '007': 0,
      '008': 0
    };

    const fetchData = () => {
      if (searchId.value) {
        apiClient.getPrefaceAndPostscript(searchId.value).then(response => {
          prefaceAndPostscriptTitle.value = response.data.title || '';
          prefaceAndPostscriptClassic.value = response.data.classic || '';
          prefaceAndPostscriptAuthor.value = response.data.author || '';
          prefaceAndPostscriptTranslator.value = response.data.translator || '';
          prefaceAndPostscriptCategory.value = response.data.category || '';
          prefaceAndPostscriptDynasty.value = response.data.dynasty || '';
          prefaceAndPostscriptCopyId.value = response.data.copy_id || '';
          prefaceAndPostscriptPageId.value = response.data.page_id || '';

          // 在数据加载成功后嵌入 PDF
          if (prefaceAndPostscriptCopyId.value && prefaceAndPostscriptPageId.value) {
            PDFObject.embed(`/assets/jingshan_scripture_preface_and_postscript/${prefaceAndPostscriptCopyId.value}.pdf`, "#pdf-viewer", {
              page: parseInt(prefaceAndPostscriptPageId.value, 10) + pdfPageOffset[prefaceAndPostscriptCopyId.value] || 1, // 如果 colophonPageId 不是数字，则默认为第一页
            });
          }
        }).catch(error => {
          console.error(error);
          prefaceAndPostscriptTitle.value = '';
          prefaceAndPostscriptClassic.value = '';
          prefaceAndPostscriptAuthor.value = '';
          prefaceAndPostscriptTranslator.value = '';
          prefaceAndPostscriptCategory.value = '';
          prefaceAndPostscriptDynasty.value = '';
          prefaceAndPostscriptCopyId.value = '';
          prefaceAndPostscriptPageId.value = '';
        });
      }
    };

    // const queryParams = new URLSearchParams(window.location.search);
    // const copyId = queryParams.get('copyid') || '001';
    // const pageId = queryParams.get('pageid') || 3;
    // const pdfPath = `/assets/jingshan_scripture_colophon/${colophonCopyId.value}.pdf`;

    onMounted(() => {
      fetchData();
    });

    return {
      prefaceAndPostscriptTitle,
      prefaceAndPostscriptClassic,
      prefaceAndPostscriptAuthor,
      prefaceAndPostscriptTranslator,
      prefaceAndPostscriptCategory,
      prefaceAndPostscriptDynasty,
      prefaceAndPostscriptCopyId,
      prefaceAndPostscriptPageId,
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

.pdf-viewer {
  flex: 1;
  height: 100%;
  position: relative;
}

#pdf-viewer {
  width: 100%;
  height: 100%;
}

/* 内容区域样式 */
.title,
.info h1 {
  color: #987444; /* 标题颜色 */
  font-size: 1.7rem; /* 标题大小 */
  margin-bottom: 1rem; /* 标题与内容的间距 */
  text-decoration: underline;
}

.info h2 {
  /* color: #2e2710; */
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem; /* 子标题与列表的间距 */
  font-weight: lighter;
}

.flex-container {
  display: flex; /* 使用Flexbox布局 */
  justify-content: space-between; /* 子元素之间的间距 */
  align-items: center; /* 垂直居中对齐 */
}

.flex-container-left {
  flex: 0 0 calc(50% - 10px); /* 占据左侧50%的宽度，减去间隔 */
  text-align: left; /* 左对齐 */
  margin-right: 10px; /* 右侧间隔 */
}

.flex-container-right {
  flex: 0 0 calc(50% - 10px); /* 占据右侧50%的宽度，减去间隔 */
  text-align: left; /* 左对齐 */
  margin-left: 10px; /* 左侧间隔 */
}

/* 分隔线样式 */
.divider, .relation-divider {
  width: 100%; /* 分隔线的宽度 */
  border: 0; /* 移除边框 */
  height: 5px; /* 分隔线的高度 */
  background-color: #e7ded0; /* 分隔线的颜色 */
  margin: 1rem 0; /* 分隔线与内容的间距 */
}

.relation-divider {
  background-color: #d8d8d8;
  height: 1px; /* 每组信息间分隔线的高度 */
}

/* 相关人物列表样式 */
.relation-item {
  display: inline-block; /* 使元素内联显示并允许宽度和高度属性 */
  background-color: #f0f0f0; /* 设置背景颜色 */
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd; /* 设置边框 */
  border-radius: 4px; /* 设置边框圆角 */
  box-shadow: none;
  cursor: pointer;
  text-decoration: none; /* 移除文本下划线 */
  transition: background-color 0.3s;
  color: #333; /* 设置文本颜色 */
  width: 90%;
}

.relation-item:hover {
  background-color: #f0e9d7;
}

.emphasized-text {
  font-weight: bold;
  color: #9a8d7e;
}

.detail {
  white-space: pre-wrap;
}

.result-link h3 {
  margin: 0;
  color: #7c6e60; /* 链接颜色 */
  text-decoration: none; /* 去掉下划线 */
  font-size: 1.25rem; /* 链接字体大小 */
}

p {
  margin: 0.5rem 0; /* 段落之间的间距 */
  color: black; /* 字体颜色 */
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