import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useBreakpointValue,
  Spinner,
  Link as Chakralink,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Button,
  Stack,
  Badge,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import { api } from '@/services/api/apiClient'
import { Checkbox } from '@/components/Form/Checkbox'
import { useProducts } from '@/services/api/hooks/useProducts'
import { queryClient } from '@/services/queryClient'
import Head from 'next/head'
import { useSales } from '@/services/api/hooks/useSales'

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

export default function SalesPage() {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)
  const [selectedBling, setSelectedBling] = useState<string>(undefined)
  const [updateProductsBling, setUpdateProductsBling] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const { isFetching, isLoading, error, data } = useSales(page, perPage)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  async function handlePrefetchSale(listing_id: string) {
    await queryClient.prefetchQuery(
      ['listings', listing_id],
      async () => {
        const response = await api.get(`listings/${listing_id}`)
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
        <title>Vendas - Outter DS</title>
        <meta property="og:title" content="Vendas - Outter DS" key="title" />
      </Head>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Vendas
              {isFetching && !isLoading && (
                <Spinner color="gray.500" size="sm" ml="4" />
              )}
            </Heading>
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
                    {isWideVersion && <Th>Quantidade</Th>}
                    <Th>Status</Th>
                    <Th width={['6', '6', '8']}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.sales.map((sale) => (
                    <Tr key={sale.id}>
                      <Td px={['4', '4', '6']}>
                        <Checkbox colorScheme="brand" />
                      </Td>
                      <Td>
                        <Box>
                          <Link href={`/listings/${sale.listing.id}`} passHref>
                            <Chakralink
                              onMouseEnter={() => handlePrefetchSale(sale.id)}
                              color="brand.500"
                            >
                              <Text fontWeight="bold">
                                {sale.listing.product.name}
                              </Text>
                            </Chakralink>
                          </Link>
                          <Text fontSize="sm" color="gray.500">
                            ({sale.listing.product.sku})
                          </Text>
                        </Box>
                      </Td>
                      <Td>{sale.quantity}</Td>
                      <Td>
                        <Badge variant="solid" colorScheme="yellow">
                          nota pendente
                        </Badge>
                      </Td>
                      <Td>
                        <Stack direction="row">
                          <Button size="sm" colorScheme="brand">
                            Enviar NFe
                          </Button>
                          <Button size="sm" colorScheme="red">
                            Cancelar
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {!data.sales.length && (
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
    </Box>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {},
  }
})
