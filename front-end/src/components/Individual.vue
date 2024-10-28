<template>
  <div class="background-color"></div>

  <div class="container">
    <!-- 左边的组件 -->
    <div class="individual">
      <div class="content">
        <div class="name">{{ individualName }}</div>
      </div>
      <hr class="divider"> <!-- 添加模块间的分隔线 -->
      <div v-if="relationResults.length > 0">
        <!-- <h1 class="title">相关牌记</h1> -->
        <div v-for="(group, groupName) in groupedRelations" :key="groupName">
          <h2 class="scripture-name">{{ groupName }}</h2>
          <div v-for="(result, index) in group" :key="index" class="relation-item" @click="goToColophon(result.id)">
            <span class="emphasized-text">相关牌记：</span>
            <div class="detail">{{ result.content }}</div>
            <br/>
            <span class="emphasized-text">参与活动：</span>
            <div class="detail">{{ result.type }}</div>
            <br/>
            <span class="emphasized-text">补充说明：</span>
            <div class="detail">{{ result.description }}</div>
          </div>
        </div>
      </div>
      <p v-else>No relation found.</p>
    </div>

    <!-- 右边的组件 -->
    <div class="data-visualization">
      <div class="column-container">
        <!-- 顶部内容 -->
        <div class="column-container-top-title">
          <h1 class="title">活跃年代</h1>
        </div>
        <div class="column-container-top-image">
          <div ref="chartRefTime" style="width: 100%; height: 100%;"></div>
        </div>
        <!-- 底部内容 -->
        <div class="column-container-bottom-title">
          <h1 class="title">相关藏经地点</h1>
        </div>
        <div class="column-container-bottom-image">
          <iframe :src="mapSrc" width="95%" height="95%" frameborder="0"></iframe>
          <!-- <div ref="chartRefPlace" style="width: 100%; height: 100%;"></div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/data_service';
import * as echarts from 'echarts';

export default defineComponent({
  name: 'Individual',
  setup() {
    const searchId = ref('');
    const individualName = ref('');
    const timeCnt = ref({})
    const placeCnt = ref({})
    const relationResults = ref([]);
    const router = useRouter();
    const chartRefTime = ref(null);
    const chartRefPlace = ref(null);

    const route = useRoute();
    searchId.value = route.query.id ? route.query.id : '';

    const groupedRelations = reactive({});


    const fetchData = () => {
      if (searchId.value) {
        apiClient.getIndividual(searchId.value).then(response => {
          if (response.data && response.data.name) {
            individualName.value = response.data.name;
            timeCnt.value = response.data.time_cnt;
            placeCnt.value = response.data.place_cnt;
          } else {
            individualName.value = '';
            timeCnt.value = {};
            placeCnt.value = {};
          }
          if (response.data && response.data.relation) {
            const relations = response.data.relation;
            relations.forEach(item => {
              if (!groupedRelations[item.scripture_name]) {
                groupedRelations[item.scripture_name] = [];
              }
              groupedRelations[item.scripture_name].push(item);
            });
            relationResults.value = Object.values(groupedRelations);
          } else {
            relationResults.value = [];
          }
          initChart();
        }).catch(error => {
          console.error(error);
          individualName.value = '';
          timeCnt.value = {};
          placeCnt.value = {};
          relationResults.value = [];
        });
      }
    };

    // 定义跳转到对应 colophon 的方法
    const goToColophon = (id) => {
      router.push(`/colophon?id=${encodeURIComponent(id)}`);
      // // 构建URL
      // const url = `/colophon?id=${encodeURIComponent(id)}`;
      // // 在新标签页中打开URL
      // window.open(url, '_blank');
    };

    // 初始化折线图的方法
    const initChart = () => {
      if (chartRefTime.value) {
        const myChart = echarts.init(chartRefTime.value);
        const option = {
          xAxis: {
            type: 'category',
            // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data: Object.keys(timeCnt.value),
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            // data: [820, 932, 901, 934, 1290, 1330, 1320],
            data: Object.values(timeCnt.value),
            type: 'line',
            itemStyle: {
              color: 'rgba(200,155,64,1)'
            }
          }]
        };
        myChart.setOption(option);
      }
      if (chartRefPlace.value) {
        const myChart = echarts.init(chartRefPlace.value);
        const option = {
          xAxis: {
            type: 'category',
            // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data: Object.keys(placeCnt.value),
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            // data: [820, 932, 901, 934, 1290, 1330, 1320],
            data: Object.values(placeCnt.value),
            type: 'bar',
            itemStyle: {
              color: 'rgba(200,155,64,1)'
            }
          }]
        };
        myChart.setOption(option);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      searchId,
      individualName,
      timeCnt,
      placeCnt,
      relationResults,
      groupedRelations,
      fetchData,
      goToColophon,
      chartRefTime,
      chartRefPlace,
      initChart,
      mapSrc: `/map.html?id=${searchId.value}`
    };
  },
});
</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  height: calc(100vh - 70px);
  padding-top: 70px;
  position: fixed;
}

.individual {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  padding-left: 60px;
  padding-right: 60px;
}

.data-visualization {
  flex: 1;
  height: 100%;
  position: relative;
}

.title {
  font-size: 2rem; /* 标题大小 */
  margin-bottom: 1rem; /* 标题与内容的间距 */
  color: #987444;
}

.scripture-name {
  font-weight: bold;
  font-size: 1.5em;
  color: #987444;
  margin-top: 25px;
  /* text-decoration: underline; */
  text-decoration: none;
}

.name {
  font-weight: bold;
  color: #987444;
  font-size: 4rem;
  margin-bottom: 1rem;
}

.divider, .relation-divider {
  width: 100%; /* 分隔线的宽度 */
  border: 0; /* 移除边框 */
  height: 5px; /* 分隔线的高度 */
  background-color: #e7ded0; /* 分隔线的颜色 */
  margin: 1rem 0; /* 分隔线与内容的间距 */
}

.relation-divider {
  background-color: #d8d8d8;
  height: 1px;
}

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

.column-container {
  display: flex; /* 使用Flexbox布局 */
  flex-direction: column; /* 子元素垂直排列 */
  height: 100%; /* 确保父容器占满可用的高度 */
  justify-content: space-between; /* 子元素分布在容器的顶部和底部 */
}

.column-container-top-title,
.column-container-top-image,
.column-container-bottom-title,
.column-container-bottom-image {
  /* overflow-y: auto; */
  text-align: center; /* 文本居中对齐 */
  flex-direction: column; /* 子元素垂直排列 */
}

.column-container-top-title {
  flex: 1;
}

.column-container-top-image {
  flex: 4;
  border-bottom: 1px solid #ccc;
}

.column-container-bottom-title {
  flex: 1;
  border-top: 1px solid #ccc;
}

.column-container-bottom-image {
  flex: 7;
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