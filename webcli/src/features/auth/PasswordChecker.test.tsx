import PasswordChecker from './PasswordChecker'
import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'

describe('#PasswordChecker', () => {
  test('should be red', () => {
    const container0 = render(<PasswordChecker score={0} />).container.children[0]
    const style0 = container0.getAttribute('style')
    expect(style0?.indexOf('red')).not.equals(-1)
    expect(style0?.indexOf('orange')).equals(-1)
    expect(style0?.indexOf('green')).equals(-1)
    const container1 = render(<PasswordChecker score={1} />).container.children[0]
    const style1 = container1.getAttribute('style')
    expect(style1?.indexOf('red')).not.equals(-1)
    expect(style1?.indexOf('orange')).equals(-1)
    expect(style1?.indexOf('green')).equals(-1)
  })
  test('should be orange', () => {
    const container0 = render(<PasswordChecker score={2} />).container.children[0]
    const style0 = container0.getAttribute('style')
    expect(style0?.indexOf('red')).equals(-1)
    expect(style0?.indexOf('orange')).not.equals(-1)
    expect(style0?.indexOf('green')).equals(-1)
    const container1 = render(<PasswordChecker score={3} />).container.children[0]
    const style1 = container0.getAttribute('style')
    expect(style1?.indexOf('red')).equals(-1)
    expect(style1?.indexOf('orange')).not.equals(-1)
    expect(style1?.indexOf('green')).equals(-1)
  })
  test('should be green', () => {
    const container0 = render(<PasswordChecker score={4} />).container.children[0]
    const style0 = container0.getAttribute('style')
    expect(style0?.indexOf('red')).equals(-1)
    expect(style0?.indexOf('orange')).equals(-1)
    expect(style0?.indexOf('green')).not.equals(-1)
  })
})