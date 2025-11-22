<script setup>

definePageMeta({
    layout: 'default',
    middleware: 'guest' 
})

const { register } = useUser()
const form = ref({ username: '', password: '', email: '' })
const errorMsg = ref('')
const isLoading = ref(false)

async function handleRegister() {
    errorMsg.value = ''
    isLoading.value = true
    try {
        await register(form.value)
    } catch (e) {
        errorMsg.value = e.data?.statusMessage || '注册失败'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <h1 class="auth-title">注册账号</h1>
            <form @submit.prevent="handleRegister" class="auth-form">
                <div class="form-group">
                    <label>用户名</label>
                    <input v-model="form.username" type="text" class="auth-input" required />
                </div>
                <div class="form-group">
                    <label>邮箱 (可选)</label>
                    <input v-model="form.email" type="email" class="auth-input" />
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input v-model="form.password" type="password" class="auth-input" required />
                </div>

                <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

                <button type="submit" class="btn-submit" :disabled="isLoading">
                    {{ isLoading ? '注册中...' : '立即注册' }}
                </button>

                <div class="auth-footer">
                    已有账号？ <NuxtLink to="/login">去登录</NuxtLink>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* 复用 Login 的样式 */
.auth-container {
    display: flex;
    justify-content: center;
    padding-top: 100px;
}

.auth-card {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.auth-title {
    text-align: center;
    margin-bottom: 24px;
    color: #2c3e50;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-size: 14px;
}

.auth-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.btn-submit {
    width: 100%;
    padding: 12px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 16px;
}

.btn-submit:hover {
    background: #2980b9;
}

.error-msg {
    color: #e74c3c;
    font-size: 14px;
    text-align: center;
    margin-top: 10px;
}

.auth-footer {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
}

.auth-footer a {
    color: #3498db;
    text-decoration: none;
}
</style>