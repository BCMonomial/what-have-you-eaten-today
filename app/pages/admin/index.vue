<script setup>
const { user } = useUser()

definePageMeta({
    middleware: 'admin'
})

// 页面元数据
useHead({ title: '系统管理' })

const userList = ref([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        userList.value = await $fetch('/api/admin/users')
    } catch (e) {
        alert('获取用户列表失败: ' + e.message)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <MainLayout title="系统管理">
        <div class="admin-container">
            <div class="section-card">
                <div class="section-header">
                    <h2><Icon name="mdi:account-group" /> 用户管理</h2>
                    <span class="badge">{{ userList.length }} 位用户</span>
                </div>

                <div v-if="isLoading" class="loading">加载中...</div>
                
                <table v-else class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>用户名</th>
                            <th>角色</th>
                            <th>注册时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in userList" :key="u.id">
                            <td>#{{ u.id }}</td>
                            <td>
                                <div class="user-info">
                                    <span class="username">{{ u.username }}</span>
                                    <span v-if="u.email" class="email">{{ u.email }}</span>
                                </div>
                            </td>
                            <td>
                                <span :class="['role-badge', u.role]">
                                    {{ u.role === 'admin' ? '管理员' : '用户' }}
                                </span>
                            </td>
                            <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
                            <td>
                                <button class="action-btn" disabled title="开发中">编辑</button>
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

.section-header h2 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th, .admin-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.role-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.role-badge.admin { background: #e3f2fd; color: #1976d2; }
.role-badge.user { background: #f5f5f5; color: #616161; }

.user-info { display: flex; flex-direction: column; }
.email { font-size: 12px; color: #999; }
.action-btn { padding: 4px 8px; cursor: not-allowed; opacity: 0.5; }
</style>