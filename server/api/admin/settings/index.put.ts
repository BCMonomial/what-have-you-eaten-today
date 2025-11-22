import { db } from '~~/server/db'
import { settings, users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // 1. 权限校验：获取当前用户 ID
    const userId = getUserFromSession(event)

    // 2. 权限校验：确认是否为管理员
    const currentUser = await db.select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .get()

    if (!currentUser || currentUser.role !== 'admin') {
        throw createError({
            statusCode: 403,
            statusMessage: '权限不足'
        })
    }

    // 3. 读取请求体
    const body = await readBody(event)
    
    // 校验数据
    if (!body.key || body.value === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: '缺少必要的参数 (key, value)'
        })
    }

    console.log(`管理员正在更新设置: ${body.key} -> ${body.value}`)

    // 4. 更新数据库
    // 将 value 强制转换为字符串存储，因为数据库中是 text 类型
    const updated = await db.update(settings)
        .set({ 
            value: String(body.value),
            updatedAt: new Date() // 更新修改时间
        })
        .where(eq(settings.key, body.key))
        .returning()

    // 检查是否更新成功
    if (!updated || updated.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: '未找到指定的配置项'
        })
    }

    return {
        success: true,
        setting: updated[0]
    }
})