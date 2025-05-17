<template>
    <div class="register-container">
        <div class="title-container">
            <h2 class="register-title">用户注册</h2>
            <h3 class="register-subtitle">———— 开启您的旅行之旅 ————</h3>
        </div>
        <el-card class="register-card">
            <el-form :model="form" :rules="rules" ref="registerForm" label-width="0" status-icon>
                <el-form-item prop="username">
                    <el-input 
                        v-model="form.username" 
                        placeholder="请输入用户名 (3-20个字符)"
                        prefix-icon="el-icon-user-solid">
                    </el-input>
                </el-form-item>
                <el-form-item prop="phone">
                    <el-input 
                        v-model="form.phone" 
                        placeholder="请输入手机号"
                        prefix-icon="el-icon-mobile">
                    </el-input>
                </el-form-item>
                <el-form-item prop="nickname">
                    <el-input 
                        v-model="form.nickname" 
                        placeholder="请输入昵称 (可选)"
                        prefix-icon="el-icon-postcard">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码 (6-20位)"
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
import { register as apiRegister } from '@/api/auth.js';

const router = useRouter();
const registerForm = ref(null);
const loading = ref(false);

const form = reactive({
    username: '',
    phone: '',
    nickname: '',
    password: '',
    confirmPassword: ''
});

const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'));
    } else {
        if (form.confirmPassword !== '') {
            registerForm.value.validateField('confirmPassword', () => null);
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
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    nickname: [
        { min: 2, max: 20, message: '昵称长度应在 2 到 20 个字符之间', trigger: 'blur' }
    ],
    password: [
        { required: true, validator: validatePass, trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, validator: validatePass2, trigger: 'blur' }
    ]
};

const onSubmit = async () => {
    console.log('Register.vue: onSubmit function called');
    if (!registerForm.value) {
        console.warn('Register.vue: registerForm ref is not available');
        return;
    }
    
    try {
        console.log('Register.vue: Validating form...');
        const valid = await registerForm.value.validate();
        if (!valid) {
            console.log('Register.vue: Form validation failed');
            ElMessage.error('请检查表单输入是否正确！');
            return;
        }
        
        loading.value = true;
        console.log('Register.vue: Form validation successful, attempting to register with form data:', JSON.parse(JSON.stringify(form)));

        const registrationData = {
            username: form.username,
            password: form.password,
            phone: form.phone,
        };
        if (form.nickname && form.nickname.trim() !== '') {
            registrationData.nickname = form.nickname.trim();
        }

        console.log('Register.vue: Sending registration data to API:', registrationData);
        
        const response = await apiRegister(registrationData);
        console.log('Register.vue: Received response from registration API:', response);

        if (response.data && response.data.success) {
            ElMessage.success(response.data.message || '注册成功，请登录');
            router.push('/');
        } else {
            ElMessage.error(response.data.message || '注册失败，请稍后重试');
            console.error('Register.vue: Registration API returned error:', response.data);
        }
    } catch (error) {
        console.error('Register.vue: Error during registration API call or form validation:', error);
    } finally {
        loading.value = false;
        console.log('Register.vue: onSubmit function finished');
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