<template>
  <div class="background-color"></div>

  <div class="search-bar-container">
    <div class="search-bar-left">
      <img src="../assets/cropped-eagle.png" alt="Logo" class="logo" />
      <div class="search-bar">
        <form @submit.prevent="handleSubmit">
          <input type="text" v-model="searchText" placeholder="输入搜索内容">
          <button class="default-button" type="submit">搜索</button>
        </form>
      </div>
      <div class="search-buttons">
        <button class="default-button" @click="toggleView('colophon')">牌记</button>
        <button class="default-button" @click="toggleView('preface and postscript')">序跋</button>
        <button class="default-button" @click="toggleView('individual')">人物</button>
      </div>
    </div>

    <div class="search-bar-right">
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
  <div class="search">

    <div class="search-left">
      <div class="search-content">
        <div v-if="viewContent === 0">
          <div v-if="groupedColophonResults.length > 0">
            <h2>牌记搜索结果</h2>
            <hr class="divider">
            <div v-for="result in groupedColophonResults" :key="result.scripture_name">
              <h3>{{ result.scripture_name }}</h3>
              <div v-for="(contentItem, index) in result.contents" :key="index">
                <div class="colophon-box">
                  <div v-if="contentExpandStates.get(`0-${contentItem.id}`)" class="colophon-content" @click="goToColophon(contentItem.id)">
                    <span class="emphasized-text">卷数：</span>
                    <div class="detail">{{ contentItem.volume_id }}</div>
                    <span class="emphasized-text">册数：</span>
                    <div class="detail">{{ contentItem.chapter_id }}</div>
                    <span class="emphasized-text">千字文：</span>
                    <div class="detail">{{ contentItem.qianziwen }}</div>
                    <span class="emphasized-text">牌记内容：</span>
                    <div v-html="contentItem.highlightedContent" class="detail"></div>
                  </div>
                  <div v-else class="colophon-content" @click="goToColophon(contentItem.id)">
                    <div v-html="contentItem.highlightedBrief" class="detail"></div>
                  </div>
                  <div class="toggle-button-container">
                    <button class="toggle-button" @click.prevent="toggleContent(contentItem.id)">
                      {{ contentExpandStates.get(`0-${contentItem.id}`) ? '收起' : '展开' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else>No colophon results found.</p>
        </div>
        <div v-else-if="viewContent === 1">
          <div v-if="individualResults.length > 0">
            <h2>序跋搜索结果</h2>
            <hr class="divider"> <!-- 添加模块间的分隔线 -->
            <div v-for="(contentItem, index) in prefaceAndPostscriptResults" :key="index">
              <div class="colophon-box">
                <div v-if="contentExpandStates.get(`1-${contentItem.id}`)" class="colophon-content" @click="goToPrefaceAndPostscript(contentItem.id)">
                  <span class="emphasized-title">{{ contentItem.title }}</span>
                  <hr class="content-divider">
                  <span class="emphasized-text">典籍：</span>
                  <br/>
                  <div class="detail">{{ contentItem.classic }}</div>
                  <span class="emphasized-text">经译者：</span>
                  <br/>
                  <div class="detail">{{ contentItem.translator }}</div>
                  <span class="emphasized-text">类别：</span>
                  <br/>
                  <div class="detail">{{ contentItem.category }}</div>
                  <span class="emphasized-text">朝代：</span>
                  <br/>
                  <div class="detail">{{ contentItem.dynasty }}</div>
                  <span class="emphasized-text">作者：</span>
                  <br/>
                  <div class="detail">{{ contentItem.author }}</div>
                </div>
                <div v-else class="colophon-content" @click="goToPrefaceAndPostscript(contentItem.id)">
                  <span class="emphasized-title">{{ contentItem.title }}</span>
                  <!-- <div v-html="contentItem.highlightedBrief" class="detail"></div> -->
                </div>
                <div class="toggle-button-container">
                  <button class="toggle-button" @click.prevent="toggleContent(contentItem.id)">
                    {{ contentExpandStates.get(`1-${contentItem.id}`) ? '收起' : '展开' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else>No name results found.</p>
        </div>
        <div v-else-if="viewContent === 2">
          <div v-if="individualResults.length > 0">
            <h2>人物搜索结果</h2>
            <hr class="divider"> <!-- 添加模块间的分隔线 -->
            <div v-for="(contentItem, index) in individualResults" :key="index">
              <div class="colophon-box">
                <div v-if="contentExpandStates.get(`2-${contentItem.id}`)" class="colophon-content" @click="goToIndividual(contentItem.id)">
                  <span class="emphasized-title">{{ contentItem.name }}</span>
                  <hr class="content-divider">
                  <span class="emphasized-text">活动：</span>
                  <br/>
                  <div class="detail">{{ contentItem.type }}</div>
                  <br/>
                  <span class="emphasized-text">参与经文：</span>
                  <br/>
                  <div class="detail">{{ contentItem.scripture }}</div>
                </div>
                <div v-else class="colophon-content" @click="goToIndividual(contentItem.id)">
                  <span class="emphasized-title">{{ contentItem.name }}</span>
                  <!-- <div v-html="contentItem.highlightedBrief" class="detail"></div> -->
                </div>
                <div class="toggle-button-container">
                  <button class="toggle-button" @click.prevent="toggleContent(contentItem.id)">
                    {{ contentExpandStates.get(`2-${contentItem.id}`) ? '收起' : '展开' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else>No name results found.</p>
        </div>
      </div>
    </div>

    <div class="search-right">
      <div class="chat-window">
        <div class="chat-history" v-html="chatHistory"></div>
        <div class="input-container">
          <textarea class="textarea-auto-wrap" v-model="message" @keyup.enter="sendMessage" placeholder="输入您的问题"></textarea>
          <button class="send-button" @click="sendMessage">提问</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/data_service'; // 确保路径正确

export default defineComponent({
  name: 'Search',
  setup() {
    const searchText = ref(''); // 用于绑定搜索输入框的响应式数据
    const colophonResults = ref([]); // 定义一个响应式数据属性来存储colophon部分的搜索结果数组
    const prefaceAndPostscriptResults = ref([]);
    const individualResults = ref([]); // 定义一个响应式数据属性来存储individual部分的搜索结果数组
    const viewContent = ref(0); // 定义一个响应式变量来跟踪是否展示colophon结果
    const router = useRouter(); // 使用 useRouter 钩子

    const messages = ref([]);
    const message = ref('');

    // 用于高亮牌记内容中的关键词
    const keywords = ref([]);

    // 获取路由参数
    const route = useRoute();
    searchText.value = route.query.wd ? route.query.wd : '';

    // 假设每个内容项有一个唯一的 ID
    const contentExpandStates = reactive(new Map());

    // 定义获取数据的方法
    const fetchData = () => {
      if (searchText.value) {
        keywords.value = searchText.value.split(/\s+/);
        apiClient.searchData(searchText.value).then(response => {
          if (response.data && response.data.colophon) {
            colophonResults.value = response.data.colophon;
            // 初始化展开状态
            colophonResults.value.forEach((item, index) => {
              contentExpandStates.set(`0-${item.id}`, false);
            });
          } else {
            colophonResults.value = []; // 如果没有colophon部分，清空结果
          }
          if (response.data && response.data.preface_and_postscript) {
            prefaceAndPostscriptResults.value = response.data.preface_and_postscript;
            // 初始化展开状态
            prefaceAndPostscriptResults.value.forEach((item, index) => {
              contentExpandStates.set(`1-${item.id}`, false);
            });
          } else {
            prefaceAndPostscriptResults.value = [];
          }
          if (response.data && response.data.individual) {
            individualResults.value = response.data.individual;
            // 初始化展开状态
            individualResults.value.forEach((item, index) => {
              contentExpandStates.set(`2-${item.id}`, false);
            });
          } else {
            individualResults.value = []; // 如果没有individual部分，清空结果
          }
        }).catch(error => {
          console.error(error);
          colophonResults.value = [];
          prefaceAndPostscriptResults.value = [];
          individualResults.value = [];
        });
      }
    };

    const highlightKeywords = (content, keywords) => {
      // 创建一个正则表达式，用于匹配所有单词，忽略大小写
      const regex = new RegExp(keywords.join('|'), 'gi');
      // 替换所有匹配的单词为红色样式的 HTML
      const highlightedContent = content.replace(regex, match => `<span style="color: #ddaa00; font-weight: bold;">${match}</span>`);
      return highlightedContent;
    }

    // 合并具有相同 scripture_name 的条目
    const groupedColophonResults = computed(() => {
      return colophonResults.value.reduce((acc, curr) => {
        const existing = acc.find(item => item.scripture_name === curr.scripture_name);
        if (existing) {
          existing.contents.push({
            ...curr,
            highlightedContent: highlightKeywords(curr.content, keywords.value),
            highlightedBrief: highlightKeywords(curr.brief, keywords.value)
          });
        } else {
          acc.push({ scripture_name: curr.scripture_name,
                     contents: [{
                      ...curr,
                      highlightedContent: highlightKeywords(curr.content, keywords.value),
                      highlightedBrief: highlightKeywords(curr.brief, keywords.value)
                    }] });
        }
        return acc;
      }, []);
    });

    const toggleContent = (colophonId) => {
      const key = `${viewContent.value}-${colophonId}`;
      contentExpandStates.set(key, !contentExpandStates.get(key));
    };

    // 定义跳转到对应 colophon 的方法
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

    const goToIndividual = (id) => {
      const url = `/individual?id=${encodeURIComponent(id)}`;
      window.open(url, '_blank');
    };

    // 定义提交搜索请求的方法
    const handleSubmit = () => {
      if (searchText.value) {
        const encodedText = encodeURIComponent(searchText.value);
        window.location.href = `/search?wd=${encodedText}`;
      }
    };

    // 定义切换视图的方法
    const toggleView = (view) => {
      viewContent.value = view === 'colophon' ? 0 :
                          view === 'preface and postscript' ? 1 : 2;
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

    // const chatHistory = computed(() => {
    //   return messages.value.map((msg, index) => `<p>${msg}</p>`).join('');
    // });

    const chatHistory = computed(() => {
      // 使用 map 方法遍历 messages 数组
      return messages.value.map((msg, index) => {
        // 检查消息是用户发送的还是助手回复的
        if (msg.role === 'user') {
          return `<p>用户: ${msg.content}</p>`;
        } else if (msg.role === 'assistant') {
          return `<p>助手: ${msg.content}</p>`;
        }
        // 如果消息格式未知，返回一个空字符串
        return '';
      }).join('');
    });

    const sendMessage = async () => {
      const question = message.value;
      message.value = '';

      if (question.trim() === '') return;

      messages.value.push({'role': 'user', 'content': question});
      try {
        const response = await apiClient.postAnswer(messages.value);
        const answer = response.data && response.data.answer ? response.data.answer : '';
        messages.value.push({'role': 'assistant', 'content': answer});
        console.log(answer);
      } catch (error) {
        console.error(error);
        messages.value.push({'role': 'assistant', 'content': 'Error getting response.'});
      }
    };

    // 在组件挂载时调用获取数据的方法
    onMounted(() => {
      fetchData();
    });

    // 返回响应式数据和方法，以便在模板中使用
    return {
      searchText,
      colophonResults,
      prefaceAndPostscriptResults,
      individualResults,
      viewContent,
      highlightKeywords,
      contentExpandStates,
      groupedColophonResults, // 添加计算属性
      toggleContent,
      fetchData,
      handleSubmit,
      toggleView,
      goToHome,
      goToOverview,
      goToOrigination,
      goToPrefaceAndPostscript,
      goToLogin,
      goToColophon,
      goToIndividual,
      messages,
      message,
      chatHistory,
      sendMessage
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
  z-index: -1; /* 确保背景在内容之下 */
}

/* 搜索框容器样式 */
.search-bar-container {
  position: fixed; /* 固定定位 */
  top: 0; /* 距离顶部0 */
  left: 0; /* 距离左侧0 */
  width: 100%; /* 宽度占满整个屏幕 */
  height: 50px; /* 根据需要调整高度 */
  background-color: #e7ded0;
  padding: 10px 0; /* 上下填充 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 可选：添加阴影效果 */
  z-index: 1000; /* 确保在最上层 */
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.search-bar-left {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中对齐子元素 */
  margin-right: 20%;
}

.search-bar-right {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中对齐子元素 */
  margin-left: 5%;
}

/* Logo样式 */
.logo {
  margin-left: 10px; /* 距离容器左侧20px */
  height: 70px; /* 根据实际尺寸调整 */
  padding-bottom: 10px
}

/* 搜索框样式 */
.search-bar {
  flex: 1; /* 使搜索框占据剩余空间 */
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  padding: 0 20px; /* 根据需要调整内边距 */
  min-width: 400px;
  max-width: 600px;
}

.search-bar form {
  display: flex;
  align-items: center; /* 垂直居中 */
  width: 100%;
}

.search-bar input[type="text"] {
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

.user-info {
  display: flex;
  align-items: center;
}
  
.user-info span {
  margin-right: 10px; /* 用户名与图标的间距 */
}

.search-buttons {
  display: flex;
  gap: 10px; /* 设置按钮之间的间距 */
}

.search-buttons button {
  width: 80px;
  height: 40px;
  padding: 5px 10px; /* 按钮内填充 */
  background-color: #8b6600; /* 按钮背景颜色 */
  color: white; /* 按钮文字颜色 */
  border: none; /* 移除边框 */
  border-radius: 4px; /* 按钮圆角 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  transition: background-color 0.3s; /* 背景颜色渐变效果 */
}

.search-buttons button:hover {
  background-color: #cc9900; /* 鼠标悬停时的背景颜色 */
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

.default-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #8b6600;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.default-button:hover {
  background-color: #cc9900;
}

.search {
  display: flex;
  height: calc(100vh - 70px); /* 减去导航栏的高度 */
  padding-top: 70px; /* 为内容添加顶部内边距 */
}

.search-left {
  flex: 1;
  height: 100%;
  background-color: #faf8f5;
  min-height: calc(100vh - 70px);
  padding: 50px;
  display: flex;
  justify-content: center;
}

.search-content {
  width: 100%;
}

.search-left h2 {
  margin: 0;
  font-size: 36px;
  color: #987444;
}

.search-left h3 {
  font-weight: bold;
  font-size: 1.5em;
  color: #987444;
  text-decoration: none;
}

/* 原本只用于牌记 */
.colophon-box {
  display: flex;
  grid-template-columns: 1fr auto; /* 1fr 用于内容，auto 用于按钮 */
  align-items: flex-start;
  width: 100%;
}

.colophon-content {
  flex: 9;
  height: 100%;
  grid-template-columns: 1fr auto; /* 1fr 用于内容，auto 用于按钮 */
  align-items: flex-start;
  background-color: #f0f0f0;
  padding: 10px 15px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: none;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  color: #333;
  width: 80%;
}

.toggle-button-container {
  flex: 1;
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: flex-end; /* 按钮靠右对齐 */
  margin: 5px 0;
}

.toggle-button {
  background-color: #987444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.toggle-button:hover {
  background-color: #a58b61;
}

.emphasized-title,
.emphasized-text {
  font-weight: bold;
  color: #9a8d7e;
}

.emphasized-title {
  color: #987444;
  font-size: 1.5em;
}

.detail {
  white-space: pre-wrap;
}

.divider{
  width: 100%; /* 分隔线的宽度 */
  border: 0; /* 移除边框 */
  height: 3px; /* 分隔线的高度 */
  background-color: #987444; /* 分隔线的颜色 */
  margin: 0.5em 0; /* 分隔线与内容的间距 */
}

.content-divider {
  width: 100%; /* 分隔线的宽度 */
  border: 0; /* 移除边框 */
  height: 1px; /* 每组信息间分隔线的高度 */
  background-color: #bababa;
  margin: 1rem 0; /* 分隔线与内容的间距 */
}

.search-right {
  flex: 1;
  padding: 50px;
  height: 100%;
}

/* 聊天窗口样式 */
.chat-window {
  background-color: #f0e9d7;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 70vh;
  width: 42%;
  padding: 20px;
  
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 子元素分布在容器的顶部和底部 */
}

/* 聊天历史区域样式 */
.chat-history {
  background-color: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  flex: 5.5;
  overflow-wrap: break-word;
  padding: 20px; /* 给聊天历史区域添加内边距 */
  overflow-y: auto;
}

.chat-history p:nth-child(even) {
  background-color: #e2e8f0;
  padding: 8px 20px; /* 增加左右内边距 */
  border-radius: 4px;
  max-width: 70%;
  margin-right: 15px;
}

/* 输入框样式 */
.input-container {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  flex: 1;
}

/* 添加一个样式类来实现自动换行 */
.textarea-auto-wrap {
  width: 100%; /* 宽度填满容器 */
  height: 90%;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  font-size: 14px;
  caret-color: #000000;
  flex: 5;
  font-size: 18px;
  padding: 8px;
  resize: none; /* 禁止用户调整大小 */
  overflow-wrap: break-word; /* 自动换行 */
}

.textarea-auto-wrap:focus {
  outline: none;
  border-color: #8b6600;
}

/* 发送按钮样式 */
.send-button {
  background-color: #8b6600;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  flex-shrink: 0;
  height: calc(90% + 18px); /* 微调高度，我也不知道为什么对不上 */
  flex: 1;
  font-size: 1.5rem;
}

.send-button:hover {
  background-color: #cc9900;
}
</style>