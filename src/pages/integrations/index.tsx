import { Flex, Box, Heading } from '@chakra-ui/react';
import React from 'react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';

export default function Integrations() {
  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Integrações
            </Heading>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
