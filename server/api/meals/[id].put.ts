import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteImage } from '~~/server/utils/imageProcessor'

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

        // 读取请求体
        const body = await readBody(event);

        console.log('更新记录 ID:', id);
        console.log('接收到的数据:', body);

        // 数据校验
        if (!body.name || !body.mealDate) {
            throw createError({
                statusCode: 400,
                statusMessage: '缺少必要的字段 (name, mealDate)',
            });
        }

        // 日期处理
        const mealDate = new Date(body.mealDate);
        if (isNaN(mealDate.getTime())) {
            throw createError({
                statusCode: 400,
                statusMessage: '日期格式错误',
            });
        }

        // 评分处理
        const rating = body.rating ? parseFloat(body.rating) : null;
        if (rating !== null && isNaN(rating)) {
            throw createError({
                statusCode: 400,
                statusMessage: '评分格式错误',
            });
        }

        // 图片处理
        if (body.image) {
            // 先查询旧记录
            const oldMeal = await db.query.meals.findFirst({
                where: and(
                    eq(meals.id, id),
                    eq(meals.userId, userId)
                ),
            })

            // 如果有旧图片且与新图片不同，删除旧图片
            if (oldMeal?.image && oldMeal.image !== body.image) {
                await deleteImage(oldMeal.image)
            }
        }

        // 更新数据
        const updatedMeal = await db
            .update(meals)
            .set({
                name: body.name,
                category: body.category || null,
                mealDate: mealDate,
                location: body.location || null,
                rating: rating,
                ratingNotes: body.ratingNotes || null,
                remarks: body.remarks || null,
                visibility: body.visibility || 'self',
                image: body.image || null,
            })
            .where(and(
                eq(meals.id, id),
                eq(meals.userId, userId)
            ))
            .returning();

        if (!updatedMeal || updatedMeal.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: '记录不存在或无权修改',
            });
        }

        console.log('更新成功:', updatedMeal[0]);

        return updatedMeal[0];
    } catch (e: any) {
        console.error('更新失败:', e);

        if (e.statusCode === 401) throw e;
        
        throw createError({
            statusCode: e.statusCode || 500,
            statusMessage: e.statusMessage || '更新失败',
        });
    }
});