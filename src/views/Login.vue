<template>
  <div class="login-container">
    <div class="title-container">
      <h2 class="login-title">旅行协作打卡系统</h2>
      <h3 class="login-subtitle">———— 山水一程 ————</h3>
    </div>
    <el-card class="login-card">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="0" status-icon>
            <el-form-item prop="phone">
              <el-input 
                v-model="passwordForm.phone" 
            placeholder="请输入用户名"
            prefix-icon="el-icon-user">
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                prefix-icon="el-icon-lock">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handlePasswordLogin" :loading="loading" class="login-button">
                登录
              </el-button>
            </el-form-item>
          </el-form>
      
      <div class="login-options">
        <el-link type="primary" @click="goToRegister">立即注册</el-link>
        <el-link type="primary" @click="handleForgotPassword">忘记密码？</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { login as apiLogin } from '@/api/auth.js'; // 引入后端登录API

const router = useRouter();
const loading = ref(false);
const passwordFormRef = ref(null);

// 密码登录表单
const passwordForm = reactive({
  phone: '',
  password: ''
});

// 表单验证规则
const passwordRules = {
  phone: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
  ]
};

// 密码登录
const handlePasswordLogin = async () => {
  console.log('Login.vue: handlePasswordLogin function called with form data:', passwordForm);
  if (!passwordFormRef.value) {
    console.warn('Login.vue: passwordFormRef is not available');
    return;
  }
  
  try {
    console.log('Login.vue: Validating password form...');
    const valid = await passwordFormRef.value.validate();
    if (!valid) {
      console.log('Login.vue: Password form validation failed');
      ElMessage.error('请检查表单输入是否正确！');
      return;
    }
    
    loading.value = true;
    console.log('Login.vue: Password form validation successful.');
    
    // 测试账号逻辑
    if (passwordForm.phone === '123456' && passwordForm.password === '123123') {
      console.log('Login.vue: Test account detected, performing mock login.');
      const mockToken = 'mock-test-user-token-xxxxxx';
      // const mockUser = { username: passwordForm.phone, nickname: '测试用户', avatarurl: null }; 
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('isTestUser', 'true'); // 设置测试用户标志
      // localStorage.setItem('user', JSON.stringify(mockUser)); // 如果需要存储模拟用户信息

      ElMessage.success('测试账号登录成功');
      router.push('/plaza'); // 跳转到广场页或其他主页
      loading.value = false;
      console.log('Login.vue: Test account login finished.');
      return; // 测试账号登录后直接返回，不执行后续真实API调用
    }
    
    // 真实账号登录流程
    console.log('Login.vue: Attempting to login via API for user:', passwordForm.phone);
    const response = await apiLogin({ 
      username: passwordForm.phone, // passwordForm.phone 用作 username
      password: passwordForm.password 
    });
    console.log('Login.vue: Received response from login API:', response);

    if (response.data && response.data.success) {
      const token = response.data.data.token;
      const userInfo = response.data.data.user; // { username, nickname, avatarurl, ... }
      console.log('Login.vue: API login successful. Token:', token, 'User:', userInfo);

      localStorage.setItem('token', token);
      if (userInfo) {
        localStorage.setItem('nickname', userInfo.nickname || ''); // 存储昵称，为空则存空字符串
        localStorage.setItem('avatarurl', userInfo.avatarurl || ''); // 存储头像URL
      }
      localStorage.removeItem('isTestUser'); // 真实用户登录，移除测试标志
      
      // 派发用户登录事件，以便其他组件（如顶边栏）可以响应
      window.dispatchEvent(new CustomEvent('userLoggedIn'));

      ElMessage.success('登录成功');
      router.push('/plaza');  // 跳转到广场页或其他主页
    } else {
      ElMessage.error(response.data.message || '登录失败，请检查用户名和密码');
      console.error('Login.vue: API login failed:', response.data ? response.data.message : 'No specific error message from API');
    }
  } catch (error) {
    console.error('Login.vue: Error during login API call or form validation:', error);
    // 对于真实API调用失败，也应该清除测试用户标志以防万一
    localStorage.removeItem('isTestUser');
    ElMessage.error('登录请求失败，请稍后重试');
  } finally {
    loading.value = false;
    console.log('Login.vue: handlePasswordLogin function finished.');
  }
};

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中...');
};

// 跳转到注册页
const goToRegister = () => {
  router.push('/reg');
};
</script>

<style scoped>
.login-container {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('@/assets/back.jpg');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.title-container {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.login-title {
  font-size: 28px;
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.login-button {
  width: 100%;
  border-radius: 5px;
  background-color: #009688;
  border-color: #009688;
  margin-top: 10px;
}

.login-button:hover {
  background-color: #00796b;
  border-color: #00796b;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

:deep(.el-input__inner) {
  border-radius: 5px;
}
</style>