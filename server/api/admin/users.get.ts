import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. 获取当前用户
    const userId = getUserFromSession(event)

    // 2. 权限校验：查询当前用户是否为 admin
    const currentUser = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).get()

    if (!currentUser || currentUser.role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: '权限不足：需要管理员权限'
        })
    }

    // 3. 获取所有用户列表 (不返回密码)
    const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
    }).from(users).all()

    return allUsers
})