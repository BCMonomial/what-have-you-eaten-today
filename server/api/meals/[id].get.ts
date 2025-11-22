import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const userId = getUserFromSession(event)
        const id = parseInt(event.context.params?.id || '0');

        if (!id) throw createError({ statusCode: 400, statusMessage: '无效的 ID' });

        // 查询条件：ID 匹配 且 UserID 匹配
        const meal = await db.query.meals.findFirst({
            where: and(
                eq(meals.id, id),
                eq(meals.userId, userId) // 👈 安全校验
            ),
        });

        if (!meal) {
            throw createError({
                statusCode: 404,
                statusMessage: '记录不存在或无权查看',
            });
        }

        return meal;
    } catch (e: any) {
        console.error('获取记录失败:', e);

        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || '获取记录失败',
        });
    }
});