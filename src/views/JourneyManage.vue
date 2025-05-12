<template>
    <div class="journey-manage">
        <div class="journey-header">
            <div class="journey-title">
                <h2>{{ journey.title }}</h2>
                <el-tag type="success" v-if="journey.status === 'ongoing'">进行中</el-tag>
                <el-tag type="info" v-else-if="journey.status === 'published'">招募中</el-tag>
                <el-tag type="warning" v-else-if="journey.status === 'planning'">计划中</el-tag>
                <el-tag type="danger" v-else-if="journey.status === 'completed'">已结束</el-tag>
            </div>
            <div class="journey-meta">
                <span>开始时间：{{ journey.startDate }}</span>
                <span>结束时间：{{ journey.endDate }}</span>
                <span class="budget">预算：¥{{ journey.budget }}</span>
            </div>
        </div>

        <el-row :gutter="20" class="journey-content">
            <el-col :span="16">
                <!-- 行程计划协作区 -->
                <el-card class="itinerary-plan-card">
                    <template #header>
                        <div class="card-header">
                            <span>行程计划协作</span>
                            <el-button type="primary" @click="addItineraryItem">添加计划项</el-button>
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
                                <div class="item-meta">
                                    <span v-if="item.transport">交通：{{ item.transport }}</span>
                                    <span v-if="item.budget">预算：¥{{ item.budget }}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <el-button type="primary" link @click="editItineraryItem(item)">编辑</el-button>
                                <el-button type="danger" link @click="deleteItineraryItem(index)">删除</el-button>
                            </div>
                        </div>
                        <el-empty v-if="!itineraryItems || itineraryItems.length === 0" description="暂无行程计划"></el-empty>
                    </div>
                </el-card>

                <!-- 留言板 -->
                <el-card class="message-board-card">
                    <template #header>
                        <div class="card-header">
                            <span>留言板</span>
                        </div>
                    </template>
                    <div class="message-list">
                        <div v-for="msg in messages" :key="msg.id" :class="['message-item', msg.type === 'system' ? 'system-message' : 'user-message']">
                            <div class="message-header" v-if="msg.type !== 'system'">
                                <el-avatar :size="32" :src="msg.avatar">{{ msg.author.charAt(0) }}</el-avatar>
                                <span class="message-author">{{ msg.author }}</span>
                                <span class="message-time">{{ msg.time }}</span>
                            </div>
                            <div class="message-content">{{ msg.content }}</div>
                        </div>
                         <el-empty v-if="!messages || messages.length === 0" description="暂无留言"></el-empty>
                    </div>
                    <div class="message-input">
                        <el-input
                            v-model="newMessage"
                            type="textarea"
                            :rows="2"
                            placeholder="输入留言内容..."
                        />
                        <el-button type="primary" @click="submitMessage">发送</el-button>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <!-- 参与者信息 -->
                <el-card class="participants-card">
                     <template #header>
                        <div class="card-header">
                            <span>参与者</span>
                        </div>
                    </template>
                     <div class="participants-list">
                        <div v-for="participant in participants" :key="participant.id" class="participant-item">
                            <el-avatar :size="40" :src="participant.avatar">{{ participant.name.charAt(0) }}</el-avatar>
                            <span class="participant-name">{{ participant.name }} {{ participant.isCreator ? '(发起人)' : '(参与者)' }}</span>
                            <!-- 可以根据需要添加在线状态等 -->
                        </div>
                    </div>
                </el-card>

                <!-- 信息留档 -->
                <el-card class="files-card">
                    <template #header>
                        <div class="card-header">
                            <span>信息留档</span>
                            <el-upload
                                action="#" 
                                :auto-upload="false"
                                :show-file-list="false" 
                                :on-change="handleFileChange">
                                <el-button type="primary" link>上传文件</el-button>
                            </el-upload>
                        </div>
                    </template>
                    <div class="files-list">
                        <div v-for="file in files" :key="file.id" class="file-item">
                            <el-icon><Document /></el-icon>
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-size">{{ file.size }}</span>
                            <el-button type="primary" link @click="downloadFile(file)">下载</el-button>
                            <!-- 可以添加删除文件按钮 -->
                        </div>
                        <el-empty v-if="!files || files.length === 0" description="暂无文件"></el-empty>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 添加/编辑行程计划项对话框 -->
        <el-dialog
            v-model="itineraryDialogVisible"
            :title="editingItineraryItem === null ? '添加计划项' : '编辑计划项'"
            width="60%">
            <el-form :model="itineraryForm" label-width="100px" ref="itineraryFormRef">
                <el-row :gutter="20">
                     <el-col :span="12">
                        <el-form-item label="计划日期" prop="plandate" :rules="{ required: true, message: '请选择日期', trigger: 'change' }">
                             <el-date-picker v-model="itineraryForm.plandate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                        </el-form-item>
                    </el-col>
                     <el-col :span="12">
                        <el-form-item label="计划时间" prop="plantime">
                             <el-time-picker v-model="itineraryForm.plantime" placeholder="选择时间 (可选)" value-format="HH:mm" style="width: 100%;"></el-time-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                 <el-form-item label="地点名称" prop="location" :rules="{ required: true, message: '请输入地点名称', trigger: 'blur' }">
                    <el-input v-model="itineraryForm.location" placeholder="请输入地点名称"></el-input>
                </el-form-item>
                 <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="活动类型" prop="activitytype">
                            <el-select v-model="itineraryForm.activitytype" placeholder="选择活动类型" style="width: 100%;">
                                <el-option label="游玩" value="游玩"></el-option>
                                <el-option label="餐饮" value="餐饮"></el-option>
                                <el-option label="交通" value="交通"></el-option>
                                <el-option label="住宿" value="住宿"></el-option>
                                <el-option label="购物" value="购物"></el-option>
                                <el-option label="其他" value="其他"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                         <el-form-item label="交通方式" prop="transport">
                            <el-input v-model="itineraryForm.transport" placeholder="如：飞机、火车、自驾、步行"></el-input>
                        </el-form-item>
                    </el-col>
                 </el-row>
                <el-form-item label="活动描述/备注" prop="description">
                    <el-input type="textarea" v-model="itineraryForm.description" placeholder="详细描述活动内容或备注信息"></el-input>
                </el-form-item>
                 <el-form-item label="预算估算" prop="budget">
                     <el-input-number v-model="itineraryForm.budget" :min="0" placeholder="可选"></el-input-number>
                </el-form-item>
                <!-- plan_item_order 和 journey_id 通常由后端处理或在保存时确定 -->
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="itineraryDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveItineraryItem">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { Document, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();

// --- 模拟数据 --- 
// 实际应用中这些数据应通过 API 根据 route.params.id 获取
const journey = ref({}); 
const itineraryItems = ref([]); // 行程计划项
const participants = ref([]); // 参与者信息
const messages = ref([]); // 留言板消息
const files = ref([]); // 信息留档文件

// 当前登录用户 (模拟)
const currentUser = ref({ id: 1, name: '蘑菇', avatar: require('@/assets/mogu.jpg') }); 

// --- 状态变量 ---
const itineraryDialogVisible = ref(false);
const editingItineraryItem = ref(null); // 保存正在编辑的计划项对象
const newMessage = ref(''); // 留言板输入
const itineraryFormRef = ref(null); // 表单引用

// --- 表单数据 ---
const itineraryForm = reactive({
    id: null, // 用于编辑时区分
    plandate: '',
    plantime: '',
    location: '',
    activitytype: '',
    transport: '',
    description: '',
    budget: 0,
    // journey_id 和 plan_item_order 在保存时处理
});

// --- 方法 ---

// 获取行程数据 (模拟)
const fetchJourneyData = (id) => {
    console.log('Fetching manage journey details for ID:', id);
    // TODO: 调用 API 获取行程详情、行程计划、参与者、留言、文件等
    
    // 模拟数据填充 (仅 ID 为 1 的大理之旅)
    if (id === '1') { 
        journey.value = {
            id: 1,
            title: '云南大理之旅',
            status: 'ongoing',
            startDate: '2025-05-20',
            endDate: '2025-05-25',
            budget: 2000,
            description: '探索大理古城，感受白族文化'
        };
        
        // 模拟参与者 (双人)
        participants.value = [
            { id: 1, name: '蘑菇', avatar: require('@/assets/mogu.jpg'), isCreator: true },
            { id: 4, name: '小小月亮', avatar: require('@/assets/avatar4.jpg'), isCreator: false } // 假设有 avatar4.png
        ];

        // 模拟行程计划项 (基于 schema)
        itineraryItems.value = [
             {
                id: 101, journey_id: 1, plan_item_order: 0, plandate: '2025-05-20', plantime: '14:00', location: '大理古城客栈', 
                activitytype: '住宿', transport: '', description: '抵达大理，办理入住', budget: 300, created: '2024-03-10', note: ''
            },
            {
                id: 102, journey_id: 1, plan_item_order: 1, plandate: '2025-05-21', plantime: '09:00', location: '洱海东路', 
                activitytype: '游玩', transport: '自行车', description: '租车环洱海骑行，途径小普陀，欣赏风景', budget: 150, created: '2024-03-10', note: '注意防晒'
            },
             {
                id: 103, journey_id: 1, plan_item_order: 2, plandate: '2025-05-22', plantime: '10:00', location: '崇圣寺三塔', 
                activitytype: '游玩', transport: '打车', description: '参观著名的三塔公园', budget: 120, created: '2024-03-11', note: '门票提前购买'
            },
             {
                id: 104, journey_id: 1, plan_item_order: 3, plandate: '2025-05-23', plantime: '09:30', location: '苍山', 
                activitytype: '游玩', transport: '缆车', description: '乘坐感通索道上山，俯瞰洱海全景', budget: 200, created: '2024-03-11', note: '山上可能较冷'
            },
             {
                id: 105, journey_id: 1, plan_item_order: 4, plandate: '2025-05-24', plantime: '全天', location: '大理古城', 
                activitytype: '餐饮', transport: '步行', description: '自由闲逛，品尝当地特色小吃，如烤乳扇、饵块等', budget: 200, created: '2024-03-12', note: ''
            },
            {
                id: 106, journey_id: 1, plan_item_order: 5, plandate: '2025-05-25', plantime: '13:00', location: '大理机场/火车站', 
                activitytype: '交通', transport: '送机/站', description: '整理行装，前往机场/火车站返程', budget: 100, created: '2024-03-12', note: '提前预约车辆'
            },
        ];

        // 模拟留言板消息
        messages.value = [
            { id: 201, type: 'user', author: '小小月亮', avatar: require('@/assets/avatar4.jpg'), content: '机票已经订好了，大家记得确认时间', time: '2025-04-20 14:35' },
            { id: 202, type: 'system', content: '蘑菇申请修改洱海骑行计划的时间', time: '2025-04-21 10:15' },
            { id: 203, type: 'system', content: '蘑菇修改了洱海骑行计划的备注', time: '2025-03-41 11:00' },
        ];

        // 模拟信息留档文件
        files.value = [
            { id: 1, name: '大理行程规划.pdf', size: '2.5MB', url: '#' }, 
            { id: 2, name: '住宿信息.docx', size: '1.2MB', url: '#' },
            { id: 3, name: '机票账单.jpg', size: '0.8MB', url: '#' } // 新增文件
        ];
    } else {
        // 处理无效 ID 或其他行程 (这里简化处理)
        ElMessage.error('无法加载行程信息或此行程非协作模式');
        journey.value = {};
        itineraryItems.value = [];
        participants.value = [];
        messages.value = [];
        files.value = [];
    }
};

// 获取活动类型对应的 Tag 类型
const getActivityTypeTag = (type) => {
    switch (type) {
        case '餐饮': return 'warning';
        case '交通': return 'info';
        case '住宿': return 'danger';
        case '游玩': return 'success';
        case '购物': return 'primary';
        default: return ''; // 默认
    }
};

// 行程计划项相关方法
const addItineraryItem = () => {
    editingItineraryItem.value = null; // 确保是新增
    // 重置表单
    Object.assign(itineraryForm, {
        id: null, plandate: '', plantime: '', location: '', activitytype: '',
        transport: '', description: '', budget: 0
    });
    itineraryDialogVisible.value = true;
};

const editItineraryItem = (item) => {
    editingItineraryItem.value = item; // 保存正在编辑的对象
    // 将编辑对象的值填充到表单
    Object.assign(itineraryForm, item); 
    itineraryDialogVisible.value = true;
};

const saveItineraryItem = async () => {
    if (!itineraryFormRef.value) return;
    try {
        await itineraryFormRef.value.validate(); // 触发表单验证
        // TODO: 调用 API 保存行程计划项
        const itemDataToSave = { ...itineraryForm };
        
        if (editingItineraryItem.value) {
            // 编辑模式：找到对应项并更新
            const index = itineraryItems.value.findIndex(i => i.id === editingItineraryItem.value.id);
            if (index !== -1) {
                // 注意：实际应用中 ID 和 order 应由后端生成或确认
                itineraryItems.value[index] = { ...itineraryItems.value[index], ...itemDataToSave }; 
                // 添加系统消息 (模拟)
                 messages.value.push({ id: Date.now(), type: 'system', content: `${currentUser.value.name} 修改了计划项: ${itemDataToSave.location}`, time: new Date().toLocaleString() });
            }
        } else {
            // 新增模式
            // 注意：实际应用中 ID 和 order 应由后端生成
            const newItem = { ...itemDataToSave, id: Date.now(), plan_item_order: itineraryItems.value.length }; 
            itineraryItems.value.push(newItem);
             // 添加系统消息 (模拟)
            messages.value.push({ id: Date.now(), type: 'system', content: `${currentUser.value.name} 添加了计划项: ${newItem.location}`, time: new Date().toLocaleString() });
        }
        itineraryDialogVisible.value = false;
        ElMessage.success('保存成功');
    } catch (error) {
        console.log('表单验证失败', error);
        ElMessage.warning('请检查表单信息');
    }
};

const deleteItineraryItem = (index) => {
    ElMessageBox.confirm('确定要删除此计划项吗?', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // TODO: 调用 API 删除计划项
        const deletedItem = itineraryItems.value[index];
        itineraryItems.value.splice(index, 1);
         // 添加系统消息 (模拟)
        messages.value.push({ id: Date.now(), type: 'system', content: `${currentUser.value.name} 删除了计划项: ${deletedItem.location}`, time: new Date().toLocaleString() });
        ElMessage.success('删除成功');
    }).catch(() => {});
};

// 留言板相关方法
const submitMessage = () => {
    if (!newMessage.value.trim()) {
        ElMessage.warning('请输入留言内容');
        return;
    }
    // TODO: 调用 API 提交留言
    messages.value.push({
        id: Date.now(), // 临时 ID
        type: 'user',
        author: currentUser.value.name,
        avatar: currentUser.value.avatar,
        content: newMessage.value,
        time: new Date().toLocaleString()
    });
    newMessage.value = '';
    ElMessage.success('留言成功');
};

// 文件相关方法
const handleFileChange = (uploadFile) => {
    // TODO: 实现文件上传功能 (调用API上传 uploadFile.raw)
    console.log('选择的文件:', uploadFile);
    // 模拟上传成功并添加到列表
     files.value.push({
        id: Date.now(), // 临时 ID
        name: uploadFile.name,
        size: (uploadFile.size / 1024 / 1024).toFixed(2) + 'MB',
        url: '#' // 应为实际下载链接
    });
    ElMessage.success(`${uploadFile.name} 上传成功`);
};

const downloadFile = (file) => {
    // TODO: 实现文件下载功能 (根据 file.url)
    console.log('下载文件:', file);
     ElMessage.info(`开始下载 ${file.name}`);
     // window.location.href = file.url; // 简单下载方式
};

// --- 生命周期钩子 ---
onMounted(() => {
    const journeyId = route.params.id;
    if (journeyId) {
        fetchJourneyData(journeyId); // 加载模拟数据或调用 API
    } else {
        ElMessage.error('无效的行程ID');
    }
});
</script>

<style scoped>
.journey-manage {
    padding: 20px;
}

.journey-header {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.journey-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.journey-title h2 {
    margin: 0;
}

.journey-meta {
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
    gap: 15px; /* 间距 */
    color: #666;
    font-size: 14px;
}

.journey-meta .budget {
    color: #f56c6c;
    font-weight: bold;
}

.journey-content {
    margin-top: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header span {
    font-weight: bold;
    font-size: 16px;
}

.itinerary-plan-card,
.message-board-card,
.participants-card,
.files-card {
    margin-bottom: 20px;
}

/* 行程计划列表 */
.itinerary-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.itinerary-item {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 15px;
    position: relative; /* 为了编辑按钮定位 */
}

.item-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap; /* 允许换行 */
}

.item-order {
    font-weight: bold;
    color: #999;
}

.item-date-time {
    color: #333;
    font-weight: 500;
}

.item-type {
    margin-left: 5px;
}

.item-location {
     margin-left: 5px;
}

.item-details {
    padding-left: 25px; /* 与序号对齐 */
    margin-bottom: 10px;
}
.item-description {
    color: #555;
    margin: 0 0 8px 0;
    line-height: 1.5;
}
.item-meta {
    font-size: 13px;
    color: #888;
    display: flex;
    gap: 15px;
}

.item-actions {
    position: absolute;
    top: 10px;
    right: 10px;
}

/* 留言板 */
.message-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
    padding-right: 10px; /* 防止滚动条遮挡 */
}

.message-item {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}
.message-item:last-child {
    border-bottom: none;
}

.user-message .message-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.message-author {
    font-weight: bold;
}

.message-time {
    color: #aaa;
    font-size: 12px;
    margin-left: auto; /* 时间推到右边 */
}

.message-content {
    color: #666;
    line-height: 1.6;
    word-wrap: break-word;
    padding-left: 42px; /* 与头像对齐 */
}

.system-message .message-content {
    padding-left: 0;
    font-size: 13px;
    color: #999;
    font-style: italic;
}

.message-input {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

/* 参与者 */
.participants-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.participant-item {
    display: flex;
    align-items: center;
    gap: 10px;
}
.participant-name {
    font-weight: 500;
}

/* 文件列表 */
.files-list {
     max-height: 300px;
    overflow-y: auto;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.file-item:last-child {
    border-bottom: none;
}

.file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
}

.file-size {
    color: #999;
    font-size: 12px;
    margin-left: auto; /* 推到右边 */
    padding-left: 10px;
}

.file-item .el-icon {
    font-size: 16px;
    color: #666;
}

</style> 