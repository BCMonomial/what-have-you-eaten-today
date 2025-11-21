import sharp from 'sharp'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * 图片处理配置
 */
const IMAGE_CONFIG = {
    maxWidth: 1920,
    maxHeight: 1080,
    maxSizeKB: 2048, // 2MB
    quality: 90,
    uploadDir: 'public/uploads/meals'
}

/**
 * 确保上传目录存在
 */
async function ensureUploadDir() {
    const uploadPath = join(process.cwd(), IMAGE_CONFIG.uploadDir)
    if (!existsSync(uploadPath)) {
        await mkdir(uploadPath, { recursive: true })
    }
    return uploadPath
}

/**
 * 生成唯一文件名
 */
function generateFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
    return `${timestamp}-${random}.${ext}`
}

/**
 * 处理并保存图片
 * @param buffer 图片 buffer
 * @param originalName 原始文件名
 * @returns 保存后的文件路径（相对于 public 目录）
 */
export async function processAndSaveImage(
    buffer: Buffer,
    originalName: string
): Promise<string> {
    try {
        // 确保上传目录存在
        const uploadPath = await ensureUploadDir()

        // 生成文件名
        const filename = generateFilename(originalName)
        const filepath = join(uploadPath, filename)

        // 使用 sharp 处理图片
        let image = sharp(buffer)

        // 获取图片元数据
        const metadata = await image.metadata()

        console.log('原始图片信息:', {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: `${(buffer.length / 1024).toFixed(2)} KB`
        })

        // 1. 调整尺寸（如果超过最大尺寸）
        if (metadata.width && metadata.height) {
            if (metadata.width > IMAGE_CONFIG.maxWidth || metadata.height > IMAGE_CONFIG.maxHeight) {
                image = image.resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                console.log('已调整尺寸')
            }
        }

        // 2. 转换为 JPEG 并压缩
        let quality = IMAGE_CONFIG.quality
        let processedBuffer = await image.jpeg({ quality }).toBuffer()

        // 3. 如果文件仍然太大，降低质量
        while (processedBuffer.length > IMAGE_CONFIG.maxSizeKB * 1024 && quality > 10) {
            quality -= 10
            console.log(`文件过大，降低质量至 ${quality}%`)
            processedBuffer = await sharp(buffer)
                .resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality })
                .toBuffer()
        }

        // 4. 保存文件
        await writeFile(filepath, processedBuffer)

        console.log('处理后图片信息:', {
            size: `${(processedBuffer.length / 1024).toFixed(2)} KB`,
            quality: `${quality}%`,
            path: filepath
        })

        // 返回相对于 public 的路径
        return `/uploads/meals/${filename}`

    } catch (error) {
        console.error('图片处理失败:', error)
        throw new Error('图片处理失败')
    }
}

/**
 * 删除图片文件
 * @param imagePath 图片路径（如 /uploads/meals/xxx.jpg）
 */
export async function deleteImage(imagePath: string): Promise<void> {
    try {
        if (!imagePath) return

        // 构建完整路径
        const fullPath = join(process.cwd(), 'public', imagePath)

        // 检查文件是否存在
        if (existsSync(fullPath)) {
            await unlink(fullPath)
            console.log('已删除图片:', fullPath)
        }
    } catch (error) {
        console.error('删除图片失败:', error)
        // 不抛出错误，避免影响主流程
    }
}

/**
 * 验证文件类型
 */
export function validateImageType(filename: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    return validExtensions.includes(ext)
}

/**
 * 验证文件大小（最大 10MB 原始文件）
 */
export function validateImageSize(size: number): boolean {
    const maxSize = 10 * 1024 * 1024 // 10MB
    return size <= maxSize
}