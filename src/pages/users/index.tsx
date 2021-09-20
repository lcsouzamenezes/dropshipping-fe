import {
  Box,
  Flex,
  Heading,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Text,
} from '@chakra-ui/react';
import { Pagination } from '../../components/Pagination';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { RiAddLine, RiPencilLine } from 'react-icons/ri';

export default function UserList() {
  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" borderRadius="8" bg="gray.800" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Usuários
            </Heading>
            <Button
              href="/users/create"
              as="a"
              size="sm"
              fontSize="sm"
              leftIcon={<Icon as={RiAddLine} fontSize={20} />}
              colorScheme="yellow"
            >
              Adicionar
            </Button>
          </Flex>
          <Table colorScheme="whiteAlpha">
            <Thead>
              <Tr>
                <Th px="6" color="gray.300" width="8">
                  <Checkbox colorScheme="yellow" />
                </Th>
                <Th>Usuário</Th>
                <Th>Data de cadastro</Th>
                <Th width="8"></Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td px="6">
                  <Checkbox colorScheme="yellow" />
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="bold">Jonathan Bertoldi</Text>
                    <Text fontSize="sm" color="gray.300">
                      jonathan@bebikes.com.br
                    </Text>
                  </Box>
                </Td>
                <Td>04/03/2021</Td>
                <Td width="8">
                  <Button
                    href="/users/create"
                    as="a"
                    size="sm"
                    fontSize="sm"
                    leftIcon={<Icon as={RiPencilLine} fontSize={20} />}
                    colorScheme="yellow"
                  >
                    Editar
                  </Button>
                </Td>
              </Tr>
              <Tr>
                <Td px="6">
                  <Checkbox colorScheme="yellow" />
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="bold">Jonathan Bertoldi</Text>
                    <Text fontSize="sm" color="gray.300">
                      jonathan@bebikes.com.br
                    </Text>
                  </Box>
                </Td>
                <Td>04/03/2021</Td>
                <Td width="8">
                  <Button
                    href="/users/create"
                    as="a"
                    size="sm"
                    fontSize="sm"
                    leftIcon={<Icon as={RiPencilLine} fontSize={20} />}
                    colorScheme="yellow"
                  >
                    Editar
                  </Button>
                </Td>
              </Tr>
              <Tr>
                <Td px="6">
                  <Checkbox colorScheme="yellow" />
                </Td>
                <Td>
                  <Box>
                    <Text fontWeight="bold">Jonathan Bertoldi</Text>
                    <Text fontSize="sm" color="gray.300">
                      jonathan@bebikes.com.br
                    </Text>
                  </Box>
                </Td>
                <Td>04/03/2021</Td>
                <Td width="8">
                  <Button
                    href="/users/create"
                    as="a"
                    size="sm"
                    fontSize="sm"
                    leftIcon={<Icon as={RiPencilLine} fontSize={20} />}
                    colorScheme="yellow"
                  >
                    Editar
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
          <Pagination />
        </Box>
      </Flex>
    </Box>
  );
}
