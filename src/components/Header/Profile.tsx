import { Flex, Box, Text, Avatar } from '@chakra-ui/react';

export function Profile() {
  return (
    <Flex align="center">
      <Box mr="4" textAlign="right">
        <Text>Jonathan Bertoldi</Text>
        <Text color="gray.300" fontSize="sm">
          jonathan@bebikes.com.br
        </Text>
      </Box>
      <Avatar
        size="md"
        name="Jonathan Bertoldi"
        src="https://github.com/jayremias.png"
      />
    </Flex>
  );
}
