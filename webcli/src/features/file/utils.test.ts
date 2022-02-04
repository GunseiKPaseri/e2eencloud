import {
  genUUID, getSafeName
} from './utils'

describe('#genUUID', () => {
  test('\'-\'を含まない', () => {
    expect(genUUID().indexOf('-')).toBe(-1)
  })
})

describe('#getSafeName', () => {
  test('安全な文字列に変換される', () => {
    expect(getSafeName([
      '\\/:*?<>|',
      'hoge.fuga.piyo',
      'hoge.fuga.piyo'
    ], ['hoge.fuga.piyo'])).toEqual([
      '＼／：＊？＜＞｜',
      'hoge.fuga (1).piyo',
      'hoge.fuga (2).piyo']
    )
  })
})
