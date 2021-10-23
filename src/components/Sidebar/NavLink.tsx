import { Link as ChakraLink, Icon, Text, LinkProps } from '@chakra-ui/react'
import { ElementType } from 'react'
import { ActiveLink } from '../ActiveLink'

interface NavLinkProps extends LinkProps {
  href: string
  icon: ElementType
  children: string
}

export function NavLink({ href, children, icon, ...rest }: NavLinkProps) {
  return (
    <ActiveLink href={href} passHref>
      <ChakraLink display="flex" {...rest}>
        {!!icon && <Icon as={icon} fontSize="20" />}
        <Text ml="4" fontWeight="medium">
          {children}
        </Text>
      </ChakraLink>
    </ActiveLink>
  )
}
