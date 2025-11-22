import { db } from '~~/server/db'
import { users, meals } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'
import { deleteImage } from '~~/server/utils/imageProcessor'

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

    // 防止自杀（管理员不能删除自己）
    if (targetUserId === adminId) {
        throw createError({ statusCode: 400, statusMessage: '不能删除自己的管理员账号' })
    }

    // 3. 清理资源逻辑
    try {
        // A. 查找该用户所有的用餐记录，为了拿到图片路径
        const userMeals = await db.select().from(meals).where(eq(meals.userId, targetUserId)).all()

        // B. 物理删除图片文件
        for (const meal of userMeals) {
            if (meal.image) {
                await deleteImage(meal.image)
            }
        }

        // C. 删除数据库中的用餐记录
        // (即便 SQLite 设置了级联删除，为了保险和跨数据库兼容，手动删除也是好习惯)
        await db.delete(meals).where(eq(meals.userId, targetUserId))

        // D. 删除用户
        await db.delete(users).where(eq(users.id, targetUserId))

        return { success: true, message: '用户及其所有数据已删除' }
        
    } catch (e: any) {
        console.error('删除用户失败:', e)
        throw createError({ statusCode: 500, statusMessage: '删除操作失败' })
    }
})