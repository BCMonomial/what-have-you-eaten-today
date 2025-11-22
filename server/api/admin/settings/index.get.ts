import { db } from '~~/server/db'
import { settings, users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. 权限校验：获取当前用户 ID
    const userId = getUserFromSession(event)

    // 2. 权限校验：确认是否为管理员
    // 因为 Cookie 里只有 ID，需要查询数据库来确认角色
    const currentUser = await db.select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .get()

    if (!currentUser || currentUser.role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: '权限不足：需要管理员权限'
        })
    }

    // 3. 获取所有设置
    const allSettings = await db.select().from(settings).all()

    return allSettings
})