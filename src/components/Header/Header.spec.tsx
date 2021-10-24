import { render, screen } from '@testing-library/react'
import { useBreakpointValue } from '@chakra-ui/react'
import { mocked } from 'ts-jest/utils'
import { Header } from '.'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

jest.mock('@chakra-ui/react', () => {
  const origianlChakra = jest.requireActual('@chakra-ui/react')
  return {
    ...origianlChakra,
    useBreakpointValue: jest.fn(() => true),
  }
})

describe('Header Component', () => {
  it('render correctly', () => {
    render(<Header />)

    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument()
    expect(screen.queryByTestId('open-nav-button')).toBeNull()
  })

  it('render correctly in mobile', () => {
    const mockedUseBreakpointValue = mocked(useBreakpointValue)
    mockedUseBreakpointValue.mockReturnValueOnce(false)

    render(<Header />)

    expect(screen.queryByPlaceholderText('Buscar')).toBeNull()
    expect(screen.queryByTestId('open-nav-button')).toBeInTheDocument()
  })
})
