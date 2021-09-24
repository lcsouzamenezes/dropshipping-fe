import { Flex, Box, Text, Avatar } from '@chakra-ui/react';

interface ProfileProps {
  showProfileDetails?: boolean;
}

export function Profile({ showProfileDetails = true }: ProfileProps) {
  return (
    <Flex align="center">
      {showProfileDetails && (
        <Box mr="4" textAlign="right">
          <Text>Jonathan Bertoldi</Text>
          <Text color="gray.500" fontSize="sm">
            jonathan@bebikes.com.br
          </Text>
        </Box>
      )}
      <Avatar
        size="md"
        name="Jonathan Bertoldi"
        src="https://github.com/jayremias.png"
      />
    </Flex>
  );
}
