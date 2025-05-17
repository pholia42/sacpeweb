<template>
    <div class="create-journey-container">
        <el-steps :active="activeStep" finish-status="success" align-center class="journey-steps">
            <el-step title="基础信息" />
            <el-step title="行程安排" />
            <el-step title="确认提交" />
        </el-steps>

        <el-card class="step-card">
            <!-- 步骤一：基础信息 -->
            <div v-if="activeStep === 0">
                <el-form :model="journeyForm" :rules="rules" ref="journeyFormRef" label-width="100px">
                    <el-form-item label="行程标题" prop="title">
                        <el-input v-model="journeyForm.title" placeholder="请输入行程标题"></el-input>
                    </el-form-item>
                    <el-form-item label="封面图片" prop="coverImage">
                        <el-upload
                            class="cover-uploader"
                            action="/api/files/upload"
                            :data="{ type: 'journey' }"
                            name="file"
                            :show-file-list="false"
                            :on-success="handleCoverSuccess"
                            :before-upload="beforeCoverUpload"
                        >
                            <img v-if="journeyForm.coverImage" :src="journeyForm.coverImage" class="cover-image">
                            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="目的地" prop="location">
                        <el-input v-model="journeyForm.location" placeholder="请输入目的地"></el-input>
                    </el-form-item>
                    <el-form-item label="日期范围" prop="dateRange">
                        <el-date-picker
                            v-model="journeyForm.dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :shortcuts="dateShortcuts"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="预算范围" prop="budget">
                        <el-input-number
                            v-model="journeyForm.budgetMin"
                            :min="0"
                            :max="journeyForm.budgetMax"
                            placeholder="最小预算"
                        ></el-input-number>
                        <span class="budget-separator">-</span>
                        <el-input-number
                            v-model="journeyForm.budgetMax"
                            :min="journeyForm.budgetMin"
                            placeholder="最大预算"
                        ></el-input-number>
                    </el-form-item>
                    <el-form-item label="旅行关键词" prop="keywords">
                        <el-select
                            v-model="journeyForm.keywords"
                            multiple
                            placeholder="请选择旅行关键词"
                        >
                            <el-option label="纯玩" value="纯玩"></el-option>
                            <el-option label="会拍照" value="会拍照"></el-option>
                            <el-option label="特种兵穷游" value="特种兵穷游"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 步骤二：行程安排 -->
            <div v-if="activeStep === 1">
                <div v-for="(day, index) in journeyForm.schedule" :key="index" class="schedule-item">
                    <el-card>
                        <template #header>
                            <div class="schedule-header">
                                <span>第 {{ index + 1 }} 天</span>
                                <el-button type="danger" link @click="removeScheduleDay(index)">
                                    删除
                                </el-button>
                            </div>
                        </template>
                        <el-form-item label="日期" :prop="'schedule.' + index + '.date'">
                            <el-date-picker
                                v-model="day.date"
                                type="date"
                                placeholder="选择日期"
                            ></el-date-picker>
                        </el-form-item>
                        <el-form-item label="标题" :prop="'schedule.' + index + '.title'">
                            <el-input v-model="day.title" placeholder="请输入当天行程标题"></el-input>
                        </el-form-item>
                        <el-form-item label="描述" :prop="'schedule.' + index + '.description'">
                            <el-input
                                v-model="day.description"
                                type="textarea"
                                placeholder="请输入当天行程描述"
                            ></el-input>
                        </el-form-item>
                    </el-card>
                </div>
                <el-button type="primary" @click="addScheduleDay" class="add-schedule-btn">
                    添加行程安排
                </el-button>
            </div>

            <!-- 步骤三：确认提交 -->
            <div v-if="activeStep === 2">
                <div class="confirm-section">
                    <h3>请确认行程信息</h3>
                    <el-descriptions border column="1">
                        <el-descriptions-item label="行程标题">{{ journeyForm.title }}</el-descriptions-item>
                        <el-descriptions-item label="目的地">{{ journeyForm.location }}</el-descriptions-item>
                        <el-descriptions-item label="日期范围">
                            {{ journeyForm.dateRange[0] }} 至 {{ journeyForm.dateRange[1] }}
                        </el-descriptions-item>
                        <el-descriptions-item label="预算范围">
                            {{ journeyForm.budgetMin }} - {{ journeyForm.budgetMax }}
                        </el-descriptions-item>
                        <el-descriptions-item label="旅行关键词">
                            <el-tag v-for="k in journeyForm.keywords" :key="k" type="info" style="margin-right: 5px;">{{ k }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="封面图片">
                            <img v-if="journeyForm.coverImage" :src="journeyForm.coverImage" class="cover-image-mini">
                        </el-descriptions-item>
                    </el-descriptions>
                    <h4 style="margin-top:20px;">行程安排</h4>
                    <el-timeline>
                        <el-timeline-item
                            v-for="(day, index) in journeyForm.schedule"
                            :key="index"
                            :timestamp="day.date"
                            placement="top"
                        >
                            <el-card>
                                <h4>{{ day.title }}</h4>
                                <p>{{ day.description }}</p>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>
        </el-card>

        <div class="step-actions">
            <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
            <el-button v-if="activeStep < 2" type="primary" @click="nextStep">下一步</el-button>
            <el-button v-if="activeStep === 2" type="success" @click="submitForm">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const journeyFormRef = ref(null);
const activeStep = ref(0);

// 日期快捷选项
const dateShortcuts = [
    {
        text: '最近一周',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
        },
    },
    {
        text: '最近一个月',
        value: () => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
        },
    },
];

// 表单数据
const journeyForm = reactive({
    title: '',
    coverImage: '',
    location: '',
    dateRange: [],
    budgetMin: 0,
    budgetMax: 0,
    keywords: [],
    schedule: []
});

// 表单验证规则
const rules = {
    title: [
        { required: true, message: '请输入行程标题', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    coverImage: [
        { required: true, message: '请上传封面图片', trigger: 'change' }
    ],
    location: [
        { required: true, message: '请输入目的地', trigger: 'blur' }
    ],
    dateRange: [
        { required: true, message: '请选择日期范围', trigger: 'change' }
    ],
    keywords: [
        { required: true, message: '请选择旅行关键词', trigger: 'change' }
    ]
};

// 步骤切换
const nextStep = async () => {
    if (activeStep.value === 0) {
        // 校验基础信息
        if (!journeyFormRef.value) return;
        await journeyFormRef.value.validate((valid) => {
            if (valid) activeStep.value++;
        });
    } else {
        activeStep.value++;
    }
};
const prevStep = () => {
    if (activeStep.value > 0) activeStep.value--;
};

// 添加行程安排
const addScheduleDay = () => {
    journeyForm.schedule.push({
        date: '',
        title: '',
        description: ''
    });
};

// 删除行程安排
const removeScheduleDay = (index) => {
    journeyForm.schedule.splice(index, 1);
};

// 处理封面图片上传
const handleCoverSuccess = (response) => {
    journeyForm.coverImage = response.url;
};

// 上传前校验
const beforeCoverUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isImage) {
        ElMessage.error('上传文件只能是图片格式!');
        return false;
    }
    if (!isLt10M) {
        ElMessage.error('上传图片大小不能超过 10MB!');
        return false;
    }
    return true;
};

// 提交表单
const submitForm = async () => {
    // 最后一步可直接提交
    ElMessage.success('行程创建成功！');
    router.push('/plaza');
};

// 重置表单
const resetForm = () => {
    if (journeyFormRef.value) journeyFormRef.value.resetFields();
    journeyForm.title = '';
    journeyForm.coverImage = '';
    journeyForm.location = '';
    journeyForm.dateRange = [];
    journeyForm.budgetMin = 0;
    journeyForm.budgetMax = 0;
    journeyForm.keywords = [];
    journeyForm.schedule = [];
    activeStep.value = 0;
};
</script>

<style scoped>
.create-journey-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.journey-steps {
    margin-bottom: 30px;
}

.step-card {
    margin-bottom: 30px;
    padding: 30px 20px;
}

.cover-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 300px;
    height: 200px;
}

.cover-uploader:hover {
    border-color: #409EFF;
}

.cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 300px;
    height: 200px;
    text-align: center;
    line-height: 200px;
}

.cover-image {
    width: 300px;
    height: 200px;
    display: block;
    object-fit: cover;
}

.cover-image-mini {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
}

.budget-separator {
    margin: 0 10px;
}

.schedule-item {
    margin-bottom: 20px;
}

.schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-schedule-btn {
    margin-top: 10px;
}

.step-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.confirm-section {
    padding: 10px 0;
}
</style> 