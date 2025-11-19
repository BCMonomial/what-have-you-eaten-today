import { db } from '~~/server/db';
import { meals } from '~~/server/db/schema';

export default defineEventHandler(async (event) => {
  try {
    // 1. 从请求体中读取数据
    const body = await readBody(event);

    console.log('📥 接收到的数据:', JSON.stringify(body, null, 2));

    // 2. 进行数据校验
    if (!body.name || !body.mealDate) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少必要的字段 (name, mealDate)',
      });
    }

    // 3. 暂时硬编码 userId
    const tempUserId = 1;

    // 处理日期转换，添加错误处理
    let mealDateObj;
    try {
      // 如果是字符串，转换为 Date 对象
      if (typeof body.mealDate === 'string') {
        mealDateObj = new Date(body.mealDate);

        // 检查日期是否有效
        if (isNaN(mealDateObj.getTime())) {
          throw new Error('无效的日期格式');
        }
      } else if (body.mealDate instanceof Date) {
        mealDateObj = body.mealDate;
      } else {
        throw new Error('日期格式不正确');
      }

      console.log('转换后的日期:', mealDateObj);
    } catch (dateError) {
      const error = dateError as Error;
      console.error('日期转换错误:', error);
      throw createError({
        statusCode: 400,
        statusMessage: `日期格式错误: ${error.message}`,
      });
    }

    // 处理评分，确保是数字或 null
    let ratingValue = null;
    if (body.rating !== null && body.rating !== undefined && body.rating !== '') {
      ratingValue = parseFloat(body.rating);
      if (isNaN(ratingValue)) {
        throw createError({
          statusCode: 400,
          statusMessage: '评分必须是数字',
        });
      }
    }

    // 4. 准备插入的数据
    const insertData = {
      name: body.name,
      category: body.category || null,
      mealDate: mealDateObj,
      location: body.location || null,
      rating: ratingValue,
      ratingNotes: body.ratingNotes || null,
      remarks: body.remarks || null,
      userId: tempUserId,
    };

    console.log('准备插入的数据:', JSON.stringify(insertData, null, 2));

    // 5. 将数据插入到数据库
    const newMeal = await db.insert(meals).values(insertData).returning();

    console.log('插入成功:', newMeal[0]);

    // 6. 设置 HTTP 状态码为 201 (Created)
    setResponseStatus(event, 201);

    // 7. 返回新创建的记录
    return newMeal[0];
  }
  catch (e: any) {
    console.error('创建用餐记录失败:');
    console.error('错误类型:', e.constructor.name);
    console.error('错误信息:', e.message);
    console.error('错误堆栈:', e.stack);

    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage || `创建失败: ${e.message}`,
    });
  }
});