import { processAndSaveImage, validateImageType, validateImageSize } from '../utils/imageProcessor'

export default defineEventHandler(async (event) => {
    try {
        // 读取 multipart/form-data
        const form = await readMultipartFormData(event)

        if (!form || form.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: '没有上传文件'
            })
        }

        // 获取第一个文件
        const file = form[0]

        if (!file.filename) {
            throw createError({
                statusCode: 400,
                statusMessage: '文件名无效'
            })
        }

        console.log('收到上传请求:', {
            filename: file.filename,
            type: file.type,
            size: `${(file.data.length / 1024).toFixed(2)} KB`
        })

        // 验证文件类型
        if (!validateImageType(file.filename)) {
            throw createError({
                statusCode: 400,
                statusMessage: '只支持 JPG、PNG、WEBP 格式'
            })
        }

        // 验证文件大小
        if (!validateImageSize(file.data.length)) {
            throw createError({
                statusCode: 400,
                statusMessage: '文件大小不能超过 10MB'
            })
        }

        // 处理并保存图片
        const imagePath = await processAndSaveImage(file.data, file.filename)

        console.log('上传成功:', imagePath)

        return {
            success: true,
            path: imagePath,
            message: '上传成功'
        }

    } catch (error: any) {
        console.error('上传失败:', error)

        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || '上传失败'
        })
    }
})