<template>
    <div class="checkin-container">
        <h2>行程打卡</h2>
        <el-form :model="checkinForm" :rules="rules" ref="checkinFormRef" label-width="100px">
            <el-form-item label="打卡内容" prop="content">
                <el-input
                    v-model="checkinForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="分享你的旅行感受..."
                ></el-input>
            </el-form-item>

            <el-form-item label="打卡图片">
                <el-upload
                    action="/api/upload"
                    list-type="picture-card"
                    :on-preview="handlePictureCardPreview"
                    :on-remove="handleRemove"
                    :on-success="handleUploadSuccess"
                    :before-upload="beforeUpload"
                    multiple
                >
                    <el-icon><Plus /></el-icon>
                </el-upload>
                <el-dialog v-model="dialogVisible">
                    <img w-full :src="dialogImageUrl" alt="Preview Image" />
                </el-dialog>
            </el-form-item>

            <el-form-item label="位置">
                <el-input v-model="checkinForm.location" placeholder="添加位置信息">
                    <template #prefix>
                        <el-icon><Location /></el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitCheckin">发布打卡</el-button>
                <el-button @click="goBack">取消</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const checkinFormRef = ref(null);
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 表单数据
const checkinForm = reactive({
    content: '',
    images: [],
    location: ''
});

// 表单验证规则
const rules = {
    content: [
        { required: true, message: '请输入打卡内容', trigger: 'blur' },
        { min: 5, max: 500, message: '长度在 5 到 500 个字符', trigger: 'blur' }
    ]
};

// 处理图片预览
const handlePictureCardPreview = (file) => {
    dialogImageUrl.value = file.url;
    dialogVisible.value = true;
};

// 处理图片移除
const handleRemove = (file, fileList) => {
    const index = checkinForm.images.indexOf(file.url);
    if (index !== -1) {
        checkinForm.images.splice(index, 1);
    }
};

// 处理图片上传成功
const handleUploadSuccess = (response, file) => {
    checkinForm.images.push(response.url);
};

// 上传前校验
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error('上传文件只能是图片格式!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!');
        return false;
    }
    return true;
};

// 提交打卡
const submitCheckin = async () => {
    if (!checkinFormRef.value) return;
    
    await checkinFormRef.value.validate((valid) => {
        if (valid) {
            // 实际项目中这里会调用API
            ElMessage.success('打卡成功！');
            router.push(`/journey/${route.params.id}`);
        }
    });
};

// 返回上一页
const goBack = () => {
    router.back();
};
</script>

<style scoped>
.checkin-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

:deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
}
</style> 