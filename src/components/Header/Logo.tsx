import { Text } from '@chakra-ui/react';

export function Logo() {
  return (
    <Text
      fontSize={['md', '3xl']}
      fontWeight="bold"
      letterSpacing="tight"
      w="64"
    >
      DropShipping
      <Text as="span" color="yellow.400">
        .
      </Text>
    </Text>
  );
}
