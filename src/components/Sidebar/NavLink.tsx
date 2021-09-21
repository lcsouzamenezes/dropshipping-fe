import { Link, Icon, Text, LinkProps } from '@chakra-ui/react';
import { ElementType, ReactNode } from 'react';

interface NavLinkProps extends LinkProps {
  icon: ElementType;
  children: string;
}

export function NavLink({ children, icon, ...rest }: NavLinkProps) {
  return (
    <Link display="flex" {...rest}>
      {!!icon && <Icon as={icon} fontSize="20" />}
      <Text ml="4" fontWeight="medium">
        {children}
      </Text>
    </Link>
  );
}
