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
  useBreakpointValue,
  Spinner,
  Link as Chakralink,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { RiAddLine } from 'react-icons/ri'
import { useState } from 'react'
import { api } from '../../services/api/apiClient'
import { useQuery } from 'react-query'
import { useUsers } from '../../services/api/hooks/useUsers'

type User = {
  id: string
  email: string
  createdAt: string
}

type fetchUserResponse = {
  totalCount: number
  users: User[]
}

export default function UserList() {
  const [page, setPage] = useState(1)

  const { isFetching, isLoading, error, data } = useUsers(page)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  async function handlePrefetchUser(user_id: string) {
    // await queryClient.prefetchQuery(
    //   ['user', user_id],
    //   async () => {
    //     const response = await api.get(`users/${user_id}`)
    //     return response.data
    //   },
    //   {
    //     staleTime: 1000 * 60 * 10, //10 min
    //   }
    // )
  }

  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Usuários
              {isFetching && !isLoading && (
                <Spinner color="gray.500" size="sm" ml="4" />
              )}
            </Heading>
            <Link href="/users/create" passHref>
              <Button
                as="a"
                size="sm"
                fontSize="sm"
                leftIcon={<Icon as={RiAddLine} fontSize={20} />}
                colorScheme="brand"
              >
                Adicionar
              </Button>
            </Link>
          </Flex>
          {isLoading ? (
            <Flex justify="center">
              <Spinner color="brand.500" />
            </Flex>
          ) : error ? (
            <Flex justify="center">
              <Text>Falha ao obter dados.</Text>
            </Flex>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th px={['4', '4', '6']} color="gray.500" width="8">
                      <Checkbox colorScheme="brand" />
                    </Th>
                    <Th>Usuário</Th>
                    {isWideVersion && <Th>Data de cadastro</Th>}
                    <Th width={['6', '6', '8']}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.users.map((user) => (
                    <Tr key={user.id}>
                      <Td px={['4', '4', '6']}>
                        <Checkbox colorScheme="brand" />
                      </Td>
                      <Td>
                        <Box>
                          <Chakralink
                            onMouseEnter={() => handlePrefetchUser(user.id)}
                            color="brand.500"
                          >
                            <Text fontWeight="bold">{user.name}</Text>
                          </Chakralink>
                          <Text fontSize="sm" color="gray.500">
                            {user.email}
                          </Text>
                        </Box>
                      </Td>
                      {isWideVersion && <Td>{user.createdAt}</Td>}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Pagination
                totalCountOfRegisters={data.totalCount}
                currentPage={page}
                onPageChange={setPage}
              />
            </>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
