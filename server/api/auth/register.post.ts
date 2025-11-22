import { db } from '~~/server/db'
import { users, settings } from '~~/server/db/schema'
import { eq, or, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 检查注册开关
    const registerSetting = await db.select().from(settings).where(eq(settings.key, 'allow_register')).get()
    const isRegistrationAllowed = registerSetting ? registerSetting.value === 'true' : true

    if (!isRegistrationAllowed) {
        throw createError({ statusCode: 403, statusMessage: '系统已关闭公开注册' })
    }

    const body = await readBody(event)
    const { username, password, email } = body

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: '用户名和密码必填'
        })
    }

    // 1. 检查用户是否存在
    const existingUser = await db.select().from(users).where(
        or(
            eq(users.username, username),
            email ? eq(users.email, email) : undefined
        )
    ).get() // .get() 用于获取单条记录

    if (existingUser) {
        throw createError({
            statusCode: 400,
            statusMessage: '用户名或邮箱已被注册'
        })
    }

    // 2. 检查系统是否已有用户 (用于判定是否为管理员)
    // 使用 sql<number> 来辅助类型推断
    const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users).get()
    const isFirstUser = userCountResult?.count === 0
    
    // 如果是第一个用户，角色为 admin，否则为 user
    const role = isFirstUser ? 'admin' : 'user'

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. 创建用户
    const newUser = await db.insert(users).values({
        username,
        password: hashedPassword,
        email: email || null,
        role: role
    }).returning().get()

    // 5. 自动登录（设置 Cookie）
    // 设置一个名为 'auth_token' 的 Cookie，有效期 7 天
    setCookie(event, 'user_id', String(newUser.id), {
        httpOnly: true, // 安全设置：前端 JS 无法读取，防止 XSS
        maxAge: 60 * 60 * 24 * 7, // 7天
        path: '/'
    })

    return {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
    }
})