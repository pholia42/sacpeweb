<template>
    <div class="profile-container">
        <el-row :gutter="20">
            <!-- 个人信息卡片 -->
            <el-col :span="8">
                <el-card class="profile-card">
                    <div class="profile-header">
                        <el-avatar :size="100" :src="userInfo.avatar">{{ userInitials }}</el-avatar>
                        <h2>{{ userInfo.username }}</h2>
                        <p class="signature">{{ userInfo.signature || '这个人很懒，什么都没留下~' }}</p>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-value">{{ userInfo.checkins }}</div>
                            <div class="stat-label">打卡次数</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ userInfo.journeys }}</div>
                            <div class="stat-label">完成旅程</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">{{ userInfo.skills }}</div>
                            <div class="stat-label">技能数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 信息编辑卡片 -->
            <el-col :span="16">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>个人信息</span>
                            <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
                        </div>
                    </template>
                    <el-form
                        ref="formRef"
                        :model="form"
                        :rules="rules"
                        label-width="100px"
                        class="profile-form"
                    >
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="form.username" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="个性签名" prop="signature">
                            <el-input
                                v-model="form.signature"
                                type="textarea"
                                :rows="3"
                                placeholder="写点什么介绍一下自己吧~"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="form.email"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="form.phone"></el-input>
                        </el-form-item>
                    </el-form>
                </el-card>

                <!-- 修改密码卡片 -->
                <el-card class="password-card">
                    <template #header>
                        <div class="card-header">
                            <span>修改密码</span>
                        </div>
                    </template>
                    <el-form
                        ref="passwordFormRef"
                        :model="passwordForm"
                        :rules="passwordRules"
                        label-width="100px"
                    >
                        <el-form-item label="当前密码" prop="currentPassword">
                            <el-input
                                v-model="passwordForm.currentPassword"
                                type="password"
                                show-password
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input
                                v-model="passwordForm.newPassword"
                                type="password"
                                show-password
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input
                                v-model="passwordForm.confirmPassword"
                                type="password"
                                show-password
                            ></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                                修改密码
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

// 用户信息
const userInfo = ref({
    username: localStorage.getItem('username') || '',
    signature: '热爱旅行，热爱生活',
    avatar: '',
    checkins: 42,
    journeys: 5,
    skills: 3,
    email: 'user@example.com',
    phone: '13800138000'
});

// 计算用户名首字母作为头像
const userInitials = computed(() => {
    return userInfo.value.username ? userInfo.value.username.charAt(0).toUpperCase() : '';
});

// 表单数据
const form = ref({
    username: userInfo.value.username,
    signature: userInfo.value.signature,
    email: userInfo.value.email,
    phone: userInfo.value.phone
});

// 表单验证规则
const rules = {
    signature: [
        { max: 100, message: '签名不能超过100个字符', trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ]
};

// 密码表单数据
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 密码验证规则
const passwordRules = {
    currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== passwordForm.value.newPassword) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
};

const loading = ref(false);
const passwordLoading = ref(false);
const formRef = ref(null);
const passwordFormRef = ref(null);

// 保存个人信息
const handleSave = async () => {
    if (!formRef.value) return;
    
    try {
        await formRef.value.validate();
        loading.value = true;
        
        // TODO: 调用API保存个人信息
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        ElMessage.success('保存成功');
        userInfo.value = { ...userInfo.value, ...form.value };
    } catch (error) {
        console.error('保存失败:', error);
        ElMessage.error('保存失败，请检查表单');
    } finally {
        loading.value = false;
    }
};

// 修改密码
const handleChangePassword = async () => {
    if (!passwordFormRef.value) return;
    
    try {
        await passwordFormRef.value.validate();
        passwordLoading.value = true;
        
        // TODO: 调用API修改密码
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        ElMessage.success('密码修改成功');
        passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败，请检查输入');
    } finally {
        passwordLoading.value = false;
    }
};
</script>

<style scoped>
.profile-container {
    padding: 20px;
}

.profile-card {
    margin-bottom: 20px;
}

.profile-header {
    text-align: center;
    padding: 20px 0;
}

.profile-header h2 {
    margin: 10px 0;
}

.signature {
    color: #666;
    font-size: 14px;
    margin: 10px 0;
}

.profile-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;
    border-top: 1px solid #eee;
}

.stat-item {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
}

.stat-label {
    font-size: 14px;
    color: #666;
    margin-top: 5px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.profile-form {
    max-width: 500px;
}

.password-card {
    margin-top: 20px;
}
</style> 