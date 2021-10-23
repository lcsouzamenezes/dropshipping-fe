import { render } from '@testing-library/react'
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
    const { getByText } = render(
      <ActiveLink href="/">
        <a>Home</a>
      </ActiveLink>
    )
    expect(getByText('Home')).toBeInTheDocument()
  })

  it('receives active class', () => {
    const { getByText } = render(
      <ActiveLink href="/" activeClassName="linkIsActive">
        <a>Home</a>
      </ActiveLink>
    )
    expect(getByText('Home')).toHaveClass('linkIsActive')
  })

  it('should not receive active class', () => {
    const { getByText } = render(
      <ActiveLink href="/not-current-url" activeClassName="linkIsActive">
        <a>Another Page</a>
      </ActiveLink>
    )
    expect(getByText('Another Page')).not.toHaveClass('linkIsActive')
  })
})
