/**
 * 画像を読み込み
 * @param src 画像URL
 */
export const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

/**
 * 画像を縮小してbase64を出力
 * @param x 
 */
export const getPreview = async (src: string, mas_size: number, mime: string) => {
  const img = await loadImage(src)
  const w = img.width
  const h = img.height
  const [resizedWidth, resizedHeight] = (
    w > mas_size || h > mas_size
      ? (w > h ? [mas_size, mas_size * h / w] : [mas_size * w / h, mas_size])
      : [w, h]
  )
  const canvas = document.createElement('canvas')
  canvas.width = resizedWidth
  canvas.height = resizedHeight
  const ctx = canvas.getContext('2d')
  if(ctx === null) throw new Error('You can\'t use canvas') 
  ctx.drawImage(img, 0,0, resizedWidth, resizedHeight)
  return canvas.toDataURL(mime)
}
