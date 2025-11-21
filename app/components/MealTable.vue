<script setup>
import { ref, computed, onMounted } from 'vue'

// 用餐记录数据
const meals = ref([])
const isLoading = ref(true)
const error = ref(null)

// 排序相关
const sortKey = ref('mealDate')
const sortOrder = ref('desc') // 'asc' 或 'desc'

// 获取数据
onMounted(async () => {
    try {
        const data = await $fetch('/api/meals')
        meals.value = data
    } catch (e) {
        error.value = '加载数据失败'
        console.error(e)
    } finally {
        isLoading.value = false
    }
})

// 排序后的数据
const sortedMeals = computed(() => {
    const sorted = [...meals.value]

    sorted.sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]

        // 处理日期类型
        if (sortKey.value === 'mealDate') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
        }

        // 处理字符串类型
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
        }

        if (sortOrder.value === 'asc') {
            return aVal > bVal ? 1 : -1
        } else {
            return aVal < bVal ? 1 : -1
        }
    })

    return sorted
})

// 切换排序
function toggleSort(key) {
    if (sortKey.value === key) {
        // 如果点击的是当前排序列，切换排序方向
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        // 如果点击的是新列，设置为该列并默认降序
        sortKey.value = key
        sortOrder.value = 'desc'
    }
}

// 格式化日期
function formatDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 格式化时间（显示相对时间）
function formatRelativeTime(date) {
    const now = new Date()
    const mealDate = new Date(date)
    const diffTime = now - mealDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return formatDate(date)
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
// 删除记录
async function deleteMeal(id) {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
        await $fetch(`/api/meals/${id}`, { method: 'DELETE' })
        meals.value = meals.value.filter(m => m.id !== id)
    } catch (e) {
        alert('删除失败')
        console.error(e)
    }
}

const modalImage = ref(null)

function showImageModal(image) {
    modalImage.value = image
}

function closeImageModal() {
    modalImage.value = null
}
</script>

<template>
    <div class="meal-table-container">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading">
            <Icon name="mdi:loading" class="spinner-icon" />
            <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
            <Icon name="mdi:alert-circle" size="48" />
            <p>{{ error }}</p>
            <button @click="$router.go(0)" class="retry-button">
                <Icon name="mdi:refresh" />
                重试
            </button>
        </div>

        <div v-else-if="meals.length > 0" class="table-wrapper">
            <table class="meal-table">
                <thead>
                    <tr>
                        <th @click="toggleSort('name')" class="sortable">
                            餐食名称
                            <Icon v-if="sortKey === 'name'"
                                :name="sortOrder === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="sort-icon" />
                        </th>
                        <th>图片</th>
                        <th @click="toggleSort('category')" class="sortable">
                            类别
                            <Icon v-if="sortKey === 'category'"
                                :name="sortOrder === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="sort-icon" />
                        </th>
                        <th @click="toggleSort('mealDate')" class="sortable">
                            用餐日期
                            <Icon v-if="sortKey === 'mealDate'"
                                :name="sortOrder === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="sort-icon" />
                        </th>
                        <th>地点</th>
                        <th @click="toggleSort('rating')" class="sortable">
                            评分
                            <Icon v-if="sortKey === 'rating'"
                                :name="sortOrder === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="sort-icon" />
                        </th>
                        <th>评价</th>
                        <th>备注</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="meal in sortedMeals" :key="meal.id" class="table-row">
                        <td class="meal-name">
                            <strong>{{ meal.name }}</strong>
                        </td>
                        <td class="image-cell">
                            <img v-if="meal.image" :src="meal.image" alt="餐食图片" class="meal-thumbnail"
                                @click.stop="showImageModal(meal.image)" />
                            <span v-else class="no-image">-</span>
                        </td>
                        <td>
                            <span class="category-badge" :style="{ backgroundColor: getCategoryColor(meal.category) }">
                                <Icon :name="getCategoryIcon(meal.category)" size="16" />
                                {{ meal.category || '-' }}
                            </span>
                        </td>
                        <td>
                            <div class="date-cell">
                                <div class="date-main">
                                    <Icon name="mdi:calendar" size="16" class="date-icon" />
                                    {{ formatDate(meal.mealDate) }}
                                </div>
                                <div class="date-relative">{{ formatRelativeTime(meal.mealDate) }}</div>
                            </div>
                        </td>
                        <td>
                            <span v-if="meal.location" class="location">
                                <Icon name="mdi:map-marker" size="16" />
                                {{ meal.location }}
                            </span>
                            <span v-else>-</span>
                        </td>
                        <td>
                            <div class="rating" v-if="meal.rating">
                                <Icon name="mdi:star" class="star-icon" />
                                <span class="rating-number">{{ meal.rating }}</span>
                            </div>
                            <span v-else>-</span>
                        </td>
                        <td class="notes-cell">
                            <div class="notes-content" v-if="meal.ratingNotes">
                                {{ meal.ratingNotes }}
                            </div>
                            <span v-else>-</span>
                        </td>
                        <td class="notes-cell">
                            <div class="notes-content" v-if="meal.remarks">
                                {{ meal.remarks }}
                            </div>
                            <span v-else>-</span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-button edit-button" @click="navigateTo(`/meals/${meal.id}/edit`)"
                                    title="编辑">
                                    <Icon name="mdi:pencil" />
                                </button>
                                <button class="action-button delete-button" @click="deleteMeal(meal.id)" title="删除">
                                    <Icon name="mdi:delete" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
            <Icon name="mdi:food-off" size="64" class="empty-icon" />
            <h3>还没有用餐记录</h3>
            <button @click="navigateTo('/meals/new')" class="add-button">
                <Icon name="mdi:plus" />
                添加第一条记录
            </button>
        </div>

        <div v-if="modalImage" class="image-modal" @click="closeImageModal">
            <div class="modal-content">
                <button class="modal-close" @click="closeImageModal">
                    <Icon name="mdi:close" size="24" />
                </button>
                <img :src="modalImage" alt="大图" class="modal-image" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ==================== 容器样式 ==================== */
.meal-table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* ==================== 加载状态 ==================== */
.loading {
    padding: 60px;
    text-align: center;
}

.spinner-icon {
    font-size: 40px;
    animation: spin 1s linear infinite;
    color: #3498db;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* ==================== 错误状态 ==================== */
.error {
    padding: 60px;
    text-align: center;
    color: #e74c3c;
}

.retry-button {
    margin-top: 16px;
    padding: 8px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.retry-button:hover {
    background: #2980b9;
}

/* ==================== 表格容器 ==================== */
.table-wrapper {
    overflow-x: auto;
}

/* ==================== 表格基础样式 ==================== */
.meal-table {
    width: 100%;
    border-collapse: collapse;
}

/* 表头样式 */
.meal-table thead {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.meal-table th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* 可排序的表头 */
.meal-table th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s;
}

.meal-table th.sortable:hover {
    background: #e9ecef;
}

/* 排序图标 */
.sort-icon {
    margin-left: 4px;
    color: #3498db;
    vertical-align: middle;
}

/* 表格单元格 */
.meal-table td {
    padding: 16px;
    border-bottom: 1px solid #dee2e6;
    font-size: 14px;
    color: #212529;
}

/* 表格行悬浮效果 */
.table-row {
    transition: background 0.2s;
}

.table-row:hover {
    background: #f8f9fa;
}

/* ==================== 餐食名称 ==================== */
.meal-name strong {
    color: #2c3e50;
    font-size: 15px;
}

/* ==================== 分类标签 ==================== */
.category-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 500;
}

/* ==================== 日期单元格 ==================== */
.date-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.date-main {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
}

.date-icon {
    color: #6c757d;
}

.date-relative {
    font-size: 12px;
    color: #6c757d;
}

/* ==================== 地点 ==================== */
.location {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #6c757d;
}

/* ==================== 评分 ==================== */
.rating {
    display: flex;
    align-items: center;
    gap: 8px;
}

.star-icon {
    color: #f39c12;
    font-size: 18px;
}

.rating-number {
    font-weight: 600;
    color: #f39c12;
}

/* ==================== 备注单元格 ==================== */
.notes-cell {
    max-width: 200px;
}

.notes-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.5;
    color: #6c757d;
}

/* ==================== 操作按钮 ==================== */
.action-buttons {
    display: flex;
    gap: 8px;
}

.action-button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.edit-button {
    background: #e3f2fd;
    color: #2196f3;
}

.edit-button:hover {
    background: #bbdefb;
    transform: scale(1.1);
}

.delete-button {
    background: #ffebee;
    color: #f44336;
}

.delete-button:hover {
    background: #ffcdd2;
    transform: scale(1.1);
}

/* ==================== 图片单元格 ==================== */
.image-cell {
    width: 80px;
    padding: 8px !important;
}

.meal-thumbnail {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.2s;
}

.meal-thumbnail:hover {
    transform: scale(1.1);
}

.no-image {
    color: #adb5bd;
}

/* ==================== 图片模态框 ==================== */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
}

.modal-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
}

.modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: white;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #f44336;
    color: white;
}

/* ==================== 空状态 ==================== */
.empty-state {
    padding: 80px 40px;
    text-align: center;
}

.empty-icon {
    color: #bdc3c7;
    margin-bottom: 16px;
}

.empty-state h3 {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 24px;
}

.empty-state p {
    margin: 0 0 24px 0;
    color: #6c757d;
}

.add-button {
    padding: 12px 32px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.add-button:hover {
    background: #2980b9;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1200px) {
    .notes-cell {
        max-width: 150px;
    }
}

@media (max-width: 768px) {
    .meal-table {
        font-size: 12px;
    }

    .meal-table th,
    .meal-table td {
        padding: 12px 8px;
    }

    .notes-cell {
        display: none;
    }
}
</style>