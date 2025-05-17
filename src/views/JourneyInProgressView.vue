<template>
    <div class="journey-in-progress-view">
        <div v-if="journey" class="journey-header">
            <div class="journey-title">
                <h2>{{ journey.title }}</h2>
                <el-tag type="success">旅行中</el-tag>
            </div>
            <div class="journey-meta">
                <span>开始时间：{{ journey.startDate }}</span>
                <span>结束时间：{{ journey.endDate }}</span>
                <span class="budget">预算：¥{{ journey.budget }}</span>
            </div>
        </div>

        <el-row :gutter="20" v-if="journey">
            <!-- 左侧：每日计划与打卡 -->
            <el-col :span="16">
                <el-card class="itinerary-plan-card">
                    <template #header>
                        <div class="card-header">
                            <span>每日计划与打卡</span>
                        </div>
                    </template>
                    
                    <div class="itinerary-list">
                        <div v-for="(item, index) in itineraryItems" :key="item.id || index" class="itinerary-item">
                            <div class="item-header">
                                <span class="item-order">{{ index + 1 }}.</span>
                                <span class="item-date-time">{{ item.plandate }} {{ item.plantime }}</span>
                                <el-tag size="small" :type="getActivityTypeTag(item.activitytype)" class="item-type">{{ item.activitytype }}</el-tag>
                                <strong class="item-location">{{ item.location }}</strong>
                            </div>
                            <div class="item-details">
                                <p class="item-description">{{ item.description }}</p>
                            </div>
                            <div class="item-actions">
                                <el-button type="primary" @click="openCheckinDialog(item)">打卡</el-button>
                            </div>
                        </div>
                        <el-empty v-if="!itineraryItems || itineraryItems.length === 0" description="暂无行程计划"></el-empty>
                    </div>
                </el-card>

                <!-- 新增：该行程的打卡记录墙 -->
                <el-card class="journey-checkin-records-card" v-if="currentJourneyCheckins.length > 0">
                    <template #header>
                        <div class="card-header">
                            <span>本行程打卡记录</span>
                        </div>
                    </template>
                    <div class="records-list">
                        <el-card v-for="record in paginatedJourneyCheckins" :key="record.id" class="record-card-item">
                            <template #header>
                                <div class="record-header-item">
                                    <div class="user-info-item">
                                        <el-avatar :size="32" :src="record.userAvatar">{{ record.username.charAt(0) }}</el-avatar>
                                        <span class="username-item">{{ record.username }}</span>
                                    </div>
                                    <span class="checkin-time-item">{{ formatCheckinTimestamp(record.checked_in_at) }}</span>
                                </div>
                            </template>
                            <div class="record-content-item">
                                <h4 class="location-name-item">
                                    <el-icon><Location /></el-icon> {{ record.location_name }}
                                </h4>
                                <p v-if="record.description" class="description-item">{{ record.description }}</p>
                                <div v-if="record.tags && record.tags.length > 0" class="tags-section-item">
                                    <el-tag v-for="tag in record.tags" :key="tag" type="success" size="small" class="record-tag-item">{{ tag }}</el-tag>
                                </div>
                                <div v-if="record.photo_urls && record.photo_urls.length > 0" class="photos-section-item">
                                    <!-- <h5>照片：</h5> -->
                                    <div class="photos-grid-item">
                                        <el-image
                                            v-for="(url, index) in record.photo_urls"
                                            :key="index"
                                            :src="url"
                                            :preview-src-list="record.photo_urls"
                                            :initial-index="index"
                                            fit="cover"
                                            class="checkin-photo-item-thumb"
                                            lazy
                                        >
                                            <template #error>
                                                <div class="image-slot-item">
                                                    <el-icon><Picture /></el-icon>
                                                </div>
                                            </template>
                                        </el-image>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </div>
                    <div v-if="currentJourneyCheckins.length > checkinPageSize" class="pagination-container-item">
                        <el-pagination
                            small
                            background
                            layout="prev, pager, next"
                            :total="currentJourneyCheckins.length"
                            :page-size="checkinPageSize"
                            v-model:current-page="currentCheckinPage"
                        />
                    </div>
                </el-card>
                <el-empty v-else-if="journey" description="本行程暂无打卡记录"></el-empty>
            </el-col>

            <!-- 右侧：参与者和已打卡照片 -->
            <el-col :span="8">
                <el-card class="participants-card sticky-sidebar-card">
                     <template #header>
                        <div class="card-header">
                            <span>参与者</span>
                        </div>
                    </template>
                     <div class="participants-list" v-if="participants.length > 0">
                        <div v-for="participant in participants" :key="participant.id" class="participant-item">
                            <el-avatar :size="40" :src="participant.avatar">{{ participant.name.charAt(0) }}</el-avatar>
                            <span class="participant-name">{{ participant.name }} {{ participant.isCreator ? '(发起人)' : '(参与者)' }}</span>
                        </div>
                    </div>
                    <el-empty v-else description="暂无参与者信息"></el-empty>
                </el-card>

                <el-card class="checked-in-photos-card sticky-sidebar-card">
                    <template #header>
                        <div class="card-header">
                            <span>已打卡照片</span>
                        </div>
                    </template>
                    <div class="photos-grid" v-if="checkedInPhotos.length > 0">
                        <el-image 
                            v-for="(photo, index) in checkedInPhotos" 
                            :key="index" 
                            :src="photo.url" 
                            :preview-src-list="checkedInPhotos.map(p => p.url)"
                            :initial-index="index"
                            fit="cover"
                            class="checked-in-photo-item"
                            lazy
                        />
                    </div>
                    <el-empty v-else description="暂无已打卡照片"></el-empty>
                </el-card>
            </el-col>
        </el-row>
        <el-empty v-else description="加载中或行程不存在..."></el-empty>

        <!-- 打卡对话框 -->
        <el-dialog
            v-model="checkinDialogVisible"
            title="行程打卡"
            width="60%"
            @close="resetCheckinForm"
        >
            <el-form :model="checkinForm" label-width="100px" ref="checkinFormRef" class="checkin-form">
                <el-form-item label="打卡计划">
                    <el-input :value="currentPlanItem ? `${currentPlanItem.plandate} ${currentPlanItem.location}` : ''" disabled></el-input>
                </el-form-item>
                <el-form-item label="打卡内容" prop="text" :rules="{ required: true, message: '请输入打卡内容', trigger: 'blur' }">
                    <el-input type="textarea" :rows="4" v-model="checkinForm.text" placeholder="记录这一刻的想法..."></el-input>
                </el-form-item>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="上传图片" prop="images">
                            <el-upload
                                v-model:file-list="checkinForm.images"
                                action="#" 
                                list-type="picture-card"
                                :auto-upload="false"
                                :on-preview="handlePictureCardPreview"
                                :on-remove="handleImageRemove"
                                :on-change="handleImageChange"
                                class="dialog-uploader"
                            >
                                <el-icon><Plus /></el-icon>
                                <template #tip>
                                  <div class="el-upload__tip">
                                    可上传多张图片，单张不超过2MB
                                  </div>
                                </template>
                            </el-upload>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="当前位置" prop="location">
                            <el-input v-model="checkinForm.location" placeholder="如：大理古城南门">
                                <template #append>
                                    <el-button @click="getCurrentLocation" :icon="LocationIcon">获取</el-button> 
                                </template>
                            </el-input>
                             <!-- 可以在这里加一个地图预览的小组件，如果需要 -->
                        </el-form-item>
                         <el-form-item label="打卡标签" prop="tags">
                            <el-select
                                v-model="checkinForm.tags"
                                multiple
                                filterable
                                allow-create
                                default-first-option
                                placeholder="添加标签，如风景、美食"
                                style="width: 100%;"
                            >
                                <el-option v-for="tag in popularTags" :key="tag" :label="tag" :value="tag" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="checkinDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCheckin">提交打卡</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 图片预览对话框 -->
        <el-dialog v-model="imagePreviewVisible">
            <img w-full :src="previewImageUrl" alt="Preview Image" style="width: 100%;" />
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, Location, Picture } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// --- 模拟数据 ---
const journey = ref(null); 
const itineraryItems = ref([]);
const participants = ref([]); // 新增：参与者模拟数据
const checkedInPhotos = ref([]); // 新增：已打卡照片模拟数据
const allJourneysMock = [ // Using similar mock structure from MyJourneys for consistency
    {
        id: 1,
        title: '云南大理之旅',
        description: '探索大理古城，感受白族文化',
        startDate: '2025-05-20',
        endDate: '2025-05-25',
        budget: 2000,
        status: 'inProgress',
        dailyPlans: [
            { id: 101, plandate: '2025-05-20', plantime: '09:00', location: '大理古城', activitytype: '游玩', description: '漫步古城，体验白族风情' },
            { id: 102, plandate: '2025-05-20', plantime: '12:30', location: '古城食府', activitytype: '餐饮', description: '品尝白族特色菜' },
            { id: 103, plandate: '2025-05-21', plantime: '10:00', location: '洱海', activitytype: '游玩', description: '环洱海骑行，欣赏湖光山色' },
        ],
        participants: [
            { id: 1, name: '蘑菇', avatar: require('@/assets/mogu.jpg'), isCreator: true },
            { id: 2, name: '小小月亮', avatar: require('@/assets/avatar4.jpg'), isCreator: false },
        ],
        photos: [
            { url: require('@/assets/dali.png') }, // 使用行程封面或专门的打卡图片
            { url: require('@/assets/tibet.png') }, // 仅为示例
            { url: require('@/assets/tokyo.jpg') },
        ]
    },
    {
        id: 3,
        title: '日本东京动漫考察',
        description: '秋叶原、涩谷，动漫迷的梦想之旅',
        startDate: '2025-04-10',
        endDate: '2025-04-18',
        budget: 8000,
        status: 'inProgress',
        dailyPlans: [
            { id: 301, plandate: '2025-04-10', plantime: '14:00', location: '秋叶原', activitytype: '购物', description: '动漫周边、电器城' },
            { id: 302, plandate: '2025-04-11', plantime: '11:00', location: '涩谷SKY', activitytype: '游玩', description: '俯瞰东京全景' },
        ],
        participants: [
          { id: 1, name: '鱼丸粗面', avatar: require('@/assets/avatar3.jpg'), isCreator: true },
          { id: 2, name: '蘑菇', avatar: require('@/assets/mogu.jpg'), isCreator: false },
        ],
        photos: [] // 该行程暂无打卡照片
    }
];

// 全局模拟打卡记录 (对应之前的 TravelRecords.vue 中的数据源)
// 这些数据将用于筛选出当前行程的打卡记录
const allCheckinRecordsMock = ref([
    {
        id: 1, journey_id: 1, journeyTitle: '云南大理之旅', user_id: 101, username: '蘑菇',
        userAvatar: require('@/assets/mogu.jpg'), location_name: '大理古城南门', photo_urls: [require('@/assets/dali.png')],
        description: '终于来到大理古城啦！', tags: ['古城', '开心'], checked_in_at: '2024-05-20T10:30:00Z'
    },
    {
        id: 2, journey_id: 1, journeyTitle: '云南大理之旅', user_id: 102, username: '小小月亮',
        userAvatar: require('@/assets/avatar4.jpg'), location_name: '洱海生态廊道', photo_urls: [require('@/assets/tibet.png')],
        description: '洱海边的骑行太惬意了。', tags: ['自然风光', '骑行'], checked_in_at: '2024-05-21T15:00:00Z'
    },
    {
        id: 3, journey_id: 3, journeyTitle: '日本东京动漫考察', user_id: 101, username: '蘑菇',
        userAvatar: require('@/assets/mogu.jpg'), location_name: '秋叶原电器街', photo_urls: [require('@/assets/tokyo.jpg')],
        description: '秋叶原，二次元的天堂！', tags: ['动漫', '购物'], checked_in_at: '2024-04-10T14:30:00Z'
    },
    {
        id: 4, journey_id: 1, journeyTitle: '云南大理之旅', user_id: 101, username: '蘑菇',
        userAvatar: require('@/assets/mogu.jpg'), location_name: '喜洲古镇', photo_urls: [/* require('@/assets/xizhou.jpg') */], // 假设有图片
        description: '喜洲粑粑很好吃！', tags: ['美食', '古镇'], checked_in_at: '2024-05-22T12:30:00Z'
    }
]);

// --- 打卡对话框状态 ---
const checkinDialogVisible = ref(false);
const currentPlanItem = ref(null); // 当前要打卡的计划项
const checkinFormRef = ref(null);
const checkinForm = reactive({
    text: '',
    images: [],
    uploadedImageUrls: [],
    location: '',
    tags: []
});

// 新增：热门或预设标签
const popularTags = ref(['风景', '美食', '人文', '住宿', '购物', '交通']);

// --- 图片上传相关 ---
const imagePreviewVisible = ref(false);
const previewImageUrl = ref('');

const handlePictureCardPreview = (file) => {
  previewImageUrl.value = file.url; // el-upload的file对象包含url
  imagePreviewVisible.value = true;
};

const handleImageRemove = (file, fileList) => {
  console.log('Removed file:', file);
  checkinForm.images = fileList;
};

const handleImageChange = (file, fileList) => {
  // 在这里可以进行文件大小/类型的校验
  // 由于auto-upload=false, 文件实际上传在提交打卡时处理
  console.log('Changed file:', file);
  checkinForm.images = fileList; 
};

// --- 方法 ---
const fetchJourneyDetails = (id) => {
    console.log('Fetching in-progress journey details for ID:', id);
    const journeyIdNum = parseInt(id);
    const foundJourney = allJourneysMock.find(j => j.id === journeyIdNum && j.status === 'inProgress');
    if (foundJourney) {
        journey.value = {
            id: foundJourney.id,
            title: foundJourney.title,
            startDate: foundJourney.startDate,
            endDate: foundJourney.endDate,
            budget: foundJourney.budget,
            status: foundJourney.status,
        };
        itineraryItems.value = foundJourney.dailyPlans || [];
        participants.value = foundJourney.participants || []; // 加载参与者数据
        checkedInPhotos.value = foundJourney.photos || []; // 加载已打卡照片数据
    } else {
        ElMessage.error('未找到进行中的行程或行程ID无效');
        // router.push('/my-journeys'); // Or some error page
    }
};

const getActivityTypeTag = (type) => {
    // 与 JourneyManage.vue 保持一致或根据需要调整
    const types = { '游玩': 'success', '餐饮': 'warning', '交通': 'info', '住宿': 'primary', '购物': 'danger', '其他': '' };
    return types[type] || 'default';
};

const openCheckinDialog = (planItem) => {
    currentPlanItem.value = planItem;
    // 根据需要，可以预填一些信息到checkinForm，比如地点
    // checkinForm.location = planItem.location; 
    checkinDialogVisible.value = true;
};

const resetCheckinForm = () => {
    if (checkinFormRef.value) {
        checkinFormRef.value.resetFields();
    }
    checkinForm.text = '';
    checkinForm.images = [];
    checkinForm.uploadedImageUrls = [];
    checkinForm.location = '';
    checkinForm.tags = [];
    currentPlanItem.value = null;
};

const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // TODO: 使用地理位置反编码服务将经纬度转换为具体地址名称
                checkinForm.location = `经度: ${lon.toFixed(4)}, 纬度: ${lat.toFixed(4)}`;
                ElMessage.success('获取位置成功 (模拟)');
            },
            (error) => {
                ElMessage.error('获取位置失败: ' + error.message);
                console.error("Geolocation error: ", error);
            }
        );
    } else {
        ElMessage.warning('您的浏览器不支持地理位置服务。');
    }
};

const submitCheckin = async () => {
    if (!checkinFormRef.value) return;
    try {
        const valid = await checkinFormRef.value.validate();
        if (valid) {
            // 1. 处理图片上传 (如果 auto-upload 为 false)
            // 假设上传图片后会得到 URL 列表
            // for (const file of checkinForm.images) {
            //   const imageUrl = await uploadImageApi(file.raw); // 伪代码
            //   checkinForm.uploadedImageUrls.push(imageUrl);
            // }

            const checkinData = {
                journeyId: journey.value.id,
                planItemId: currentPlanItem.value.id,
                text: checkinForm.text,
                images_mock: checkinForm.images.map(f => ({ name: f.name, url: f.url || 'mock_url_for_' + f.name })), // 模拟图片信息
                location: checkinForm.location,
                tags: checkinForm.tags,
                timestamp: new Date().toISOString()
            };
            
            console.log('Submitting check-in data:', checkinData);
            // TODO: 调用后端 API 提交打卡数据
            // await submitCheckinApi(checkinData); 

            ElMessage.success(`为 "${currentPlanItem.value.location}" 打卡成功!`);
            checkinDialogVisible.value = false;
            // 可以在成功后刷新打卡列表或做其他操作
        } else {
            console.log('Check-in form validation failed');
            return false;
        }
    } catch (error) {
        console.error('Error submitting check-in:', error);
        ElMessage.error('打卡失败，请稍后再试。');
    }
};

// 当前行程的打卡记录相关
const currentJourneyCheckins = computed(() => {
    if (!journey.value) return [];
    return allCheckinRecordsMock.value.filter(record => record.journey_id === journey.value.id);
});

const currentCheckinPage = ref(1);
const checkinPageSize = ref(3); // 每页显示3条打卡记录

const paginatedJourneyCheckins = computed(() => {
    const start = (currentCheckinPage.value - 1) * checkinPageSize.value;
    const end = start + checkinPageSize.value;
    return currentJourneyCheckins.value.slice(start, end);
});

const formatCheckinTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
    const journeyId = route.params.id;
    if (journeyId) {
        fetchJourneyDetails(journeyId);
    } else {
        ElMessage.error('无效的行程ID');
        router.push('/my-journeys'); // Redirect if no ID
    }
});

</script>

<style scoped>
.journey-in-progress-view {
    padding: 20px;
}

.journey-header {
    background-color: #f7f8fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.journey-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.journey-title h2 {
    margin: 0;
    font-size: 24px;
}

.journey-meta {
    font-size: 14px;
    color: #666;
    display: flex;
    gap: 20px;
}

.journey-meta .budget {
    color: #f56c6c;
    font-weight: bold;
}

.itinerary-plan-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
}

.itinerary-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.itinerary-item {
    border: 1px solid #e0e0e0;
    padding: 15px;
    border-radius: 6px;
    background-color: #fff;
    transition: box-shadow 0.3s;
}

.itinerary-item:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.item-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 16px;
}

.item-order {
    color: #999;
    font-weight: bold;
}
.item-date-time {
    color: #333;
}
.item-type {
    margin-left: 5px;
}
.item-location {
    color: #1a1a1a;
    font-weight: 500;
}


.item-details {
    margin-bottom: 10px;
    color: #555;
    font-size: 14px;
}

.item-description {
    margin: 0;
    white-space: pre-wrap; /* Preserve line breaks in description */
}

.item-actions {
    text-align: right;
}

/* Styles for el-upload */
:deep(.el-upload--picture-card) {
    width: 80px;
    height: 80px;
    line-height: 88px; /* Adjust for icon centering */
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 80px;
    height: 80px;
}

.sticky-sidebar-card {
    position: sticky;
    top: 20px; /* Adjust as needed based on your header height */
    margin-bottom: 20px;
}

.participants-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.participant-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.participant-name {
    font-size: 14px;
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
}

.checked-in-photo-item {
    width: 100%;
    height: 100px; /* Or aspect-ratio: 1 / 1 for square */
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #eee;
}

.checkin-form .el-form-item {
    margin-bottom: 18px; /* 调整表单项间距 */
}

.dialog-uploader :deep(.el-upload--picture-card) {
    width: 100px; /* 调整上传框大小 */
    height: 100px;
    line-height: 108px;
}

.dialog-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
}

.el-upload__tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

/* 新增：行程内打卡记录列表的样式 */
.journey-checkin-records-card {
    margin-top: 20px;
}

.record-card-item {
    margin-bottom: 15px;
    background-color: #fdfdfd;
}
.record-card-item:last-child {
    margin-bottom: 0;
}

.record-header-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
}

.user-info-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username-item {
    font-weight: 500;
}

.checkin-time-item {
    color: #999;
}

.record-content-item {
    padding-top: 8px;
}

.location-name-item {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
    display: flex;
    align-items: center;
    gap: 4px;
}

.description-item {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    white-space: pre-wrap;
    line-height: 1.5;
}

.tags-section-item {
    margin-bottom: 8px;
}
.record-tag-item {
    margin-right: 4px;
    margin-bottom: 4px;
}

.photos-section-item h5 {
    font-size: 13px;
    color: #333;
    margin-bottom: 5px;
}

.photos-grid-item {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-bottom: 8px;
}

.checkin-photo-item-thumb {
    width: 100%;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #eee;
    background-color: #f5f7fa;
}

.image-slot-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 20px;
    color: #c0c4cc;
}

.pagination-container-item {
    margin-top: 15px;
    display: flex;
    justify-content: center;
}
</style> 