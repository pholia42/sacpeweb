<template>
    <div class="my-journeys-container">
        <el-row :gutter="20">
            <el-col :span="6">
                <div class="sidebar">
                    <el-card class="user-card">
                        <div class="user-info">
                            <el-avatar :size="64" :src="user.avatar">{{ userInitials }}</el-avatar>
                            <div class="user-meta">
                                <div class="user-name">{{ user.nickname }}</div>
                                <div class="user-stats">
                                    <span>行程数 <b>{{ user.journeyCount }}</b></span>
                                    <span>打卡数 <b>{{ user.checkinCount }}</b></span>
                                </div>
                            </div>
                        </div>
                    </el-card>
                    <el-card class="calendar-card">
                        <el-calendar v-model="calendarDate">
                            <template #header="{ date }">
                                <div class="calendar-header">
                                    <span>{{ formatCalendarHeader(date) }}</span>
                                </div>
                            </template>
                            <template #dateCell="{ data }">
                                <div :class="getDateClass(data)">
                                    <p class="date-number">{{ data.day.split('-').slice(2).join('') }}</p>
                                    <div v-if="getJourneyOnDate(data.day)" class="journey-dot"></div>
                                    <div v-if="getJourneyStartDate(data.day)" class="journey-start-tag" @click="viewJourneyOnDate(data.day)">
                                        <el-tag size="small" type="success">{{ getJourneyTitle(data.day) }}</el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-calendar>
                    </el-card>
                </div>
            </el-col>
            <el-col :span="18">
                <div class="header">
                    <h2>我的旅程</h2>
                    <el-button type="primary" @click="goToCreateJourney">创建新旅程</el-button>
                </div>

                <el-tabs v-model="activeTab">
                    <el-tab-pane label="规划中" name="planning">
                        <div class="journey-list" v-if="planningJourneys.length > 0">
                            <el-card v-for="journey in planningJourneys" :key="journey.id" class="journey-card">
                                <template #header>
                                    <div class="journey-header">
                                        <h3>{{ journey.title }}</h3>
                                        <el-tag type="warning">规划中</el-tag>
                                    </div>
                                </template>
                                <div class="journey-content-wrapper">
                                    <div class="journey-content">
                                        <p>{{ journey.description }}</p>
                                        <div class="journey-tags">
                                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                                                {{ tag }}
                                            </el-tag>
                                        </div>
                                        <div class="journey-info">
                                            <span>开始时间：{{ journey.startDate }}</span>
                                            <span>结束时间：{{ journey.endDate }}</span>
                                            <span class="budget">预算：¥{{ journey.budget }}</span>
                                        </div>
                                        <div class="journey-actions">
                                            <el-button type="primary" @click="startTrip(journey.id)">开始出发</el-button>
                                            <el-button @click="manageJourney(journey.id)">管理旅程</el-button>
                                        </div>
                                    </div>
                                    <div class="journey-image" v-if="journey.coverImage">
                                        <img :src="journey.coverImage" :alt="journey.title">
                                    </div>
                                </div>
                            </el-card>
                        </div>
                        <el-empty v-else description="暂无规划中的行程"></el-empty>
                    </el-tab-pane>

                    <el-tab-pane label="旅行中" name="inProgress">
                        <div class="journey-list" v-if="inProgressJourneys.length > 0">
                            <el-card v-for="journey in inProgressJourneys" :key="journey.id" class="journey-card in-progress-card">
                                <template #header>
                                    <div class="journey-header">
                                        <h3>{{ journey.title }}</h3>
                                        <el-tag type="success">旅行中</el-tag>
                                    </div>
                                </template>
                                <div class="journey-content-wrapper">
                                    <div class="journey-content">
                                        <p>{{ journey.description }}</p>
                                        <div class="journey-tags">
                                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                                                {{ tag }}
                                            </el-tag>
                                        </div>
                                        <div class="journey-info">
                                            <span>开始时间：{{ journey.startDate }}</span>
                                            <span>结束时间：{{ journey.endDate }}</span>
                                            <span class="budget">预算：¥{{ journey.budget }}</span>
                                        </div>
                                        <div class="journey-actions">
                                            <el-button type="success" @click="goToInProgressJourneyView(journey.id)">查看行程进展</el-button>
                                        </div>
                                    </div>
                                    <div class="journey-image" v-if="journey.coverImage">
                                        <img :src="journey.coverImage" :alt="journey.title">
                                    </div>
                                </div>
                            </el-card>
                        </div>
                        <el-empty v-else description="暂无旅行中的行程"></el-empty>
                    </el-tab-pane>

                    <el-tab-pane label="组队中" name="recruiting">
                        <div class="journey-list" v-if="recruitingJourneys.length > 0">
                            <el-card v-for="journey in recruitingJourneys" :key="journey.id" class="journey-card">
                                <template #header>
                                    <div class="journey-header">
                                        <h3>{{ journey.title }}</h3>
                                        <el-tag type="info">组队中</el-tag>
                                    </div>
                                </template>
                                <div class="journey-content-wrapper">
                                    <div class="journey-content">
                                        <p>{{ journey.description }}</p>
                                        <div class="journey-tags">
                                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag">
                                                {{ tag }}
                                            </el-tag>
                                        </div>
                                        <div class="journey-info">
                                            <span>发布时间：{{ journey.publishDate }}</span>
                                            <span>计划开始：{{ journey.startDate }}</span>
                                            <span>预计结束：{{ journey.endDate }}</span>
                                            <span class="budget">预算：¥{{ journey.budget }}</span>
                                        </div>
                                        <div class="journey-actions">
                                            <el-button type="primary" @click="manageJourney(journey.id)">管理</el-button>
                                            <el-button @click="viewJourneyDetail(journey.id)">查看详情</el-button>
                                        </div>
                                    </div>
                                    <div class="journey-image" v-if="journey.coverImage">
                                        <img :src="journey.coverImage" :alt="journey.title">
                                    </div>
                                </div>
                            </el-card>
                        </div>
                        <el-empty v-else description="暂无组队中的行程"></el-empty>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const activeTab = ref('planning'); // 默认显示规划中
const calendarDate = ref(new Date());

const user = ref({
  nickname: '蘑菇',
  avatar: require('@/assets/mogu.jpg'),
  journeyCount: 5, // 这个可以动态计算 allJourneys.length
  checkinCount: 10 // 这个需要后端支持或更复杂的打卡记录管理
});

const userInitials = computed(() => {
    return user.value.nickname ? user.value.nickname.charAt(0).toUpperCase() : '';
});

// 所有行程的模拟数据
const allJourneys = ref([
  {
    id: 1,
    title: '云南大理之旅',
    description: '探索大理古城，感受白族文化',
    startDate: '2025-05-20',
    endDate: '2025-05-25',
    budget: 2000,
    coverImage: require('@/assets/dali.png'),
    tags: ['文化', '美食', '摄影'],
    status: 'planning' // 规划中
  },
  {
    id: 2,
    title: '西藏朝圣之旅',
    description: '探索西藏神秘文化，感受高原风光',
    startDate: '2025-06-15',
    endDate: '2025-06-25',
    budget: 5200,
    coverImage: require('@/assets/tibet.png'),
    publishDate: '2025-03-01', // 组队中状态特有
    tags: ['文化', '摄影', '自然'],
    status: 'recruiting' // 组队中
  },
  {
    id: 3,
    title: '日本东京动漫考察',
    description: '秋叶原、涩谷，动漫迷的梦想之旅',
    startDate: '2025-04-10',
    endDate: '2025-04-18',
    budget: 8000,
    coverImage: require('@/assets/tokyo.jpg'), // 假设有这张图
    tags: ['动漫', '购物', '都市'],
    status: 'inProgress' // 旅行中
  }
]);

// 更新用户行程总数
user.value.journeyCount = computed(() => allJourneys.value.length);

const formatCalendarHeader = (date) => {
  if (!date) return '';
  // ElCalendar 的 header slotprop `date` 是一个字符串 "YYYY 年 M 月"
  // 我们需要从中提取年份和月份
  // 或者，如果 ElCalendar 传递的是 Date 对象或可解析的日期字符串，则可以直接使用
  let year, month;
  if (typeof date === 'string' && date.includes('年') && date.includes('月')) {
    const parts = date.replace('年', '-').replace('月', '').split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
  } else { // 兜底，尝试将其作为Date对象或可解析日期字符串处理
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getFullYear())) {
        year = dateObj.getFullYear();
        month = dateObj.getMonth() + 1; // getMonth is 0-indexed
    } else {
        return date; // 无法解析，返回原样
    }
  }
  return `${year}年${month}月`;
};

// 计算属性分离不同状态的行程
const recruitingJourneys = computed(() => {
  return allJourneys.value.filter(j => j.status === 'recruiting');
});

const planningJourneys = computed(() => {
  return allJourneys.value.filter(j => j.status === 'planning');
});

const inProgressJourneys = computed(() => {
  return allJourneys.value.filter(j => j.status === 'inProgress');
});


// 收集所有行程的出行日期（范围内每一天）
const journeyDates = ref([]);
const collectJourneyDates = () => {
    journeyDates.value = [];
    allJourneys.value.forEach(journey => {
        if (journey.startDate && journey.endDate) {
            const start = new Date(journey.startDate);
            const end = new Date(journey.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                journeyDates.value.push(d.toISOString().slice(0, 10));
            }
        } else if (journey.startDate) {
            journeyDates.value.push(journey.startDate);
        }
    });
};

// 获取日期样式
const getDateClass = (data) => {
  const date = new Date(data.day);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const hasJourney = getJourneyOnDate(data.day);
  
  return {
    'calendar-day': true,
    'is-today': isToday,
    'has-journey': hasJourney
  };
};

// 检查日期是否有旅程
const getJourneyOnDate = (dateString) => {
    return journeyDates.value.includes(dateString);
};

// 检查是否是旅程开始日期
const getJourneyStartDate = (dateString) => {
    return allJourneys.value.find(j => j.startDate === dateString);
};

// 获取旅程标题
const getJourneyTitle = (dateString) => {
    const journey = allJourneys.value.find(j => j.startDate === dateString);
    return journey ? journey.title : '';
};

// 查看特定日期的旅程
const viewJourneyOnDate = (dateString) => {
    const journey = allJourneys.value.find(j => j.startDate === dateString);
    if (journey) {
        if (journey.status === 'inProgress') {
            router.push({ name: 'JourneyCheckin', params: { id: journey.id } });
        } else {
            // 对于组队中和规划中的行程，日历点击依然跳转到公开详情页或管理页
            // 这里假设跳转到公开详情页，如果需要管理页，逻辑需相应调整
             router.push({ name: 'JourneyDetailPublic', params: { id: journey.id } });
        }
    }
};

// 跳转到创建行程页面
const goToCreateJourney = () => {
  router.push({ name: 'CreateJourney' });
};

// 管理旅程
const manageJourney = (journeyId) => {
  // 区分管理页面，这里暂时用 JourneyManage
  router.push({ name: 'JourneyManage', params: { id: journeyId } });
};

// 查看旅程详情
const viewJourneyDetail = (journeyId) => {
  router.push({ name: 'JourneyDetailPublic', params: { id: journeyId } });
};

// 开始旅行
const startTrip = (journeyId) => {
  const journey = allJourneys.value.find(j => j.id === journeyId);
  if (journey) {
    journey.status = 'inProgress';
    ElMessage.success(`行程 "${journey.title}" 已开始！`);
    activeTab.value = 'inProgress'; // 切换到旅行中标签页
  }
};

// 去打卡页面 -> 修改为去进行中行程管理页面
const goToInProgressJourneyView = (journeyId) => {
  router.push({ name: 'JourneyInProgress', params: { id: journeyId } }); // 新的路由名称
};

onMounted(() => {
    collectJourneyDates();
    // 可以在这里从后端加载真实数据替换模拟数据
});

</script>

<style scoped>
.my-journeys-container {
  padding: 20px;
}

.sidebar {
  position: sticky;
  top: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-stats {
  display: flex;
  gap: 15px;
  color: #666;
}

.user-stats b {
  color: #409EFF;
}

.calendar-card {
  margin-bottom: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.journey-list {
  display: grid;
  gap: 20px;
}

.journey-card {
  transition: all 0.3s;
}

.journey-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.journey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journey-header h3 {
  margin: 0;
  font-size: 18px;
}

.journey-content-wrapper {
  display: flex;
  gap: 20px;
}

.journey-content {
  flex: 1;
  color: #666;
}

.journey-image {
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 8px;
}

.journey-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.journey-info {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.journey-info .budget {
  color: #f56c6c;
  font-weight: bold;
}

.journey-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.journey-tags {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.journey-tag {
  margin-right: 5px;
}

.calendar-header {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
}

.calendar-day {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 4px;
  min-height: 60px;
}

.date-number {
    margin: 0;
    font-size: 14px;
    line-height: 1;
    text-align: center;
}

.is-today {
  background-color: #ecf5ff;
  border-radius: 4px;
}

.has-journey .journey-dot {
  width: 6px;
  height: 6px;
  background-color: #409EFF;
  border-radius: 50%;
  position: absolute;
  /* 调整点的位置，避免与标签重叠 */
  top: 2px;
  right: 2px;
}

.journey-start-tag {
    position: absolute;
    bottom: 2px;
    cursor: pointer;
    z-index: 1;
}

.journey-start-tag:hover {
    transform: scale(1.1);
    transition: transform 0.2s;
}

:deep(.el-calendar-table td) {
    border: none;
    padding: 4px;
}

:deep(.el-calendar-table tr) {
    border-top: 1px solid #ebeef5;
}

:deep(.el-calendar-table thead th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 500;
    padding: 8px;
    text-align: center;
}

:deep(.el-calendar__header) {
    padding: 12px 20px;
}

:deep(.el-calendar__body) {
    padding: 12px 20px;
}

.journey-cover-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 200px;
    height: 150px;
}

.journey-cover-uploader:hover {
    border-color: #409EFF;
}

.cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 200px;
    height: 150px;
    line-height: 150px;
    text-align: center;
}

.cover-image {
    width: 200px;
    height: 150px;
    display: block;
    object-fit: cover;
}

/* 为旅行中卡片添加特定样式 */
.in-progress-card .el-card__header {
    background-color: #f0f9eb; /* 淡绿色背景 */
}
.in-progress-card .journey-header .el-tag {
    background-color: #67C23A; /* Element Plus 成功色 */
    color: white;
}
</style> 