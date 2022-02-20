import { hex2bytearray } from './uint8'

describe('#hex2bytearray', () => {
  test('16進法文字列をArrayBuffer化', () => {
    const x = hex2bytearray('1234567890abcdef')
    expect(Array.from(x)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef])
  })
})
