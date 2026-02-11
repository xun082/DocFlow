/**
 * 剪贴板相关工具函数
 */

/**
 * 将图片 URL 转为 PNG Blob 并写入剪贴板
 * 通过 Image + Canvas 将任意格式转为 PNG（兼容 webp 等）
 * 粘贴到富文本编辑器时会直接插入图片
 */
export async function copyImageAsBlob(imageUrl: string): Promise<void> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas 不可用');
  ctx.drawImage(img, 0, 0);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('图片转换失败'));
    }, 'image/png');
  });

  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}

/**
 * 复制文本到剪贴板
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
}
