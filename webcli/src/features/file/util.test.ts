import {
  genUUID
} from './utils'

describe('#genUUID', () => {
  test('-を含まない', () => {
    expect(genUUID().indexOf('-')).toBe(-1)
  })
})
