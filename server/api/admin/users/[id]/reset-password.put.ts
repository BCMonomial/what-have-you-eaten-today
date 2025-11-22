import { db } from '~~/server/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 1. 权限校验
    const adminId = getUserFromSession(event)
    const adminUser = await db.select().from(users).where(eq(users.id, adminId)).get()

    if (adminUser?.role !== 'admin') {
        throw createError({ statusCode: 403, statusMessage: '无权操作' })
    }

    // 2. 获取目标用户 ID
    const targetUserId = parseInt(event.context.params?.id || '0')
    if (!targetUserId) throw createError({ statusCode: 400, statusMessage: '无效的用户ID' })

    // 3. 重置逻辑
    const defaultPassword = '123456' // 默认密码
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, targetUserId))

    return { success: true, message: `密码已重置为 ${defaultPassword}` }
})