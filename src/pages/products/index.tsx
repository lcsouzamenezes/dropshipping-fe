import {
  Box,
  Badge,
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
  Text,
  useBreakpointValue,
  Spinner,
  Stack,
  Link as Chakralink,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  CircularProgress,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { RiAddLine, RiDownloadLine } from 'react-icons/ri'
import { useRef, useState } from 'react'
import { useUsers } from '../../services/api/hooks/useUsers'
import { Select } from '@/components/Form/Select'
import { withSSRAuth } from 'utils/withSSRAuth'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import { api } from '@/services/api/apiClient'
import { Checkbox } from '@/components/Form/Checkbox'

type User = {
  id: string
  email: string
  createdAt: string
}

type fetchUserResponse = {
  totalCount: number
  users: User[]
}

interface BlingAccounts {
  id: string
  description: string
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [selectedBling, setSelectedBling] = useState<string>(undefined)
  const toastRef = useRef<string | number>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const integrationsQuery = useIngrations('bling')
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

  async function handleImportBlingProducts() {
    //maybe prefetch here
    const bling = await api.get(`integrations/${selectedBling}`)
    // const response = await blingApi(bling.id).get('produtos')
    toastRef.current = toast({
      position: 'bottom-right',
      render: () => (
        <Box p={3}>
          <CircularProgress isIndeterminate color="brand.500" /> Carregando
          produtos.
        </Box>
      ),
      duration: null,
    })
  }

  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Produtos
              {isFetching && !isLoading && (
                <Spinner color="gray.500" size="sm" ml="4" />
              )}
            </Heading>
            <Stack direction="row">
              <Button
                onClick={onOpen}
                size="sm"
                fontSize="sm"
                leftIcon={<Icon as={RiDownloadLine} fontSize={20} />}
                disabled={
                  integrationsQuery.isLoading || !integrationsQuery.data
                }
              >
                Importar
              </Button>
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
            </Stack>
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
      {!!integrationsQuery.data && (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Importação de Pedidos</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={6}>
                <Select
                  name="bling"
                  label="Conta Bling"
                  placeholder="Selecione uma conta"
                  onChange={(e) => setSelectedBling(e.target.value)}
                >
                  {integrationsQuery.data.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
                <Checkbox defaultIsChecked>
                  Atualizar produtos existentes <Badge>Nome</Badge>{' '}
                  <Badge>Estoque</Badge> <Badge>Preço</Badge>
                </Checkbox>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleImportBlingProducts}
                disabled={!selectedBling}
                colorScheme="brand"
              >
                Importar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  )
}
