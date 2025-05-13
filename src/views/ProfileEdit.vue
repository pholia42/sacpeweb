<template>
  <el-card class="profile-edit-card">
    <template #header>
      <div class="card-header">
        <span>编辑个人信息</span>
      </div>
    </template>

    <el-form :model="profileForm" label-width="100px" ref="profileFormRef">
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="#" 
          :show-file-list="false"
          :auto-upload="false" 
          :on-change="handleAvatarChange"
          accept="image/*"
        >
          <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" class="avatar" alt="头像预览"/>
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <span class="upload-tip">点击上传新头像</span>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="profileForm.nickname"></el-input>
      </el-form-item>

      <el-form-item label="个性签名" prop="signature">
        <el-input v-model="profileForm.signature" type="textarea" :rows="3"></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
         <el-input v-model="profileForm.email"></el-input>
      </el-form-item>

      <el-form-item label="技能标签" prop="skills">
          <el-select
            v-model="profileForm.skills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入技能标签"
            style="width: 100%;"
          >
             <el-option
                v-for="item in skillOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
          </el-select>
      </el-form-item>

      <el-divider>修改密码</el-divider>

       <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="profileForm.oldPassword" type="password" show-password></el-input>
      </el-form-item>
       <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="profileForm.newPassword" type="password" show-password></el-input>
      </el-form-item>
       <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="profileForm.confirmPassword" type="password" show-password></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveProfile">保存更改</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();
const profileFormRef = ref(null);
const avatarPreviewUrl = ref('');
const avatarFile = ref(null); // 用于存储待上传的文件对象

// TODO: 从 API 获取当前用户信息并填充表单
const profileForm = reactive({
  nickname: '蘑菇', // 模拟数据
  signature: '热爱生活，热爱旅行！', // 模拟数据
  email: 'mogu@example.com', // 模拟数据
  skills: ['摄影', '美食家'], // 模拟数据
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 模拟可选技能
const skillOptions = ref([
    { value: '摄影', label: '摄影' },
    { value: '美食家', label: '美食家' },
    { value: '徒步', label: '徒步' },
    { value: '潜水', label: '潜水' },
    { value: '攻略达人', label: '攻略达人' },
]);

// 处理头像选择
const handleAvatarChange = (uploadFile) => {
  if (uploadFile.raw) {
     // 简单的客户端预览
    avatarPreviewUrl.value = URL.createObjectURL(uploadFile.raw);
    avatarFile.value = uploadFile.raw; // 保存文件对象待上传
  }
};

// TODO: 实现保存逻辑
const saveProfile = async () => {
  // 基础验证示例 (密码确认)
  if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
    ElMessage.error('新密码两次输入不一致！');
    return;
  }
  // 如果填写了新密码，但没填旧密码 (根据实际需要调整逻辑)
  if (profileForm.newPassword && !profileForm.oldPassword) {
     ElMessage.error('修改密码需要输入旧密码！');
     return;
  }

  console.log('保存个人信息:', profileForm);
  console.log('待上传头像文件:', avatarFile.value);

  // 准备要发送的数据 (去除密码，除非密码已更改且验证通过)
  const dataToSave = { ...profileForm };
  let passwordChanged = false;
  if (dataToSave.newPassword && dataToSave.oldPassword) {
      // TODO: 添加旧密码验证逻辑
      console.log("需要调用 API 验证旧密码并更新密码");
      passwordChanged = true;
      // 实际发送给后端的应该是 newPassword，可能还需要 oldPassword 进行验证
  } 
  // 不应将密码字段明文传来传去，仅在需要修改时处理
  delete dataToSave.oldPassword;
  delete dataToSave.newPassword;
  delete dataToSave.confirmPassword;

  console.log('准备提交的数据:', dataToSave);

  try {
    // TODO: 调用 API 更新用户信息 (dataToSave)
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: 如果头像已更改(avatarFile.value存在)，调用 API 上传头像
    if (avatarFile.value) {
        console.log("需要调用 API 上传头像", avatarFile.value.name);
        // 模拟上传
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // TODO: 如果密码已更改 (passwordChanged)，可能需要单独的 API 调用
    if (passwordChanged) {
        console.log("需要调用 API 更新密码");
         // 模拟密码更新
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    ElMessage.success('个人信息更新成功！');
    router.push('/profile'); // 保存后返回个人主页
  } catch (error) {
      console.error('更新失败:', error);
      ElMessage.error('信息更新失败，请稍后再试。');
  }
};

const cancelEdit = () => {
  router.back(); // 取消编辑，返回上一页
};

onMounted(() => {
  // TODO: 在组件挂载时获取当前用户信息，并填充 profileForm 和 avatarPreviewUrl
  // 模拟加载当前头像
  // avatarPreviewUrl.value = require('@/assets/mogu.jpg');
  console.log('ProfileEdit component mounted');
});
</script>

<style scoped>
.profile-edit-card {
  max-width: 700px; /* 稍微加宽以容纳标签和密码 */
  margin: 20px auto;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px; /* 确保上传框大小一致 */
  height: 100px;
  display: flex; /* 居中图标 */
  align-items: center;
  justify-content: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-left: 10px;
}
</style> 