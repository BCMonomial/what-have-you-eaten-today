import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteImage } from '../../utils/imageProcessor'

export default defineEventHandler(async (event) => {
    try {
        const userId = getUserFromSession(event)
        // 获取 URL 参数中的 id
        const id = parseInt(event.context.params?.id || '0');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: '无效的 ID',
            });
        }
        // 1. 先查询是否存在且属于该用户 
        const meal = await db.query.meals.findFirst({
            where: and(eq(meals.id, id), eq(meals.userId, userId)), 
        })

        if (!meal) {
             throw createError({ statusCode: 404, statusMessage: '无权操作或记录不存在' });
        }

        // 删除记录
        await db.delete(meals).where(eq(meals.id, id));

        // 删除图片文件
        if (meal?.image) {
            await deleteImage(meal.image)
        }

        // 返回成功响应
        return {
            success: true,
            message: '删除成功',
        };
    } catch (e: any) {
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || '删除失败',
        });
    }
});