import { ref } from 'vue'

interface User {
    id: number
    username: string
    email?: string
    role: 'admin' | 'user'
}

export const useUser = () => {
    // 全局状态：当前用户信息
    // 使用 useState 确保在服务端渲染(SSR)和客户端之间同步状态
    const user = useState<User | null>('user', () => null)

    // 初始化用户（在 app.vue 中调用）
    const initUser = async () => {
        try {
            // 使用泛型 <{ user: User | null }> 告诉 TS 返回值的结构
            const data = await $fetch<{ user: User | null }>('/api/auth/me')
            user.value = data.user
        } catch (e) {
            user.value = null
        }
    }

    // 登录
    const login = async (formData: any) => {
        const data = await $fetch<User>('/api/auth/login', {
            method: 'POST',
            body: formData
        })
        user.value = data
        navigateTo('/') // 登录成功跳回首页
    }

    // 注册
    const register = async (formData: any) => {
        const data = await $fetch<User>('/api/auth/register', {
            method: 'POST',
            body: formData
        })
        user.value = data
        navigateTo('/')
    }

    // 退出
    const logout = async () => {
        await $fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        navigateTo('/login')
    }

    return {
        user,
        initUser,
        login,
        register,
        logout
    }
}