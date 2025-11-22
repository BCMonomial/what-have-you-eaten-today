<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
    middleware: 'auth'
})

useHead({ title: '个人资料' })

const { user, initUser } = useUser()

// === 基本信息表单 ===
const profileForm = ref({
    username: '',
    email: '',
    role: '',
    createdAt: ''
})
const isProfileLoading = ref(false)

// === 密码表单 ===
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const isPasswordLoading = ref(false)

// 初始化数据
onMounted(() => {
    if (user.value) {
        profileForm.value = {
            username: user.value.username,
            email: user.value.email || '',
            role: user.value.role === 'admin' ? '管理员' : '普通用户',
            createdAt: user.value.createdAt ? new Date(user.value.createdAt).toLocaleDateString() : '-'
        }
    }
})

// 更新基本信息 (只更新邮箱，用户名通常不允许改)
async function updateProfile() {
    isProfileLoading.value = true
    try {
        await $fetch('/api/auth/profile', {
            method: 'PUT',
            body: { email: profileForm.value.email }
        })
        
        // 更新成功后，刷新本地用户状态
        await initUser()
        alert('个人资料已更新')
    } catch (e) {
        alert(e.data?.statusMessage || '更新失败')
    } finally {
        isProfileLoading.value = false
    }
}

// 修改密码
async function changePassword() {
    const { currentPassword, newPassword, confirmPassword } = passwordForm.value

    if (newPassword !== confirmPassword) {
        alert('两次输入的新密码不一致')
        return
    }
    
    if (newPassword.length < 6) {
        alert('新密码至少需要6位')
        return
    }

    isPasswordLoading.value = true
    try {
        await $fetch('/api/auth/profile', {
            method: 'PUT',
            body: {
                currentPassword,
                newPassword
            }
        })
        
        alert('密码修改成功，下次登录请使用新密码')
        // 清空密码表单
        passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    } catch (e) {
        alert(e.data?.statusMessage || '密码修改失败')
    } finally {
        isPasswordLoading.value = false
    }
}
</script>

<template>
    <MainLayout title="个人资料">
        <div class="profile-container">
            
            <!-- 卡片 1: 基本信息 -->
            <div class="profile-card">
                <div class="card-header">
                    <Icon name="mdi:account-details" size="24" />
                    <h2>基本信息</h2>
                </div>
                
                <form @submit.prevent="updateProfile" class="profile-form">
                    <div class="form-group">
                        <label>用户名 (不可修改)</label>
                        <input v-model="profileForm.username" type="text" class="form-input readonly" readonly disabled />
                    </div>

                    <div class="form-group">
                        <label>用户角色</label>
                        <div class="role-display">
                            <span :class="['role-badge', user?.role]">{{ profileForm.role }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>注册时间</label>
                        <input v-model="profileForm.createdAt" type="text" class="form-input readonly" readonly disabled />
                    </div>

                    <div class="form-group">
                        <label>邮箱地址</label>
                        <input v-model="profileForm.email" type="email" class="form-input" placeholder="绑定邮箱方便找回密码" />
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" :disabled="isProfileLoading">
                            <Icon v-if="isProfileLoading" name="mdi:loading" class="spinning" />
                            {{ isProfileLoading ? '保存中...' : '更新资料' }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- 卡片 2: 安全设置 -->
            <div class="profile-card">
                <div class="card-header">
                    <Icon name="mdi:shield-lock" size="24" />
                    <h2>安全设置</h2>
                </div>
                
                <form @submit.prevent="changePassword" class="profile-form">
                    <div class="form-group">
                        <label>当前密码</label>
                        <input v-model="passwordForm.currentPassword" type="password" class="form-input" required placeholder="请输入当前密码" />
                    </div>

                    <div class="form-group">
                        <label>新密码</label>
                        <input v-model="passwordForm.newPassword" type="password" class="form-input" required placeholder="至少6位" />
                    </div>

                    <div class="form-group">
                        <label>确认新密码</label>
                        <input v-model="passwordForm.confirmPassword" type="password" class="form-input" required placeholder="再次输入新密码" />
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-warning" :disabled="isPasswordLoading">
                            <Icon v-if="isPasswordLoading" name="mdi:loading" class="spinning" />
                            {{ isPasswordLoading ? '处理中...' : '修改密码' }}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    </MainLayout>
</template>

<style scoped>
.profile-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    max-width: 1200px;
}

.profile-card {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    height: fit-content;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 16px;
}

.card-header h2 {
    margin: 0;
    font-size: 20px;
}

.profile-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #6c757d;
}

.form-input {
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #3498db;
}

.form-input.readonly {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: default;
}

.role-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
}
.role-badge.admin { background: #e3f2fd; color: #1976d2; }
.role-badge.user { background: #f5f5f5; color: #616161; }

.form-actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
}

.btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: white;
    transition: opacity 0.2s;
}

.btn:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-primary { background: #3498db; }
.btn-primary:hover:not(:disabled) { background: #2980b9; }
.btn-warning { background: #f39c12; }
.btn-warning:hover:not(:disabled) { background: #d35400; }

.spinning { animation: spin 1s linear infinite; }

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .profile-container {
        grid-template-columns: 1fr;
    }
}
</style>