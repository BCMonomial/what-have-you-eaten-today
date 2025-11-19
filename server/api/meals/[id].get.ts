import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        // 获取 URL 参数中的 id
        const id = parseInt(event.context.params?.id || '0');

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: '无效的 ID',
            });
        }

        console.log('获取记录 ID:', id);

        // 查询单条记录
        const meal = await db.query.meals.findFirst({
            where: eq(meals.id, id),
        });

        if (!meal) {
            throw createError({
                statusCode: 404,
                statusMessage: '记录不存在',
            });
        }

        console.log('找到记录:', meal);

        return meal;
    } catch (e: any) {
        console.error('获取记录失败:', e);

        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || '获取记录失败',
        });
    }
});