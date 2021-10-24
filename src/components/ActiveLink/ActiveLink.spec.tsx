import { render, screen } from '@testing-library/react'
import { ActiveLink } from '.'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/',
      }
    },
  }
})

describe('ActiveLink Component', () => {
  it('active link render correctly', () => {
    render(
      <ActiveLink href="/">
        <a>Home</a>
      </ActiveLink>
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('receives active class', () => {
    render(
      <ActiveLink href="/" activeClassName="linkIsActive">
        <a>Home</a>
      </ActiveLink>
    )
    expect(screen.getByText('Home')).toHaveClass('linkIsActive')
  })

  it('should not receive active class', () => {
    render(
      <ActiveLink href="/not-current-url" activeClassName="linkIsActive">
        <a>Another Page</a>
      </ActiveLink>
    )
    expect(screen.getByText('Another Page')).not.toHaveClass('linkIsActive')
  })
})
