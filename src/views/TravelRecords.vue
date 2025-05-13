<template>
    <div class="travel-records-completed-journeys">
        <!-- <el-page-header @back="goBack" class="page-header">
            <template #content>
                <span class="text-large font-600 mr-3"> 我的已完成旅程 </span>
            </template>
            <template #extra>
                 <el-tooltip content="在这里您可以回顾已完成的旅程，并为它们生成精美的旅行手账。">
                    <el-icon style="margin-right: 8px; font-size: 18px;"><QuestionFilled /></el-icon>
                </el-tooltip>
            </template>
        </el-page-header> -->

        <!-- 新增：筛选与排序区域 -->
        <el-card class="filter-sort-card" shadow="never">
            <el-form :inline="true" :model="filterOptions" class="filter-form">
                <el-form-item label="完成年份">
                    <el-select v-model="filterOptions.year" placeholder="所有年份" clearable style="width: 120px;">
                        <el-option label="所有年份" value=""></el-option>
                        <el-option v-for="year in availableYears" :key="year" :label="year" :value="year"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="有无手账">
                    <el-radio-group v-model="filterOptions.hasTravelogue">
                        <el-radio-button label="all">全部</el-radio-button>
                        <el-radio-button :label="true">有手账</el-radio-button>
                        <el-radio-button :label="false">无手账</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="排序方式">
                    <el-select v-model="sortOptions.by" placeholder="默认排序" style="width: 180px;">
                        <el-option label="完成日期 (最新 ↓)" value="endDateDesc"></el-option>
                        <el-option label="完成日期 (最旧 ↑)" value="endDateAsc"></el-option>
                        <el-option label="旅程时长 (最长 ↓)" value="durationDesc"></el-option>
                        <el-option label="旅程时长 (最短 ↑)" value="durationAsc"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

        <div v-if="!filteredAndSortedJourneys || filteredAndSortedJourneys.length === 0" class="empty-state-journeys">
            <el-empty>
                <template #description>
                    <p>没有找到符合条件的已完成旅程。</p>
                    <el-button v-if="completedJourneys.length > 0" type="text" @click="resetFilters">重置筛选条件</el-button>
                    <p v-else>您还没有已完成的旅程，<el-link type="primary" @click="goToCreateJourney">开始一段新旅程</el-link>吧！</p>
                </template>
            </el-empty>
        </div>

        <div v-else class="journey-list-completed">
            <el-card v-for="journey in filteredAndSortedJourneys" :key="journey.id" class="journey-card-completed">
                 <template #header>
                    <div class="journey-header-completed">
                        <h3>{{ journey.title }}</h3>
                        <div>
                            <el-tag type="info" effect="plain" size="small"> {{ journey.status === 'completed' ? '已结束' : journey.status }}</el-tag>
                            <el-tag :type="journey.hasTravelogue ? 'success' : 'warning'" effect="dark" size="small" style="margin-left: 8px;">
                                {{ journey.hasTravelogue ? '有手账' : '无手账' }}
                            </el-tag>
                        </div>
                    </div>
                </template>
                <div class="journey-content-wrapper-completed">
                    <div class="journey-image-completed" v-if="journey.coverImage">
                        <img :src="journey.coverImage" :alt="journey.title">
                    </div>
                    <div class="journey-content-completed">
                        <p class="description-completed">{{ journey.description }}</p>
                        <div class="journey-info-completed">
                            <span>开始日期：{{ journey.startDate }}</span>
                            <span>结束日期：{{ journey.endDate }} ({{ journey.durationDays }}天)</span>
                            <span v-if="journey.budget">预算：¥{{ journey.budget }}</span>
                        </div>
                        <div class="journey-tags-completed" v-if="journey.tags && journey.tags.length > 0">
                            <el-tag v-for="tag in journey.tags" :key="tag" size="small" class="journey-tag-item">{{ tag }}</el-tag>
                        </div>
                    </div>
                </div>
                <div class="journey-actions-completed">
                    <el-button type="primary" plain @click="viewJourneyMemories(journey.id)">
                        <el-icon><View /></el-icon> 查看回忆
                    </el-button>
                    <el-button :type="journey.hasTravelogue ? 'info' : 'success'" @click="generateTravelogue(journey.id, journey.hasTravelogue)" :disabled="journey.hasTravelogue && false">
                        <el-icon><DocumentAdd /></el-icon> {{ journey.hasTravelogue ? '编辑手账' : '生成手账' }}
                    </el-button>
                </div>
            </el-card>
        </div>

        <!-- 手账草稿箱占位符 -->
        <el-card class="travelogue-drafts-card" shadow="never">
            <template #header>
                <div class="card-header-drafts">
                    <h4><el-icon><EditPen /></el-icon> 手账草稿箱</h4>
                </div>
            </template>
            <el-empty description="手账草稿功能正在快马加鞭开发中，敬请期待！"></el-empty>
            <!-- 未来可以展示草稿列表 -->
            <!-- 
            <div v-if="drafts.length > 0" class="draft-list">
                <div v-for="draft in drafts" :key="draft.id" class="draft-item">
                    <span>{{ draft.title }} (上次编辑: {{ draft.lastEdited }})</span>
                    <el-button type="primary" link>继续编辑</el-button>
                </div>
            </div>
            -->
        </el-card>

    </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { View, DocumentAdd, CircleCheckFilled, EditPen } from '@element-plus/icons-vue';

const router = useRouter();

// 筛选与排序选项
const filterOptions = reactive({
    year: '', // 完成年份
    hasTravelogue: 'all', // 'all', true, false
});

const sortOptions = reactive({
    by: 'endDateDesc', // 默认按完成日期最新排序
});

// 模拟已完成的旅程数据 - 添加 hasTravelogue 和计算 durationDays
const completedJourneys = ref([
    {
        id: 101, 
        title: '日本关西深度游',
        description: '体验古都风情，品味日式美食。在京都感受禅意，在大阪品尝章鱼烧，奈良与小鹿亲密接触。一段难忘的文化与美食之旅。',
        startDate: '2024-03-10',
        endDate: '2024-03-18',
        budget: 12000,
        coverImage: require('@/assets/japan-kansai.jpg'), 
        tags: ['文化', '美食', '古都', '摄影'],
        status: 'completed',
        hasTravelogue: true, // 新增
    },
    {
        id: 102,
        title: '泰国曼谷清迈探索',
        description: '感受东南亚的热情与文化。曼谷的繁华与寺庙，清迈的宁静与清新，还有美味的泰国菜，让人流连忘返。',
        startDate: '2023-11-05',
        endDate: '2023-11-15',
        budget: 8000,
        coverImage: require('@/assets/thailand-bangkok.jpg'),
        tags: ['寺庙', '夜市', '自然', '休闲'],
        status: 'completed',
        hasTravelogue: false, // 新增
    },
    {
        id: 1, 
        title: '云南大理之旅',
        description: '探索大理古城，感受白族文化，洱海边的风花雪月，一切都那么美好。',
        startDate: '2023-05-20', 
        endDate: '2023-05-25',
        budget: 2000,
        coverImage: require('@/assets/dali.png'),
        tags: ['文化', '美食', '摄影', '古镇'],
        status: 'completed',
        hasTravelogue: true, // 新增
    }
].map(journey => ({
    ...journey,
    durationDays: Math.ceil((new Date(journey.endDate) - new Date(journey.startDate)) / (1000 * 60 * 60 * 24)) + 1 // 计算天数，包含首尾
})));

// 动态获取可选年份
const availableYears = computed(() => {
    const years = new Set(completedJourneys.value.map(j => new Date(j.endDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // 降序排列
});

const filteredAndSortedJourneys = computed(() => {
    let result = [...completedJourneys.value];

    // 1. 筛选
    if (filterOptions.year) {
        result = result.filter(j => new Date(j.endDate).getFullYear() === Number(filterOptions.year));
    }
    if (filterOptions.hasTravelogue !== 'all') {
        result = result.filter(j => j.hasTravelogue === filterOptions.hasTravelogue);
    }

    // 2. 排序
    switch (sortOptions.by) {
        case 'endDateDesc':
            result.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
            break;
        case 'endDateAsc':
            result.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
            break;
        case 'durationDesc':
            result.sort((a, b) => b.durationDays - a.durationDays);
            break;
        case 'durationAsc':
            result.sort((a, b) => a.durationDays - b.durationDays);
            break;
    }
    return result;
});

const resetFilters = () => {
    filterOptions.year = '';
    filterOptions.hasTravelogue = 'all';
    sortOptions.by = 'endDateDesc'; // 或恢复到最初的默认排序
};

const goToCreateJourney = () => {
    router.push({ name: 'CreateJourney' });
};

const viewJourneyMemories = (journeyId) => {
    ElMessage.info(`正在准备查看旅程 #${journeyId} 的美好回忆...`);
};

const generateTravelogue = (journeyId, hasExistingTravelogue) => {
    if (hasExistingTravelogue) {
        ElMessage.success(`跳转到编辑旅程 #${journeyId} 的手账页面...`);
        // router.push({ name: 'TravelogueEdit', params: { journeyId: journeyId } });
    } else {
        ElMessage.success(`开始为旅程 #${journeyId} 生成手账！请稍候...`);
        // router.push({ name: 'TravelogueCreate', params: { journeyId: journeyId } });
    }
};

// 模拟手账草稿数据 (未来使用)
// const drafts = ref([]); 

</script>

<style scoped>
.travel-records-completed-journeys {
    padding: 20px;
}

/* .page-header {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
} */

.filter-sort-card {
    margin-bottom: 20px;
    background-color: #fdfdfd;
    border: 1px solid #f0f0f0;
}

.filter-form .el-form-item {
    margin-bottom: 0; /* 在 inline 表单中通常不需要底部边距 */
}

.empty-state-journeys {
    padding: 40px 0;
    text-align: center;
}
.empty-state-journeys p {
    margin-bottom: 15px;
}

.journey-list-completed {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
    gap: 20px;
}

.journey-card-completed {
  transition: all 0.25s ease-in-out;
  display: flex;
  flex-direction: column;
  background-color: #fff; /* 卡片背景色 */
}

.journey-card-completed:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.journey-header-completed {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.journey-header-completed h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.journey-content-wrapper-completed {
  display: flex;
  gap: 20px; 
  margin-bottom: 15px; 
  flex-grow: 1; 
}

.journey-image-completed {
  width: 180px; 
  height: 120px; 
  overflow: hidden;
  border-radius: 6px;
  flex-shrink: 0; 
  border: 1px solid #f0f0f0;
}

.journey-image-completed img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.journey-content-completed {
  flex: 1;
  color: #555;
  display: flex;
  flex-direction: column;
}
.description-completed {
    font-size: 14px;
    margin: 0 0 10px 0;
    line-height: 1.6;
    flex-grow: 1; 
}

.journey-info-completed {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column; 
  gap: 4px;
}

.journey-tags-completed {
    margin-bottom: 10px;
}
.journey-tag-item {
    margin-right: 5px;
    margin-bottom: 5px;
}

.journey-actions-completed {
  margin-top: auto; 
  text-align: right;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0; 
}

.travelogue-drafts-card {
    margin-top: 30px; /* 与上方列表的间距 */
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
}

.card-header-drafts {
    font-size: 16px;
    font-weight: bold;
    color: #555;
}
.card-header-drafts .el-icon {
    margin-right: 6px;
    vertical-align: middle;
}

/* 可选：草稿列表样式 */
/*
.draft-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.draft-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #eee;
}
.draft-item:last-child {
    border-bottom: none;
}
*/
</style> 