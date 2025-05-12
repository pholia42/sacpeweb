<template>
  <div class="login-container">
    <div class="title-container">
      <h2 class="login-title">旅行协作打卡系统</h2>
      <h3 class="login-subtitle">———— 山水一程 ————</h3>
    </div>
    <el-card class="login-card">
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="0" status-icon>
            <el-form-item prop="phone">
              <el-input 
                v-model="passwordForm.phone" 
                placeholder="请输入手机号"
                prefix-icon="el-icon-mobile">
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
        </el-tab-pane>
        
        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="codeForm" :rules="codeRules" ref="codeFormRef" label-width="0" status-icon>
            <el-form-item prop="phone">
              <el-input 
                v-model="codeForm.phone" 
                placeholder="请输入手机号"
                prefix-icon="el-icon-mobile">
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-input-group">
                <el-input
                  v-model="codeForm.code"
                  placeholder="请输入验证码"
                  prefix-icon="el-icon-message">
                </el-input>
                <el-button 
                  type="primary" 
                  :disabled="!!countdown"
                  @click="handleSendCode"
                  class="send-code-button">
                  {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleCodeLogin" :loading="loading" class="login-button">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
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

const router = useRouter();
const loading = ref(false);
const activeTab = ref('password');
const countdown = ref(0);
const passwordFormRef = ref(null);
const codeFormRef = ref(null);

// 密码登录表单
const passwordForm = reactive({
  phone: '',
  password: ''
});

// 验证码登录表单
const codeForm = reactive({
  phone: '',
  code: ''
});

// 表单验证规则
const passwordRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
   // { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
  ]
};

const codeRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
  ]
};

// 发送验证码
const handleSendCode = async () => {
  try {
    const valid = await codeFormRef.value.validateField('phone');
    if (valid) {
      // 模拟发送验证码
      ElMessage.success('验证码已发送');
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
  }
};

// 密码登录
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    const valid = await passwordFormRef.value.validate();
    if (!valid) return;
    
    loading.value = true;
    
    // 测试账号验证
    if (passwordForm.phone === '123456' && passwordForm.password === '123123') {
      localStorage.setItem('username', passwordForm.phone);
      ElMessage.success('登录成功');
      router.push('/plaza');
      loading.value = false;
      return;
    }
    
    // 模拟登录请求
    setTimeout(() => {
      localStorage.setItem('username', passwordForm.phone);
      ElMessage.success('登录成功');
      router.push('/plaza');
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请重试！');
    loading.value = false;
  }
};

// 验证码登录
const handleCodeLogin = async () => {
  if (!codeFormRef.value) return;
  
  try {
    const valid = await codeFormRef.value.validate();
    if (!valid) return;
    
    loading.value = true;
    // 模拟登录请求
    setTimeout(() => {
      localStorage.setItem('username', codeForm.phone);
      ElMessage.success('登录成功');
      router.push('/plaza');
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请重试');
    loading.value = false;
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

.login-tabs {
  margin-bottom: 20px;
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

.code-input-group {
  display: flex;
  gap: 10px;
}

.send-code-button {
  width: 120px;
  white-space: nowrap;
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

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}
</style>