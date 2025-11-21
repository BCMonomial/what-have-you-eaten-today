<script setup lang="ts">
import { ref } from 'vue'

useHead({
    title: '添加用餐记录'
})

// 表单数据
const formData = ref({
    name: '',
    category: '',
    mealDate: new Date().toISOString().split('T')[0], // 默认今天
    location: '',
    rating: null,
    ratingNotes: '',
    remarks: '',
    image: null as string | null,
})

// 分类选项
const categoryOptions = [
    { label: '早餐', value: '早餐' },
    { label: '午餐', value: '午餐' },
    { label: '晚餐', value: '晚餐' },
    { label: '零食', value: '零食' },
    { label: '其他', value: '其他' }
]

// 提交状态
const isSubmitting = ref(false)
const errorMessage = ref('')

// 表单验证
function validateForm() {
    if (!formData.value.name.trim()) {
        errorMessage.value = '请输入餐食名称'
        return false
    }
    if (!formData.value.mealDate) {
        errorMessage.value = '请选择用餐日期'
        return false
    }
    return true
}

// 图片相关状态
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imagePath = ref<string | null>(null)
const isUploading = ref(false)
const uploadInfo = ref('')

// 处理图片选择
async function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
        errorMessage.value = '只支持 JPG、PNG、WEBP 格式的图片'
        return
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
        errorMessage.value = '文件大小不能超过 10MB'
        return
    }

    const originalSize = formatFileSize(file.size)
    console.log('原始图片大小:', originalSize)

    isUploading.value = true
    uploadInfo.value = `正在上传 ${originalSize}...`

    try {
        // 创建 FormData
        const formData = new FormData()
        formData.append('file', file)

        // 上传到服务器
        const response = await $fetch<{
            success: boolean
            path: string
            message: string
        }>('/api/upload', {
            method: 'POST',
            body: formData
        })

        console.log('上传成功:', response)

        // 保存文件路径
        imagePath.value = response.path

        // 显示预览（使用服务器返回的路径）
        imagePreview.value = response.path
        imageFile.value = file

        uploadInfo.value = `已上传 ${originalSize}`
    } catch (error: any) {
        console.error('上传失败:', error)
        errorMessage.value = error.data?.statusMessage || '上传失败，请重试'
    } finally {
        isUploading.value = false
    }
}

// 删除图片
function removeImage() {
    imagePath.value = null
    imagePreview.value = null
    imageFile.value = null
    uploadInfo.value = ''

    // 清空 input
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.value = ''
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}


// 提交表单
async function handleSubmit() {
    errorMessage.value = ''

    if (!validateForm()) {
        return
    }

    isSubmitting.value = true

    try {
        await $fetch('/api/meals', {
            method: 'POST',
            body: {
                ...formData.value,
                rating: formData.value.rating ? parseFloat(formData.value.rating) : null,
                image: imagePath.value
            }
        })

        // 提交成功，跳转到首页
        navigateTo('/')
    } catch (error) {
        console.error('提交失败', error)
        errorMessage.value = '提交失败，请重试'
    } finally {
        isSubmitting.value = false
    }
}

// 取消并返回
function handleCancel() {
    if (confirm('确定要放弃当前编辑吗？')) {
        navigateTo('/')
    }
}
</script>

<template>
    <MainLayout title="添加用餐记录">
        <div class="form-container">
            <div class="form-card">
                <!-- 错误提示 -->
                <div v-if="errorMessage" class="error-banner">
                    <Icon name="mdi:alert-circle" size="20" />
                    {{ errorMessage }}
                </div>

                <form @submit.prevent="handleSubmit" class="meal-form">
                    <!-- 餐食名称 -->
                    <div class="form-group">
                        <label class="form-label required">
                            <Icon name="mdi:food" size="18" />
                            餐食名称
                        </label>
                        <input v-model="formData.name" type="text" class="form-input" placeholder="例如：红烧肉套餐" required />
                    </div>

                    <!-- 用餐类别 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:tag" size="18" />
                            用餐类别
                        </label>
                        <select v-model="formData.category" class="form-select">
                            <option value="">请选择</option>
                            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <!-- 用餐日期 -->
                    <div class="form-group">
                        <label class="form-label required">
                            <Icon name="mdi:calendar" size="18" />
                            用餐日期
                        </label>
                        <input v-model="formData.mealDate" type="date" class="form-input" required />
                    </div>

                    <!-- 用餐地点 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:map-marker" size="18" />
                            用餐地点
                        </label>
                        <input v-model="formData.location" type="text" class="form-input" placeholder="例如：公司食堂" />
                    </div>

                    <!-- 评分 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:star" size="18" />
                            评分 (0-5分)
                        </label>
                        <input v-model.number="formData.rating" type="number" step="0.5" min="0" max="5"
                            class="form-input" placeholder="例如：4.5" />
                    </div>

                    <!-- 评价正文 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:comment-text" size="18" />
                            评价
                        </label>
                        <textarea v-model="formData.ratingNotes" class="form-textarea" rows="3"
                            placeholder="说说你的感受..."></textarea>
                    </div>

                    <!-- 备注 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:note-text" size="18" />
                            备注
                        </label>
                        <textarea v-model="formData.remarks" class="form-textarea" rows="2"
                            placeholder="其他想记录的信息..."></textarea>
                    </div>

                    <!-- 图片上传 -->
                    <div class="form-group">
                        <label class="form-label">
                            <Icon name="mdi:image" size="18" />
                            图片
                        </label>

                        <!-- 上传按钮 -->
                        <div v-if="!imagePreview" class="image-upload-area">
                            <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                                @change="handleImageSelect" class="image-input" id="image-input"
                                :disabled="isUploading" />
                            <label for="image-input" class="image-upload-label">
                                <Icon name="mdi:cloud-upload" size="48" />
                                <p>点击上传图片</p>
                                <p class="upload-hint">支持 JPG、PNG、WEBP，最大 10MB，自动压缩至 2MB</p>
                            </label>
                        </div>

                        <!-- 图片预览 -->
                        <div v-else class="image-preview-container">
                            <img :src="imagePreview" alt="预览" class="image-preview" />
                            <div class="image-info">
                                <span class="upload-info">{{ uploadInfo }}</span>
                                <button type="button" @click="removeImage" class="remove-image-btn">
                                    <Icon name="mdi:close" />
                                    删除图片
                                </button>
                            </div>
                        </div>

                        <!-- 上传中提示 -->
                        <div v-if="isUploading" class="uploading-hint">
                            <Icon name="mdi:loading" class="spinning" />
                            {{ uploadInfo }}
                        </div>
                    </div>

                    <!-- 按钮组 -->
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                            <Icon v-if="!isSubmitting" name="mdi:check" />
                            <Icon v-else name="mdi:loading" class="spinning" />
                            {{ isSubmitting ? '提交中...' : '保存记录' }}
                        </button>

                        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="isSubmitting">
                            <Icon name="mdi:close" />
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<style scoped>
.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.form-card {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-banner {
    background: #ffebee;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 4px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.meal-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.form-label.required::after {
    content: '*';
    color: #e74c3c;
    margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: #3498db;
}

.form-textarea {
    resize: vertical;
    font-family: inherit;
}

.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

/* ==================== 图片上传 ==================== */
.image-upload-area {
    position: relative;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
}

.image-upload-area:hover {
    border-color: #3498db;
    background: #f8f9fa;
}

.image-input {
    display: none;
}

.image-upload-label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #6c757d;
}

.image-upload-label p {
    margin: 0;
}

.upload-hint {
    font-size: 12px;
    color: #adb5bd;
}

.image-preview-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.image-preview {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.image-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
}

.remove-image-btn {
    padding: 6px 12px;
    background: #ffebee;
    color: #f44336;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    transition: all 0.2s;
}

.remove-image-btn:hover {
    background: #ffcdd2;
}

.uploading-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #e3f2fd;
    color: #2196f3;
    border-radius: 6px;
    font-size: 14px;
}

.btn {
    padding: 12px 24px;
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

.btn-secondary:hover:not(:disabled) {
    background: #bdc3c7;
}

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

@media (max-width: 768px) {
    .form-card {
        padding: 20px;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>