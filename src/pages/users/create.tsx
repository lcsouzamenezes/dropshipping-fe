import {
  Box,
  Heading,
  Button,
  Icon,
  Divider,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { RiArrowLeftLine } from 'react-icons/ri';
import { Input } from '../../components/Form/Input';

export default function CreateUser() {
  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" borderRadius="8" bg="gray.800" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Criação de Usuário
            </Heading>
            <Button
              href="/users/create"
              as="a"
              size="sm"
              fontSize="sm"
              leftIcon={<Icon as={RiArrowLeftLine} fontSize={20} />}
              colorScheme="yellow"
            >
              Voltar
            </Button>
          </Flex>
          <Divider my="6" borderColor="gray.700" />
          <VStack spacing="8">
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Input label="Nome completo" name="name" type="text" />
              <Input label="E-mail" name="email" type="email" />
            </SimpleGrid>
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Input label="Senha" name="password" type="password" />
              <Input
                label="Confirmação de Senha"
                name="password-confirmation"
                type="password"
              />
            </SimpleGrid>
          </VStack>
          <Flex mt="8" justify="flex-end">
            <HStack spacing="4">
              <Button colorScheme="whiteAlpha">Cancelar</Button>
              <Button colorScheme="yellow">Salvar</Button>
            </HStack>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
