import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';
import { and, like, gte, lte, eq, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    try {
        const userId = getUserFromSession(event);
        // 获取查询参数

        const query = getQuery(event);

        console.log('搜索参数:', query);

        // 构建查询条件数组
        const conditions = [eq(meals.userId, userId)];

        // 1. 关键词搜索（餐食名称或地点）
        if (query.keyword) {
            const keyword = `%${query.keyword}%`;
            conditions.push(
                sql`(${meals.name} LIKE ${keyword} OR ${meals.location} LIKE ${keyword})`
            );
        }

        // 2. 分类筛选
        if (query.category) {
            const categoryValue = query.category as '早餐' | '午餐' | '晚餐' | '零食' | '其他';
            conditions.push(eq(meals.category, categoryValue));
        }

        // 3. 日期范围筛选
        if (query.startDate) {
            const startDate = new Date(query.startDate as string);
            conditions.push(gte(meals.mealDate, startDate));
        }

        if (query.endDate) {
            const endDate = new Date(query.endDate as string);
            // 设置为当天的 23:59:59
            endDate.setHours(23, 59, 59, 999);
            conditions.push(lte(meals.mealDate, endDate));
        }

        // 4. 评分筛选
        if (query.minRating) {
            const minRating = parseFloat(query.minRating as string);
            conditions.push(gte(meals.rating, minRating));
        }

        if (query.maxRating) {
            const maxRating = parseFloat(query.maxRating as string);
            conditions.push(lte(meals.rating, maxRating));
        }

        // 5. 地点筛选（精确匹配）
        if (query.location) {
            conditions.push(eq(meals.location, query.location as string));
        }

        // 执行查询
        let searchResults;

        if (conditions.length > 0) {
            searchResults = await db.query.meals.findMany({
                where: and(...conditions),
                orderBy: (meals, { desc }) => [desc(meals.mealDate)],
            });
        } else {
            // 如果没有任何筛选条件，返回所有记录
            searchResults = await db.query.meals.findMany({
                orderBy: (meals, { desc }) => [desc(meals.mealDate)],
            });
        }

        console.log('找到记录数:', searchResults.length);

        return {
            success: true,
            count: searchResults.length,
            results: searchResults,
        };
    } catch (e: any) {
        if (e.statusCode === 401) throw e;

        console.error('搜索失败:', e);

        throw createError({
            statusCode: 500,
            statusMessage: '搜索失败',
        });
    }
});