<script setup>
const { user } = useUser()

useHead({ title: '系统管理' })
definePageMeta({ middleware: 'admin' })

const userList = ref([])
const isLoading = ref(true)

const processingId = ref(null)

// 加载用户列表
async function loadUsers() {
    isLoading.value = true
    try {
        userList.value = await $fetch('/api/admin/users')
    } catch (e) {
        alert('获取用户列表失败')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadUsers()
})

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
        // 成功后从列表中移除
        userList.value = userList.value.filter(u => u.id !== targetUser.id)
        alert('用户已删除')
    } catch (e) {
        alert(e.data?.statusMessage || '删除失败')
    } finally {
        processingId.value = null
    }
}
</script>

<template>
    <MainLayout title="系统管理">
        <div class="admin-container">
            <div class="section-card">
                <div class="section-header">
                    <h2><Icon name="mdi:account-group" /> 用户管理</h2>
                    <span class="badge">{{ userList.length }} 位用户</span>
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
                                        <Icon v-if="u.id === user.id" name="mdi:account-circle" class="me-icon" title="我自己" />
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
                                <!-- 操作按钮组 -->
                                <div class="action-group" v-if="u.id !== user.id">
                                    <button 
                                        class="btn-icon warning" 
                                        title="重置密码"
                                        @click="resetPassword(u)"
                                        :disabled="processingId === u.id"
                                    >
                                        <Icon name="mdi:lock-reset" />
                                    </button>
                                    <button 
                                        class="btn-icon danger" 
                                        title="删除用户"
                                        @click="deleteUser(u)"
                                        :disabled="processingId === u.id"
                                    >
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
    </MainLayout>
</template>

<style scoped>
.section-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th, .admin-table td {
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

.text-right { text-align: right; }

.id-badge {
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
    font-family: monospace;
}

.user-info { display: flex; flex-direction: column; gap: 4px; }
.username { font-weight: 500; display: flex; align-items: center; gap: 6px; }
.email { font-size: 12px; color: #999; }
.me-icon { color: #3498db; }

.role-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}
.role-badge.admin { background: #e3f2fd; color: #1976d2; }
.role-badge.user { background: #f5f5f5; color: #616161; }

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

.btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-icon.warning { background: #fff3e0; color: #ef6c00; }
.btn-icon.warning:hover:not(:disabled) { background: #ffe0b2; }

.btn-icon.danger { background: #ffebee; color: #c62828; }
.btn-icon.danger:hover:not(:disabled) { background: #ffcdd2; }

.current-user-tag {
    font-size: 12px;
    color: #ccc;
    font-style: italic;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>