import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  try {
    // 1. 从请求体中读取数据
    const body = await readBody(event);

    // 2. 进行数据校验
    if (!body.name || !body.mealDate) {
      throw createError({
        statusCode: 400, 
        statusMessage: '缺少必要的字段 (name, mealDate)',
      });
    }
    
    // 3. 暂时硬编码 userId
    const tempUserId = 1; 

    // 4. 将数据插入到数据库
    const newMeal = await db.insert(meals).values({
      // 从请求体中获取数据
      name: body.name,
      category: body.category,
      mealDate: new Date(body.mealDate), // 确保 mealDate 是一个 Date 对象
      location: body.location,
      rating: body.rating,
      ratingNotes: body.ratingNotes,
      remarks: body.remarks,
      userId: tempUserId, // 使用临时 userId
    }).returning(); 

    // 5. 设置 HTTP 状态码为 201 (Created)
    setResponseStatus(event, 201);

    // 6. 返回新创建的记录
    return newMeal[0]; // .returning() 返回的是一个数组，我们取第一个元素
  }
  catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || '无法创建用餐记录',
    });
  }
});