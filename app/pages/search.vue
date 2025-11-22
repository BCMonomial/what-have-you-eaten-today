<script setup>
import { ref, computed, watch } from 'vue'

definePageMeta({
    middleware: 'auth'
})

useHead({
    title: '搜索用餐记录'
})

// 搜索条件
const searchParams = ref({
    keyword: '',
    category: '',
    startDate: '',
    endDate: '',
    minRating: null,
    maxRating: null,
    location: ''
})

// 分类选项
const categoryOptions = [
    { label: '全部', value: '' },
    { label: '早餐', value: '早餐' },
    { label: '午餐', value: '午餐' },
    { label: '晚餐', value: '晚餐' },
    { label: '零食', value: '零食' },
    { label: '其他', value: '其他' }
]

// 评分选项
const ratingOptions = [
    { label: '不限', value: null },
    { label: '1分以上', value: 1 },
    { label: '2分以上', value: 2 },
    { label: '3分以上', value: 3 },
    { label: '4分以上', value: 4 },
    { label: '5分', value: 5 }
]

// 搜索结果
const searchResults = ref([])
const isSearching = ref(false)
const hasSearched = ref(false)
const error = ref(null)

// 所有地点列表（用于自动补全）
const allLocations = ref([])

// 加载所有地点
async function loadLocations() {
    try {
        const data = await $fetch('/api/meals')
        // 提取所有不重复的地点
        const locations = [...new Set(data.map(m => m.location).filter(Boolean))]
        allLocations.value = locations
    } catch (e) {
        console.error('加载地点失败', e)
    }
}

// 页面加载时获取地点列表
onMounted(() => {
    loadLocations()
})

// 执行搜索
async function handleSearch() {
    hasSearched.value = true
    isSearching.value = true
    error.value = null

    try {
        // 构建查询参数（过滤空值）
        const params = {}
        Object.keys(searchParams.value).forEach(key => {
            const value = searchParams.value[key]
            if (value !== '' && value !== null && value !== undefined) {
                params[key] = value
            }
        })

        console.log('🔍 搜索参数:', params)

        const response = await $fetch('/api/meals/search', {
            params: params
        })

        searchResults.value = response.results
        console.log('✅ 搜索结果:', response.count, '条')
    } catch (e) {
        console.error('❌ 搜索失败:', e)
        error.value = '搜索失败，请重试'
    } finally {
        isSearching.value = false
    }
}

// 重置搜索
function handleReset() {
    searchParams.value = {
        keyword: '',
        category: '',
        startDate: '',
        endDate: '',
        minRating: null,
        maxRating: null,
        location: ''
    }
    searchResults.value = []
    hasSearched.value = false
    error.value = null
}

// 快速筛选：最近7天
function filterLastWeek() {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    searchParams.value.startDate = formatDateForInput(weekAgo)
    searchParams.value.endDate = formatDateForInput(today)

    handleSearch()
}

// 快速筛选：本月
function filterThisMonth() {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

    searchParams.value.startDate = formatDateForInput(firstDay)
    searchParams.value.endDate = formatDateForInput(today)

    handleSearch()
}

// 快速筛选：高分记录（4分以上）
function filterHighRated() {
    searchParams.value.minRating = 4
    handleSearch()
}

// 格式化日期
function formatDateForInput(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 获取分类颜色
function getCategoryColor(category) {
    const colors = {
        '早餐': '#ff9800',
        '午餐': '#4caf50',
        '晚餐': '#2196f3',
        '零食': '#e91e63',
        '其他': '#9e9e9e'
    }
    return colors[category] || '#9e9e9e'
}

// 获取分类图标
function getCategoryIcon(category) {
    const icons = {
        '早餐': 'mdi:coffee',
        '午餐': 'mdi:food',
        '晚餐': 'mdi:food-variant',
        '零食': 'mdi:candy',
        '其他': 'mdi:dots-horizontal'
    }
    return icons[category] || 'mdi:food'
}

// 统计信息
const stats = computed(() => {
    if (!hasSearched.value || searchResults.value.length === 0) {
        return null
    }

    const results = searchResults.value

    // 平均评分
    const ratingsWithValue = results.filter(m => m.rating)
    const averageRating = ratingsWithValue.length > 0
        ? (ratingsWithValue.reduce((sum, m) => sum + m.rating, 0) / ratingsWithValue.length).toFixed(1)
        : 0

    // 分类统计
    const categoryCount = {}
    results.forEach(m => {
        const cat = m.category || '未分类'
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    return {
        total: results.length,
        averageRating,
        categoryCount
    }
})
</script>

<template>
    <MainLayout title="搜索用餐记录">
        <div class="search-container">
            <!-- 搜索表单 -->
            <div class="search-form-card">
                <h2 class="form-title">
                    <Icon name="mdi:magnify" size="24" />
                    搜索条件
                </h2>

                <form @submit.prevent="handleSearch" class="search-form">
                    <!-- 关键词搜索 -->
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label class="form-label">
                                <Icon name="mdi:text-search" size="18" />
                                关键词
                            </label>
                            <input v-model="searchParams.keyword" type="text" class="form-input"
                                placeholder="搜索餐食名称或地点..." />
                        </div>
                    </div>

                    <!-- 分类和地点 -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:tag" size="18" />
                                分类
                            </label>
                            <select v-model="searchParams.category" class="form-select">
                                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:map-marker" size="18" />
                                地点
                            </label>
                            <input v-model="searchParams.location" type="text" class="form-input" placeholder="精确地点"
                                list="locations" />
                            <datalist id="locations">
                                <option v-for="loc in allLocations" :key="loc" :value="loc" />
                            </datalist>
                        </div>
                    </div>

                    <!-- 日期范围 -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:calendar-start" size="18" />
                                开始日期
                            </label>
                            <input v-model="searchParams.startDate" type="date" class="form-input" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:calendar-end" size="18" />
                                结束日期
                            </label>
                            <input v-model="searchParams.endDate" type="date" class="form-input" />
                        </div>
                    </div>

                    <!-- 评分范围 -->
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:star-outline" size="18" />
                                最低评分
                            </label>
                            <select v-model.number="searchParams.minRating" class="form-select">
                                <option v-for="option in ratingOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">
                                <Icon name="mdi:star" size="18" />
                                最高评分
                            </label>
                            <select v-model.number="searchParams.maxRating" class="form-select">
                                <option v-for="option in ratingOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- 快速筛选按钮 -->
                    <div class="quick-filters">
                        <p class="quick-filters-label">快速筛选：</p>
                        <button type="button" @click="filterLastWeek" class="quick-filter-btn">
                            <Icon name="mdi:calendar-week" />
                            最近7天
                        </button>
                        <button type="button" @click="filterThisMonth" class="quick-filter-btn">
                            <Icon name="mdi:calendar-month" />
                            本月
                        </button>
                        <button type="button" @click="filterHighRated" class="quick-filter-btn">
                            <Icon name="mdi:star" />
                            高分记录
                        </button>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" :disabled="isSearching">
                            <Icon v-if="!isSearching" name="mdi:magnify" />
                            <Icon v-else name="mdi:loading" class="spinning" />
                            {{ isSearching ? '搜索中...' : '搜索' }}
                        </button>

                        <button type="button" @click="handleReset" class="btn btn-secondary">
                            <Icon name="mdi:refresh" />
                            重置
                        </button>
                    </div>
                </form>
            </div>

            <!-- 搜索结果统计 -->
            <div v-if="stats" class="stats-bar">
                <div class="stat-item">
                    <Icon name="mdi:file-document" size="20" />
                    <span>找到 <strong>{{ stats.total }}</strong> 条记录</span>
                </div>
                <div class="stat-item">
                    <Icon name="mdi:star" size="20" />
                    <span>平均评分 <strong>{{ stats.averageRating }}</strong></span>
                </div>
                <div class="stat-item">
                    <Icon name="mdi:tag-multiple" size="20" />
                    <span>
                        <span v-for="(count, cat) in stats.categoryCount" :key="cat" class="category-stat">
                            {{ cat }}: {{ count }}
                        </span>
                    </span>
                </div>
            </div>

            <!-- 搜索结果 -->
            <div class="results-container">
                <!-- 加载状态 -->
                <div v-if="isSearching" class="loading-state">
                    <Icon name="mdi:loading" class="spinning" size="48" />
                    <p>搜索中...</p>
                </div>

                <!-- 错误状态 -->
                <div v-else-if="error" class="error-state">
                    <Icon name="mdi:alert-circle" size="64" />
                    <p>{{ error }}</p>
                </div>

                <!-- 空状态 -->
                <div v-else-if="hasSearched && searchResults.length === 0" class="empty-state">
                    <Icon name="mdi:file-search" size="64" />
                    <h3>没有找到匹配的记录</h3>
                    <p>试试调整搜索条件</p>
                </div>

                <!-- 结果列表 -->
                <div v-else-if="searchResults.length > 0" class="results-grid">
                    <div v-for="meal in searchResults" :key="meal.id" class="result-card"
                        @click="navigateTo(`/meals/${meal.id}/edit`)">
                        <img v-if="meal.image" :src="meal.image" alt="餐食图片" class="card-image" />
                        <div class="card-header">
                            <h3 class="meal-name">{{ meal.name }}</h3>
                            <span class="category-badge" :style="{ backgroundColor: getCategoryColor(meal.category) }">
                                <Icon :name="getCategoryIcon(meal.category)" size="14" />
                                {{ meal.category || '-' }}
                            </span>
                        </div>

                        <div class="card-body">
                            <div class="info-row">
                                <Icon name="mdi:calendar" size="16" />
                                <span>{{ formatDate(meal.mealDate) }}</span>
                            </div>

                            <div v-if="meal.location" class="info-row">
                                <Icon name="mdi:map-marker" size="16" />
                                <span>{{ meal.location }}</span>
                            </div>

                            <div v-if="meal.rating" class="info-row">
                                <Icon name="mdi:star" size="16" class="star-icon" />
                                <span class="rating-text">{{ meal.rating }} 分</span>
                            </div>

                            <div v-if="meal.ratingNotes" class="notes">
                                {{ meal.ratingNotes }}
                            </div>
                        </div>

                        <div class="card-footer">
                            <button class="card-action-btn">
                                <Icon name="mdi:pencil" />
                                编辑
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 未搜索状态 -->
                <div v-else class="initial-state">
                    <Icon name="mdi:magnify" size="64" />
                    <h3>开始搜索</h3>
                    <p>输入搜索条件，点击"搜索"按钮</p>
                </div>
            </div>
        </div>
    </MainLayout>
</template>

<style scoped>
.search-container {
    max-width: 1200px;
    margin: 0 auto;
}

/* ==================== 搜索表单 ==================== */
.search-form-card {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.form-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 24px 0;
    font-size: 20px;
    color: #2c3e50;
}

.search-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-input,
.form-select {
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #3498db;
}

/* ==================== 快速筛选 ==================== */
.quick-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
    flex-wrap: wrap;
}

.quick-filters-label {
    margin: 0;
    font-weight: 600;
    color: #6c757d;
    font-size: 14px;
}

.quick-filter-btn {
    padding: 8px 16px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.quick-filter-btn:hover {
    background: #3498db;
    color: white;
    border-color: #3498db;
}

/* ==================== 操作按钮 ==================== */
.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.btn {
    padding: 12px 32px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #3498db;
    color: white;
    flex: 1;
}

.btn-primary:hover:not(:disabled) {
    background: #2980b9;
}

.btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
}

.btn-secondary:hover {
    background: #bdc3c7;
}

/* ==================== 统计栏 ==================== */
.stats-bar {
    background: white;
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 14px;
}

.stat-item strong {
    color: #2c3e50;
    font-size: 16px;
}

.category-stat {
    margin-right: 12px;
}

/* ==================== 结果容器 ==================== */
.results-container {
    min-height: 400px;
}

/* 加载/错误/空状态 */
.loading-state,
.error-state,
.empty-state,
.initial-state {
    background: white;
    border-radius: 8px;
    padding: 80px 40px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state p,
.empty-state p,
.initial-state p {
    margin-top: 16px;
    color: #6c757d;
}

.empty-state h3,
.initial-state h3 {
    margin: 16px 0 8px 0;
    color: #2c3e50;
}

.error-state {
    color: #e74c3c;
}

/* ==================== 结果网格 ==================== */
.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.result-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;
}

.result-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
}

.meal-name {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
    flex: 1;
}

.category-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
}

.card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 14px;
}

.star-icon {
    color: #f39c12;
}

.rating-text {
    color: #f39c12;
    font-weight: 600;
}

.notes {
    margin-top: 8px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 14px;
    color: #6c757d;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.card-footer {
    border-top: 1px solid #dee2e6;
    padding-top: 12px;
}

.card-action-btn {
    padding: 8px 16px;
    background: #e3f2fd;
    color: #2196f3;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.card-action-btn:hover {
    background: #bbdefb;
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
    margin: -20px -20px 16px -20px;
}

/* ==================== 动画 ==================== */
.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
    .search-form-card {
        padding: 20px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .quick-filters {
        flex-direction: column;
        align-items: flex-start;
    }

    .stats-bar {
        flex-direction: column;
        gap: 12px;
    }

    .results-grid {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>