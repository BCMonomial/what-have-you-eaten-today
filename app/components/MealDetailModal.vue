<script setup>
import { computed } from 'vue'

const props = defineProps({
    meal: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])

// 格式化日期
const formattedDate = computed(() => {
    if (!props.meal.mealDate) return ''
    return new Date(props.meal.mealDate).toLocaleString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
})

// 分类颜色 (复用)
function getCategoryColor(category) {
    const colors = {
        '早餐': '#ff9800', '午餐': '#4caf50', '晚餐': '#2196f3',
        '零食': '#e91e63', '其他': '#9e9e9e'
    }
    return colors[category] || '#9e9e9e'
}
</script>

<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="detail-card">
            <button class="close-btn" @click="$emit('close')">
                <Icon name="mdi:close" />
            </button>

            <div class="detail-layout">
                <!-- 左侧：图片区域 -->
                <div class="image-section">
                    <img v-if="meal.image" :src="meal.image" alt="美食图片" class="detail-image" />
                    <div v-else class="no-image-placeholder"
                        :style="{ backgroundColor: getCategoryColor(meal.category) + '20' }">
                        <Icon name="mdi:silverware-fork-knife" size="64"
                            :style="{ color: getCategoryColor(meal.category) }" />
                    </div>
                </div>

                <!-- 右侧：信息区域 -->
                <div class="info-section">
                    <!-- 头部信息 -->
                    <div class="info-header">
                        <div class="user-info">
                            <div class="avatar">
                                {{ meal.username.charAt(0).toUpperCase() }}
                            </div>
                            <span class="username">{{ meal.username }}</span>
                        </div>
                        <span class="category-badge" :style="{ backgroundColor: getCategoryColor(meal.category) }">
                            {{ meal.category || '其他' }}
                        </span>
                    </div>

                    <!-- 标题和评分 -->
                    <h2 class="meal-title">{{ meal.name }}</h2>
                    <div v-if="meal.rating" class="rating-display">
                        <div class="stars">
                            <Icon v-for="i in 5" :key="i"
                                :name="i <= Math.round(meal.rating) ? 'mdi:star' : 'mdi:star-outline'" class="star-icon"
                                :class="{ active: i <= Math.round(meal.rating) }" />
                        </div>
                        <span class="rating-num">{{ meal.rating }}分</span>
                    </div>

                    <!-- 详细属性 -->
                    <div class="meta-list">
                        <div class="meta-item">
                            <Icon name="mdi:calendar-clock" class="meta-icon" />
                            <span>{{ formattedDate }}</span>
                        </div>
                        <div v-if="meal.location" class="meta-item">
                            <Icon name="mdi:map-marker" class="meta-icon" />
                            <span>{{ meal.location }}</span>
                        </div>
                    </div>

                    <!-- 评价内容 -->
                    <div v-if="meal.ratingNotes" class="content-block">
                        <h4>
                            <Icon name="mdi:comment-quote-outline" /> 评价
                        </h4>
                        <p>{{ meal.ratingNotes }}</p>
                    </div>

                    <!-- 备注 -->
                    <div v-if="meal.remarks" class="content-block">
                        <h4>
                            <Icon name="mdi:note-text-outline" /> 备注
                        </h4>
                        <p>{{ meal.remarks }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
}

.detail-card {
    background: white;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
}

.detail-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
}

/* 左侧图片 */
.image-section {
    flex: 1.2;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.detail-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-height: 90vh;
}

.no-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
}

/* 右侧信息 */
.info-section {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 32px;
    height: 32px;
    background: #3498db;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.username {
    font-weight: 600;
    color: #333;
}

.category-badge {
    padding: 4px 12px;
    border-radius: 16px;
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.meal-title {
    margin: 0;
    font-size: 24px;
    color: #2c3e50;
    line-height: 1.3;
}

.rating-display {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stars {
    display: flex;
    color: #ddd;
}

.star-icon.active {
    color: #f39c12;
}

.rating-num {
    font-weight: bold;
    color: #f39c12;
}

.meta-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.content-block h4 {
    margin: 0 0 8px 0;
    color: #34495e;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.content-block p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
    color: #555;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
}

/* 响应式：手机端上下布局 */
@media (max-width: 768px) {
    .detail-layout {
        flex-direction: column;
        overflow-y: auto;
    }

    .image-section {
        flex: none;
        height: 300px;
        width: 100%;
    }

    .info-section {
        padding: 20px;
        overflow-y: visible;
    }

    .detail-card {
        max-height: 95vh;
        overflow-y: auto;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>