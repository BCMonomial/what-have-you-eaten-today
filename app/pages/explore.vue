<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: '发现食物' })

// 不需要 auth 中间件，因为这里可能允许游客访问（取决于后端 explore API 的逻辑）
// definePageMeta({ middleware: 'guest' }) 

const { user } = useUser()
const meals = ref([])
const isLoading = ref(true)

// 加载数据
async function fetchExploreData() {
    isLoading.value = true
    try {
        // 调用之前写好的 /api/explore
        meals.value = await $fetch('/api/explore')
    } catch (e) {
        console.error('加载发现页失败', e)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchExploreData()
})

// === 工具函数 ===

// 格式化相对时间
function formatRelativeTime(date) {
    if (!date) return ''
    const now = new Date()
    const mealDate = new Date(date)
    const diffTime = now - mealDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 1) return '刚刚'
    if (diffHours < 1) return `${diffMinutes}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`

    return `${mealDate.getFullYear()}-${String(mealDate.getMonth() + 1).padStart(2, '0')}-${String(mealDate.getDate()).padStart(2, '0')}`
}

// 分类颜色
function getCategoryColor(category) {
    const colors = {
        '早餐': '#ff9800', '午餐': '#4caf50', '晚餐': '#2196f3',
        '零食': '#e91e63', '其他': '#9e9e9e'
    }
    return colors[category] || '#9e9e9e'
}

// 选中的餐食
const selectedMeal = ref(null)

// 打开详情
function openDetail(meal) {
    selectedMeal.value = meal
}
</script>

<template>
    <MainLayout title="发现食物">
        <div class="explore-container">

            <!-- 顶部简介 -->
            <div class="explore-header">
                <p class="subtitle">看看大家最近都吃了什么好吃的 😋</p>
                <button @click="fetchExploreData" class="refresh-btn" title="刷新">
                    <Icon name="mdi:refresh" :class="{ 'spinning': isLoading }" />
                </button>
            </div>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
                <Icon name="mdi:loading" class="spinning" size="48" />
                <p>正在寻找美食...</p>
            </div>

            <!-- 空状态 -->
            <div v-else-if="meals.length === 0" class="empty-state">
                <Icon name="mdi:telescope" size="64" />
                <h3>暂无动态</h3>
                <p>还没有人分享公开的用餐记录，快去发布第一条吧！</p>
                <button v-if="user" @click="navigateTo('/meals/new')" class="btn-primary">
                    去发布
                </button>
            </div>

            <!-- 内容网格 -->
            <div v-else class="masonry-grid">
                <div v-for="meal in meals" :key="meal.id" class="meal-card" @click="openDetail(meal)">

                    <!-- 1. 图片区域 -->
                    <div class="card-image-wrapper">
                        <img v-if="meal.image" :src="meal.image" loading="lazy" alt="美食图片" class="card-image" />

                        <!-- 无图片时的占位 -->
                        <div v-else class="no-image-placeholder"
                            :style="{ backgroundColor: getCategoryColor(meal.category) + '20' }">
                            <Icon name="mdi:silverware-fork-knife" size="48"
                                :style="{ color: getCategoryColor(meal.category) }" />
                        </div>

                        <!-- 类别标签 (悬浮在图片上) -->
                        <span class="category-tag" :style="{ backgroundColor: getCategoryColor(meal.category) }">
                            {{ meal.category || '其他' }}
                        </span>
                    </div>

                    <!-- 2. 内容区域 -->
                    <div class="card-content">
                        <div class="card-title-row">
                            <h3 class="meal-name">{{ meal.name }}</h3>
                            <div v-if="meal.rating" class="rating">
                                <Icon name="mdi:star" size="14" class="star-icon" />
                                <span>{{ meal.rating }}</span>
                            </div>
                        </div>

                        <!-- 用户信息行 -->
                        <div class="user-row">
                            <div class="user-info">
                                <div class="avatar-circle">
                                    {{ meal.username.charAt(0).toUpperCase() }}
                                </div>
                                <span class="username">{{ meal.username }}</span>
                            </div>

                            <!-- 可见性提示 -->
                            <div class="visibility-icon" :title="meal.visibility === 'all' ? '全站公开' : '仅登录可见'">
                                <Icon :name="meal.visibility === 'all' ? 'mdi:earth' : 'mdi:account-group'" size="14" />
                            </div>
                        </div>

                        <div class="card-footer">
                            <span class="time-ago">
                                <Icon name="mdi:clock-outline" size="12" />
                                {{ formatRelativeTime(meal.mealDate) }}
                            </span>
                            <span v-if="meal.location" class="location">
                                <Icon name="mdi:map-marker" size="12" />
                                {{ meal.location }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <MealDetailModal 
            v-if="selectedMeal" 
            :meal="selectedMeal" 
            @close="selectedMeal = null" 
        />

    </MainLayout>
</template>

<style scoped>
.explore-container {
    max-width: 1200px;
    margin: 0 auto;
}

.explore-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.subtitle {
    color: #6c757d;
    margin: 0;
}

.refresh-btn {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    cursor: pointer;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.refresh-btn:hover {
    background: #f8f9fa;
    color: #3498db;
    transform: rotate(180deg);
}

/* === 网格布局 === */
.masonry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
}

/* === 卡片样式 === */
.meal-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
}

.meal-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

/* 图片部分 */
.card-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 75%;
    /* 4:3 比例 */
    cursor: pointer;
    background: #f8f9fa;
}

.card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
}

.meal-card:hover .card-image {
    transform: scale(1.05);
}

.no-image-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.category-tag {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 2;
}

/* 内容部分 */
.card-content {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
}

.meal-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.4;
}

.rating {
    display: flex;
    align-items: center;
    gap: 2px;
    background: #fff3e0;
    color: #f57c00;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

/* 用户行 */
.user-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.avatar-circle {
    width: 24px;
    height: 24px;
    background: #3498db;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
}

.username {
    font-size: 13px;
    color: #495057;
    font-weight: 500;
}

.visibility-icon {
    color: #adb5bd;
}

/* 底部信息 */
.card-footer {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #999;
}

.time-ago,
.location {
    display: flex;
    align-items: center;
    gap: 4px;
}

.location {
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* === 状态样式 === */
.loading-state,
.empty-state {
    padding: 60px;
    text-align: center;
    background: white;
    border-radius: 8px;
}

.loading-state p,
.empty-state p {
    color: #6c757d;
    margin-top: 16px;
}

.btn-primary {
    margin-top: 16px;
    padding: 10px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

/* === 图片模态框 === */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
}

.modal-content-img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    font-size: 24px;
    cursor: pointer;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.4);
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 600px) {
    .masonry-grid {
        grid-template-columns: 1fr;
    }
}
</style>