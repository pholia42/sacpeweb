<template>
    <div class="register-container">
        <div class="title-container">
            <h2 class="register-title">用户注册</h2>
            <h3 class="register-subtitle">———— 开启您的旅行之旅 ————</h3>
        </div>
        <el-card class="register-card">
            <el-form :model="form" :rules="rules" ref="registerForm" label-width="0" status-icon>
                <el-form-item prop="phone">
                    <el-input 
                        v-model="form.phone" 
                        placeholder="请输入手机号"
                        prefix-icon="el-icon-mobile">
                    </el-input>
                </el-form-item>
                <el-form-item prop="code">
                    <div class="code-input-group">
                        <el-input
                            v-model="form.code"
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
                <el-form-item prop="nickname">
                    <el-input 
                        v-model="form.nickname" 
                        placeholder="请输入昵称"
                        prefix-icon="el-icon-user">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                        prefix-icon="el-icon-lock">
                    </el-input>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="form.confirmPassword"
                        type="password"
                        placeholder="请再次输入密码"
                        show-password
                        prefix-icon="el-icon-lock">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit" :loading="loading" class="register-button">
                        注册
                    </el-button>
                </el-form-item>
                <div class="register-options">
                    <el-link type="primary" @click="goToLogin">返回登录</el-link>
                </div>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const registerForm = ref(null);
const loading = ref(false);
const countdown = ref(0);

const form = reactive({
    phone: '',
    code: '',
    nickname: '',
    password: '',
    confirmPassword: ''
});

const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'));
    } else {
        if (form.confirmPassword !== '') {
            registerForm.value.validateField('confirmPassword');
        }
        callback();
    }
};

const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    } else if (value !== form.password) {
        callback(new Error('两次输入密码不一致!'));
    } else {
        callback();
    }
};

const rules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
    ]
};

// 发送验证码
const handleSendCode = async () => {
    try {
        const valid = await registerForm.value.validateField('phone');
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

const onSubmit = async () => {
    if (!registerForm.value) return;
    
    try {
        const valid = await registerForm.value.validate();
        if (!valid) return;
        
        loading.value = true;
        // 模拟注册请求
        setTimeout(() => {
            ElMessage.success('注册成功，请登录');
            router.push('/');
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('注册失败:', error);
        ElMessage.error('注册失败，请重试');
        loading.value = false;
    }
};

const goToLogin = () => {
    router.push('/');
};
</script>

<style scoped>
.register-container {
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

.register-container::before {
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

.register-title {
    font-size: 28px;
    color: #333;
    font-weight: bold;
    margin-bottom: 10px;
}

.register-subtitle {
    font-size: 20px;
    color: #666;
    margin-bottom: 20px;
}

.register-card {
    width: 100%;
    max-width: 400px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
}

.code-input-group {
    display: flex;
    gap: 10px;
}

.send-code-button {
    width: 120px;
    white-space: nowrap;
}

.register-button {
    width: 100%;
    border-radius: 5px;
    background-color: #009688;
    border-color: #009688;
    margin-top: 10px;
}

.register-button:hover {
    background-color: #00796b;
    border-color: #00796b;
}

.register-options {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

:deep(.el-input__inner) {
    border-radius: 5px;
}
</style> 