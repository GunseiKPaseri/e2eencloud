/**
 * タグ一覧をシリアライズ
 * @param tags タグ一覧
 * @returns シリアライズされたタグ
 */
export const serializeTags = (tags: string[]) => tags.map((x) => x.replaceAll('|', '||')).join('|p');
/**
 * タグ一覧をデシリアライズ
 * @param serialized タグ一覧
 * @returns デシリアライズされたタグ
 */
export const deserializeTags = (serialized: string) => serialized.split('|p').map((x) => x.replaceAll('||', '|'));
