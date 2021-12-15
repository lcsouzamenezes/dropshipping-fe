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
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { RiAddLine, RiDownloadLine } from 'react-icons/ri'
import { useState } from 'react'
import { Select } from '@/components/Form/Select'
import { withSSRAuth } from 'utils/withSSRAuth'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import { api } from '@/services/api/apiClient'
import { Checkbox } from '@/components/Form/Checkbox'
import { useProducts } from '@/services/api/hooks/useProducts'
import { queryClient } from '@/services/queryClient'
import Head from 'next/head'

type User = {
  id: string
  email: string
  createdAt: string
}

interface BlingAccount {
  id: string
  description: string
}

interface BlingProductImportResponse {
  status: string
  message: string
}

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)
  const [selectedBling, setSelectedBling] = useState<string>(undefined)
  const [updateProductsBling, setUpdateProductsBling] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const integrationsQuery = useIngrations('bling')
  const { isFetching, isLoading, error, data } = useProducts(page, perPage)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  async function handlePrefetchProduct(product_id: string) {
    await queryClient.prefetchQuery(
      ['product', product_id],
      async () => {
        const response = await api.get(`products/${product_id}`)
        return response.data
      },
      {
        staleTime: 1000 * 60 * 10, //10 min
      }
    )
  }

  async function handleImportBlingProducts() {
    //maybe prefetch here
    const { data: bling } = await api.get<BlingAccount>(
      `integrations/${selectedBling}`
    )

    const { data: importationResult } =
      await api.post<BlingProductImportResponse>('products/import/bling', {
        integration: bling.id,
        update: updateProductsBling,
      })

    if (importationResult.status == 'success') {
      toast({
        position: 'bottom-right',
        title: 'Importação iniciada.',
        description:
          'Você recebera uma notificação quando o processo for concluído.',
        status: 'success',
      })
    } else {
      toast({
        position: 'bottom-right',
        title: 'Falha na Importação.',
        description:
          'Houve uma falha ao iniciar a importação. Por favor tente novamente mais tarde.',
        status: 'error',
      })
    }

    onClose()
  }

  return (
    <Box>
      <Head>
        <title>Produtos - Outter DS</title>
        <meta property="og:title" content="Produtos - Outter DS" key="title" />
      </Head>
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
              <Link href="/products/create" passHref>
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
                    <Th>Produto</Th>
                    <Th>Preço</Th>
                    {isWideVersion && <Th>Estoque</Th>}
                    <Th width={['6', '6', '8']}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.products.map((product) => (
                    <Tr key={product.id}>
                      <Td px={['4', '4', '6']}>
                        <Checkbox colorScheme="brand" />
                      </Td>
                      <Td>
                        <Box>
                          <Link href={`/products/${product.id}`} passHref>
                            <Chakralink
                              onMouseEnter={() =>
                                handlePrefetchProduct(product.id)
                              }
                              color="brand.500"
                            >
                              <Text fontWeight="bold">{product.name}</Text>
                            </Chakralink>
                          </Link>
                          <Text fontSize="sm" color="gray.500">
                            SKU: {product.sku}
                          </Text>
                        </Box>
                      </Td>
                      <Td>{product.price}</Td>
                      {isWideVersion && <Td>{product.stock}</Td>}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {!data.products.length && (
                <Box p={2}>
                  <Alert status="info" display="flex" justifyContent="center">
                    <AlertIcon />
                    Nenhum dado encontrado.
                  </Alert>
                </Box>
              )}
              <Pagination
                registersPerPage={perPage}
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
                <Checkbox
                  onChange={(e) => setUpdateProductsBling(e.target.checked)}
                  defaultIsChecked
                >
                  Atualizar produtos existentes
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

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    return {
      props: {
        cookies: ctx.req.headers.cookie ?? '',
      },
    }
  },
  {
    roles: ['supplier'],
  }
)
