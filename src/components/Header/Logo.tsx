import { Text, Icon, useBreakpointValue } from '@chakra-ui/react';
import { RiShip2Fill } from 'react-icons/ri';

export function Logo() {
  const isWideVersion = useBreakpointValue({ base: false, lg: true });

  return (
    <>
      <Icon as={RiShip2Fill} fontSize="42" mr="2" color="brand.500" />

      <Text
        fontSize={['md', '3xl']}
        fontWeight="bold"
        letterSpacing="tight"
        w="64"
      >
        {isWideVersion ? 'DropShipping' : 'DS'}
        <Text as="span" color="brand.500">
          .
        </Text>
      </Text>
    </>
  );
}
