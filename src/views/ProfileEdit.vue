<template>
  <el-card class="profile-edit-card">
    <template #header>
      <div class="card-header">
        <span>编辑个人信息</span>
      </div>
    </template>

    <el-form :model="profileForm" :rules="profileRules" label-width="100px" ref="profileFormRef" v-if="profileForm">
      <el-form-item label="用户名">
        <el-input :value="profileForm.username" disabled></el-input>
      </el-form-item>

      <el-form-item label="头像" prop="avatarurl">
        <el-upload
          class="avatar-uploader"
          action="#" 
          :show-file-list="false"
          :auto-upload="false" 
          :on-change="handleAvatarChange"
          accept="image/jpeg,image/png,image/gif"
        >
          <img v-if="avatarPreviewUrl || profileForm.avatarurl" :src="avatarPreviewUrl || profileForm.avatarurl" class="avatar" alt="头像预览"/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <span class="upload-tip">点击上传新头像 (JPG/PNG/GIF, 小于10MB)</span>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="profileForm.nickname"></el-input>
      </el-form-item>

      <el-form-item label="个性签名" prop="signature">
        <el-input v-model="profileForm.signature" type="textarea" :rows="3"></el-input>
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
         <el-input v-model="profileForm.phone" disabled></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
         <el-input v-model="profileForm.email"></el-input>
      </el-form-item>

      <el-form-item label="技能描述" prop="skillsDescription">
        <el-input v-model="profileForm.skillsDescription" type="textarea" :rows="3" placeholder="例如：Java, Vue, 摄影爱好者"></el-input>
      </el-form-item>

      <el-form-item label="生日" prop="birthday">
        <el-date-picker
          v-model="profileForm.birthday"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="profileForm.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
          <el-radio label="保密">保密</el-radio> 
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveProfileInfo" :loading="infoLoading">保存基本信息</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </el-form-item>

      <el-divider>修改密码</el-divider>

      <el-form :model="passwordForm" :rules="passwordFormRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmNewPassword">
          <el-input v-model="passwordForm.confirmNewPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="savePassword" :loading="passwordLoading">确认修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-form>
    <el-empty v-else description="加载中..."></el-empty>
  </el-card>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getCurrentUserProfile, updateUserProfile, changePassword as apiChangePassword } from '@/api/auth.js';
import axios from 'axios';

const router = useRouter();
const profileFormRef = ref(null);
const passwordFormRef = ref(null); // Ref for password form
const infoLoading = ref(false);
const passwordLoading = ref(false);

const profileForm = ref(null); 
const avatarPreviewUrl = ref('');
const avatarFileToUpload = ref(null); // Store the selected file object

const isTestUser = ref(localStorage.getItem('isTestUser') === 'true');

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});

const profileRules = {
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    { max: 100, message: '昵称长度不能超过100个字符', trigger: 'blur' }
  ],
  // avatarurl is handled by upload, direct URL input is not primary way here, but can be kept as fallback
  // avatarurl: [{ type: 'url', message: '请输入有效的URL', trigger: ['blur', 'change'] }],
  signature: [{ max: 500, message: '个性签名长度不能超过500个字符', trigger: 'blur' }],
  phone: [
      { required: true, message: '手机号不能为空', trigger: 'blur' }, 
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
      { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  skillsDescription: [{ max: 1000, message: '技能描述长度不能超过1000个字符', trigger: 'blur' }],
};

const passwordFormRules = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20位之间', trigger: 'blur' }
    ],
    confirmNewPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
                callback(new Error('两次输入的新密码不一致!'));
            } else {
                callback();
            }
        }, trigger: 'blur' }
    ]
};

const handleAvatarChange = (uploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  const isLt10M = file.size / 1024 / 1024 < 10;
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);

  if (!isImage) {
    ElMessage.error('上传头像图片只能是 JPG/PNG/GIF 格式!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('上传头像图片大小不能超过 10MB!');
    return false;
  }
  avatarPreviewUrl.value = URL.createObjectURL(file);
  avatarFileToUpload.value = file; // Store for later upload
  return true;
};

const fetchProfileData = async () => {
  if (isTestUser.value) {
    console.log('ProfileEdit.vue: Test user mode, loading mock profile data.');
    profileForm.value = {
        username: '123456',
        nickname: '测试蘑菇',
        avatarurl: '', // Test users might not have a real avatar URL initially
        signature: '这是一个测试账号的签名。',
        phone: '13800138000',
        email: 'test@example.com',
        skillsDescription: 'Vue, Element Plus, Mocking',
        birthday: '2000-01-01',
        gender: '保密'
    };
    // avatarPreviewUrl.value = profileForm.value.avatarurl; // if mock data has avatar
    return;
  }

  const loadingInstance = ElLoading.service({ fullscreen: true, text: '加载用户数据...'});
  try {
    const response = await getCurrentUserProfile();
    if (response.data && response.data.success) {
      profileForm.value = response.data.data; 
      avatarPreviewUrl.value = ''; // Clear preview if a new avatar isn't selected yet
      avatarFileToUpload.value = null;
    } else {
      ElMessage.error(response.data.message || '获取用户信息失败');
      router.push('/profile');
    }
  } catch (error) {
    ElMessage.error('请求用户信息失败，请重试');
    console.error("Error fetching profile for edit:", error);
    router.push('/profile');
  } finally {
    loadingInstance.close();
  }
};

onMounted(() => {
  fetchProfileData();
});

const saveProfileInfo = async () => {
  if (!profileFormRef.value || !profileForm.value) return;
  try {
    const valid = await profileFormRef.value.validate();
    if (!valid) {
      ElMessage.error('请检查表单信息是否填写正确。');
     return;
  }

    if (isTestUser.value) {
        ElMessage.info('测试用户模式：基本信息假装保存成功！');
        // Optionally update mock data in localStorage if desired for persistence in test mode
        console.log('Test user: Pretending to save basic info:', JSON.parse(JSON.stringify(profileForm.value)));
        if (avatarFileToUpload.value) {
            console.log('Test user: Pretending to upload avatar:', avatarFileToUpload.value.name);
        }
        router.push('/profile');
        return;
    }

    infoLoading.value = true;
    let finalAvatarUrl = profileForm.value.avatarurl; // 默认使用旧的或手动输入的URL (如果存在)

    // 1. 如果有新头像文件，先上传头像
    if (avatarFileToUpload.value) {
      const formData = new FormData();
      formData.append('file', avatarFileToUpload.value); // 确保键名为 "file"
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          ElMessage.error('用户未登录，无法上传文件');
          infoLoading.value = false;
          return;
        }
        // 恢复原始的上传URL，不带 type=user 参数
        const uploadResponse = await axios.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Upload Response:', JSON.stringify(uploadResponse.data, null, 2));

        if (uploadResponse.data && uploadResponse.data.success) {
          finalAvatarUrl = uploadResponse.data.data; // 更新 finalAvatarUrl
          console.log('Final Avatar URL after upload:', finalAvatarUrl);
        } else {
          ElMessage.error(uploadResponse.data.message || '头像上传失败');
          console.error('Avatar upload failed. Response:', uploadResponse.data);
          infoLoading.value = false;
          return;
        }
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        ElMessage.error('头像上传请求失败，请检查网络或联系管理员。');
        infoLoading.value = false;
        return;
      }
    }
    
    // 2. 准备更新用户信息的全部数据
    const dataToUpdate = {
        nickname: profileForm.value.nickname,
        avatarurl: finalAvatarUrl, // 使用上传后的URL或原URL
        signature: profileForm.value.signature,
        phone: profileForm.value.phone,
        email: profileForm.value.email,
        skillsDescription: profileForm.value.skillsDescription,
        birthday: profileForm.value.birthday,
        gender: profileForm.value.gender,
    };

    const response = await updateUserProfile(dataToUpdate);
    if (response.data && response.data.success) {
    ElMessage.success('个人信息更新成功！');

      // 从响应中获取更新后的用户信息
      const updatedProfile = response.data.data;
      if (updatedProfile) {
        localStorage.setItem('nickname', updatedProfile.nickname || '');
        localStorage.setItem('avatarurl', updatedProfile.avatarurl || '');
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));
      }

      fetchProfileData(); // Re-fetch to get the latest state
      router.push('/profile');
    } else {
      ElMessage.error(response.data.message || '信息更新失败');
    }
  } catch (error) {
    console.error('Error updating profile info:', error);
    ElMessage.error('信息更新请求失败，请稍后再试');
  } finally {
    infoLoading.value = false;
  }
};

const savePassword = async () => {
  if (!passwordFormRef.value) return;
  const valid = await passwordFormRef.value.validate();
  if (!valid) {
    ElMessage.error('请检查密码信息是否填写正确。');
    return;
  }

  if (isTestUser.value) {
      ElMessage.info('测试用户模式：密码假装修改成功！');
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmNewPassword = '';
      return;
  }

  passwordLoading.value = true;
  try {
    const response = await apiChangePassword({
      oldPassword: passwordForm.oldPassword,
      password: passwordForm.newPassword 
    });
    if (response.data && response.data.success) {
      ElMessage.success('密码修改成功！');
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmNewPassword = '';
    } else {
      ElMessage.error(response.data.message || '密码修改失败');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    ElMessage.error('密码修改请求失败，请稍后再试');
  } finally {
    passwordLoading.value = false;
  }
};

const cancelEdit = () => {
  router.push('/profile');
};

</script>

<style scoped>
.profile-edit-card {
  max-width: 700px;
  margin: 20px auto;
  padding: 20px;
}
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%; /* Make it round */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px; 
  height: 100px;
  display: flex; 
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  /* width and height are inherited or can be set if needed */
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
    display: block; /* Make it a block to appear below the uploader */
    margin-top: 5px;
}

</style> 