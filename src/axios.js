import axios from 'axios';
import { ElMessage } from 'element-plus';
//import router from './router/index.js';

// 创建axios实例
const instance = axios.create({
    baseURL: 'http://localhost:8081/api', // 确保与后端端口匹配
    timeout: 10000, // 设置合适的超时时间
    withCredentials: true, // 允许携带cookie等凭证
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 添加请求拦截器
instance.interceptors.request.use(config => {
    console.log('请求配置:', config);
    console.log('请求URL:', config.baseURL + config.url);
    console.log('请求方法:', config.method);
    console.log('请求头:', config.headers);
    console.log('请求数据:', config.data);
    console.log('请求参数:', config.params);
    return config;
}, error => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(response => {
    console.log('响应数据:', response);
    return response; // 返回完整响应
}, error => {
    console.error('请求错误:', error);
    
    if (error.response) {
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应数据:', error.response.data);
        
        switch (error.response.status) {
            // case 401:
            //     localStorage.removeItem('token');
            //     ElMessage.error('认证失败或登录已过期，请重新登录');
            //     router.push('/'); // 假设登录页路由是 '/'
            //     break;
            case 400:
                ElMessage.error(`请求参数错误: ${error.response.data || '请检查输入'}`);
                break;
            case 403:
                ElMessage.error('没有权限进行此操作');
                break;
            default:
                ElMessage.error(`请求错误: ${error.response.status} ${error.response.statusText}`);
        }
    } else if (error.request) {
        console.error('请求已发送但没有收到响应');
        ElMessage.error('网络错误，无法连接到服务器');
    } else {
        ElMessage.error(`请求处理出错: ${error.message}`);
    }
    return Promise.reject(error);
});

export default instance;