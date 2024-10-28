// 导入 axios
import axios from 'axios';

// 创建一个 axios 实例，用于发送请求
const apiClient = axios.create({
  // 设置后端 API 的基础 URL
  // TODO! 在这里修改域名
  // baseURL: 'http://127.0.0.1:5000/',
  baseURL: 'https://jinshanback.cpolar.top/',
  // 设置请求头
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default {
  searchData(wd) {
    // 向 '/search' 路由发送 GET 请求，并附加查询参数 wd
    return apiClient.get('/search', { params: { wd: wd } });
  },
  getIndividual(id) {
    // 向 '/individual' 路由发送 GET 请求，并附加查询参数 id
    return apiClient.get('/individual', { params: { id: id } });
  },
  getColophon(id) {
    // 向 '/colophon' 路由发送 GET 请求，并附加查询参数 id
    return apiClient.get('/colophon', { params: { id: id } });
  },
  getPrefaceAndPostscript(id) {
    // 向 '/preface-and-postscript' 路由发送 GET 请求，并附加查询参数 id
    return apiClient.get('/preface-and-postscript', { params: { id: id } });
  },
  getStory(id) {
    // 向 '/story' 路由发送 GET 请求，并附加查询参数 id
    return apiClient.get('/story', { params: { id: id } });
  },
  postAnswer(messages) {
    console.log(messages)
    // 向 '/qa' 路由发送 POST 请求，并在请求体中发送数据
    return apiClient.post('/qa', { messages: messages });
  },
  getOverview(page) {
    // 向 '/overview' 路由发送 GET 请求，并附加查询参数 page
    return apiClient.get('/overview', { params: { page: page } });
  }
};