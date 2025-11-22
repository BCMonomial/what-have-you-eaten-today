<script setup>
import { ref, onMounted } from 'vue'

const { user } = useUser()

useHead({ title: '系统管理' })
definePageMeta({ middleware: 'admin' })

// === 状态管理 ===
const isLoading = ref(true)
const processingId = ref(null) // 用于记录列表中正在操作的 ID
const isSubmitting = ref(false) // 用于表单提交状态

// 数据源
const userList = ref([])
const settingsList = ref([])

// 新建用户表单
const showCreateModal = ref(false)
const createForm = ref({
    username: '',
    email: '',
    password: '',
    role: 'user'
})

// === 加载数据 ===
async function loadData() {
    isLoading.value = true
    try {
        // 并行加载用户列表和系统设置
        const [usersData, settingsData] = await Promise.all([
            $fetch('/api/admin/users'),
            $fetch('/api/admin/settings')
        ])
        userList.value = usersData
        settingsList.value = settingsData
    } catch (e) {
        console.error(e)
        alert('加载数据失败: ' + (e.data?.statusMessage || e.message))
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadData()
})

// === 系统设置逻辑 ===
async function toggleSetting(setting) {
    const oldValue = setting.value
    // 乐观更新：先在前端切换状态
    const newValue = oldValue === 'true' ? 'false' : 'true'
    setting.value = newValue

    try {
        await $fetch('/api/admin/settings', {
            method: 'PUT',
            body: {
                key: setting.key,
                value: newValue
            }
        })
    } catch (e) {
        // 失败回滚
        setting.value = oldValue
        alert('设置更新失败')
    }
}

// 获取设置项的辅助函数
function getSettingValue(key) {
    const s = settingsList.value.find(item => item.key === key)
    return s ? s.value === 'true' : true // 默认 true
}

// === 用户管理逻辑 ===

// 重置密码
async function resetPassword(targetUser) {
    if (!confirm(`确定要重置用户 "${targetUser.username}" 的密码吗？\n重置后默认为: 123456`)) return

    processingId.value = targetUser.id
    try {
        const res = await $fetch(`/api/admin/users/${targetUser.id}/reset-password`, {
            method: 'PUT'
        })
        alert(res.message)
    } catch (e) {
        alert(e.data?.statusMessage || '操作失败')
    } finally {
        processingId.value = null
    }
}

// 删除用户
async function deleteUser(targetUser) {
    const confirmMsg = `⚠️ 危险操作 ⚠️\n\n确定要删除用户 "${targetUser.username}" 吗？\n这将永久删除该用户的所有用餐记录和图片！\n此操作无法撤销！`
    if (!confirm(confirmMsg)) return

    processingId.value = targetUser.id
    try {
        await $fetch(`/api/admin/users/${targetUser.id}`, {
            method: 'DELETE'
        })
        userList.value = userList.value.filter(u => u.id !== targetUser.id)
        alert('用户已删除')
    } catch (e) {
        alert(e.data?.statusMessage || '删除失败')
    } finally {
        processingId.value = null
    }
}

// === 新建用户逻辑 ===
function openCreateModal() {
    createForm.value = { username: '', email: '', password: '', role: 'user' }
    showCreateModal.value = true
}

async function handleCreateUser() {
    isSubmitting.value = true
    try {
        await $fetch('/api/admin/users/create', {
            method: 'POST',
            body: createForm.value
        })
        alert('用户创建成功')
        showCreateModal.value = false
        loadData() // 刷新列表
    } catch (e) {
        alert(e.data?.statusMessage || '创建失败')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <MainLayout title="系统管理">
        <div class="admin-container">

            <!-- 1. 系统设置区域 -->
            <div class="section-card settings-card">
                <div class="section-header">
                    <h2>
                        <Icon name="mdi:cog" /> 系统设置
                    </h2>
                </div>
                <div class="settings-grid">
                    <!-- 注册开关 -->
                    <div class="setting-item" v-for="s in settingsList" :key="s.key">
                        <div class="setting-info">
                            <span class="setting-label">{{ s.description || s.key }}</span>
                            <span class="setting-desc">Key: {{ s.key }}</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" :checked="s.value === 'true'" @change="toggleSetting(s)">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div v-if="settingsList.length === 0 && !isLoading" class="empty-text">暂无设置项</div>
                </div>
            </div>

            <!-- 2. 用户管理区域 -->
            <div class="section-card">
                <div class="section-header">
                    <div class="header-left">
                        <h2>
                            <Icon name="mdi:account-group" /> 用户管理
                        </h2>
                        <span class="badge">{{ userList.length }} 位用户</span>
                    </div>
                    <button class="btn btn-primary btn-sm" @click="openCreateModal">
                        <Icon name="mdi:plus" /> 新建用户
                    </button>
                </div>

                <div v-if="isLoading" class="loading">
                    <Icon name="mdi:loading" class="spinning" /> 加载中...
                </div>

                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>用户信息</th>
                            <th>角色</th>
                            <th>注册时间</th>
                            <th class="text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in userList" :key="u.id">
                            <td><span class="id-badge">#{{ u.id }}</span></td>
                            <td>
                                <div class="user-info">
                                    <span class="username">
                                        {{ u.username }}
                                        <Icon v-if="u.id === user.id" name="mdi:account-circle" class="me-icon"
                                            title="我自己" />
                                    </span>
                                    <span v-if="u.email" class="email">{{ u.email }}</span>
                                </div>
                            </td>
                            <td>
                                <span :class="['role-badge', u.role]">
                                    {{ u.role === 'admin' ? '管理员' : '用户' }}
                                </span>
                            </td>
                            <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                            <td class="text-right">
                                <div class="action-group" v-if="u.id !== user.id">
                                    <button class="btn-icon warning" title="重置密码" @click="resetPassword(u)"
                                        :disabled="processingId === u.id">
                                        <Icon name="mdi:lock-reset" />
                                    </button>
                                    <button class="btn-icon danger" title="删除用户" @click="deleteUser(u)"
                                        :disabled="processingId === u.id">
                                        <Icon v-if="processingId === u.id" name="mdi:loading" class="spinning" />
                                        <Icon v-else name="mdi:delete" />
                                    </button>
                                </div>
                                <span v-else class="current-user-tag">当前登录</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 新建用户模态框 -->
        <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>新建用户</h3>
                    <button class="close-btn" @click="showCreateModal = false">
                        <Icon name="mdi:close" />
                    </button>
                </div>
                <form @submit.prevent="handleCreateUser">
                    <div class="form-group">
                        <label>用户名</label>
                        <input v-model="createForm.username" type="text" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label>邮箱 (可选)</label>
                        <input v-model="createForm.email" type="email" class="form-input">
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input v-model="createForm.password" type="text" class="form-input" required
                            placeholder="建议设置强密码">
                    </div>
                    <div class="form-group">
                        <label>角色</label>
                        <select v-model="createForm.role" class="form-select">
                            <option value="user">普通用户</option>
                            <option value="admin">管理员</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
                        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                            {{ isSubmitting ? '创建中...' : '创建' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </MainLayout>
</template>

<style scoped>
.admin-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1200px;
}

.section-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-header h2 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2c3e50;
}

/* === 设置项开关样式 === */
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 12px;
}

.setting-info {
    display: flex;
    flex-direction: column;
}

.setting-label {
    font-weight: 600;
    color: #2c3e50;
}

.setting-desc {
    font-size: 12px;
    color: #999;
    font-family: monospace;
}

/* Switch Toggle CSS */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #3498db;
}

input:checked+.slider:before {
    transform: translateX(26px);
}

/* === 表格样式 === */
.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th,
.admin-table td {
    padding: 16px 12px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

.admin-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
}

.text-right {
    text-align: right;
}

.id-badge {
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    font-family: monospace;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.username {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}

.email {
    font-size: 12px;
    color: #999;
}

.me-icon {
    color: #3498db;
}

.role-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}

.role-badge.admin {
    background: #e3f2fd;
    color: #1976d2;
}

.role-badge.user {
    background: #f5f5f5;
    color: #616161;
}

/* === 按钮样式 === */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 13px;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
}

.action-group {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 18px;
}

.btn-icon.warning {
    background: #fff3e0;
    color: #ef6c00;
}

.btn-icon.danger {
    background: #ffebee;
    color: #c62828;
}

.current-user-tag {
    font-size: 12px;
    color: #ccc;
    font-style: italic;
}

/* === 模态框样式 === */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 400px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.modal-header h3 {
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}

.form-group {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-input,
.form-select {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
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
</style>