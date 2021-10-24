import { fireEvent, render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { useColorMode } from '@chakra-ui/react'
import { ColorModeSwitch } from './ColorModeSwitch'

jest.mock('@chakra-ui/react', () => {
  const originalMethods = jest.requireActual('@chakra-ui/react')
  return {
    ...originalMethods,
    useColorMode: jest.fn(() => originalMethods.useColorMode()),
  }
})

describe('ColorModeSwitch', () => {
  it('render correctly', () => {
    render(<ColorModeSwitch />)
    expect(screen.getByTestId('color-mode-switch')).toBeInTheDocument()
  })

  it('should change color mode when clicked', () => {
    const toggleColorMode = jest.fn()
    const mockedUseColorMode = mocked(useColorMode) as any

    mockedUseColorMode.mockReturnValue({
      toggleColorMode,
    })

    render(<ColorModeSwitch />)

    const colorModeSwitch = screen.getByTestId('color-mode-switch')

    fireEvent.click(colorModeSwitch)

    expect(toggleColorMode).toHaveBeenCalledTimes(1)
  })
})
