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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { api } from '@/services/api/apiClient'
import { Checkbox } from '@/components/Form/Checkbox'
import { queryClient } from '@/services/queryClient'
import Head from 'next/head'
import { SaleFormated, useSales } from '@/services/api/hooks/useSales'
import { File } from '@/components/Form/File'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useAuth } from 'context/AuthContext'
import {
  RiTruckLine,
  RiMenuLine,
  RiFileCopy2Line,
  RiCloseLine,
  RiDownloadLine,
} from 'react-icons/ri'

interface SendFilesFormData {
  receipt: FileList
  label: FileList
  invoice: FileList
}

export default function SalesPage() {
  const [page, setPage] = useState(1)
  const [selectedSale, setSelectedSale] = useState<SaleFormated | null>(null)
  const [perPage, SetPerPage] = useState(20)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const { user } = useAuth()
  const { isFetching, isLoading, error, data } = useSales(page, perPage)

  const { register, handleSubmit, formState, setError, clearErrors } = useForm({
    mode: 'onChange',
  })

  const { errors } = formState

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

  // async function handleFilesFormSubmit(e: FormEvent<HTMLElement>) {
  const handleFilesFormSubmit: SubmitHandler<SendFilesFormData> = async (
    values
  ) => {
    clearErrors()
    if (values.receipt[0]) {
      if (values.receipt[0].type !== 'application/pdf') {
        setError('receipt', {
          message: 'Arquivo com formato inválido',
        })
      }
    }
    if (values.label[0]) {
      if (values.label[0].type !== 'application/pdf') {
        setError('label', {
          message: 'Arquivo com formato inválido',
        })
      }
    }
    if (values.invoice[0]) {
      if (values.invoice[0].type !== 'application/pdf') {
        setError('invoice', {
          message: 'Arquivo com formato inválido',
        })
      }
    }

    const formData = new FormData()
    formData.append('receipt', values.receipt[0])
    formData.append('label', values.label[0])
    formData.append('invoice', values.invoice[0])

    try {
      const response = await api.patch(
        `/sales/${selectedSale.id}/files`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      handleCloseModal()

      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Dados atualizados com successo',
      })
    } catch (error) {
      console.log(error)
      toast({
        status: 'error',
        variant: 'solid',
        position: 'top',
        title: 'Falha ao atualizar os dados',
      })
    }
  }

  function handleCloseModal() {
    setSelectedSale(null)
    onClose()
  }

  function renderSaleStatus({ status }) {
    const statusMapper = {
      pending: {
        name: 'Pendente',
        color: 'yellow',
      },
      waiting_shipping: {
        name: 'Aguardando Envio',
        color: 'blue',
      },
    }

    return (
      <Badge variant="solid" colorScheme={statusMapper[status].color}>
        {statusMapper[status].name}
      </Badge>
    )
  }

  function renderSupplierActions(sale) {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          size="sm"
          aria-label="Options"
          icon={<Icon as={RiMenuLine} />}
          variant="outline"
        >
          Actions
        </MenuButton>
        <MenuList>
          <MenuItem
            icon={<Icon as={RiFileCopy2Line} />}
            onClick={() => {
              setSelectedSale(sale)
              onOpen()
            }}
          >
            Ver Arquivos
          </MenuItem>
          <MenuItem icon={<Icon as={RiTruckLine} />}>
            Marcar como enviado
          </MenuItem>
        </MenuList>
      </Menu>
    )
  }

  function renderSellerActions(sale) {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          size="sm"
          aria-label="Options"
          icon={<Icon as={RiMenuLine} />}
          variant="outline"
        >
          Actions
        </MenuButton>
        <MenuList>
          <MenuItem
            icon={<Icon as={RiFileCopy2Line} />}
            onClick={() => {
              setSelectedSale(sale)
              onOpen()
            }}
          >
            Enviar Arquivos
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<Icon as={RiCloseLine} />}>Cancelar Pedido</MenuItem>
        </MenuList>
      </Menu>
    )
  }

  return (
    <>
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
                      {/* <Th px={['4', '4', '6']} color="gray.500" width="8">
                        <Checkbox colorScheme="brand" />
                      </Th> */}
                      <Th>Produto</Th>
                      <Th>
                        {user?.roles.includes('supplier')
                          ? 'Cliente'
                          : 'Fornecedor'}
                      </Th>
                      {isWideVersion && <Th>Quantidade</Th>}
                      <Th>Status</Th>
                      <Th width={['6', '6', '8']}></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.sales.map((sale) => (
                      <Tr key={sale.id}>
                        {/* <Td px={['4', '4', '6']}>
                          <Checkbox colorScheme="brand" />
                        </Td> */}
                        <Td>
                          <Box>
                            <Link
                              href={`/listings/${sale.listing.id}`}
                              passHref
                            >
                              <Chakralink
                                onMouseEnter={() => handlePrefetchSale(sale.id)}
                                color="brand.500"
                              >
                                <Text fontSize="sm" fontWeight="bold">
                                  {sale.listing.product.name}
                                </Text>
                              </Chakralink>
                            </Link>
                            <Text fontSize="xs" color="gray.500">
                              ({sale.listing.product.sku})
                            </Text>
                          </Box>
                        </Td>
                        <Td>
                          {user?.roles.includes('supplier')
                            ? sale.account.name
                            : sale.listing.product.account.name}
                        </Td>
                        <Td>{sale.quantity}</Td>
                        <Td>
                          {!sale.receipt ||
                            (!sale.label && (
                              <Badge variant="solid" colorScheme="yellow">
                                Documentos pendentes
                              </Badge>
                            ))}
                          {renderSaleStatus(sale)}
                        </Td>
                        <Td>
                          <Stack direction="row">
                            {user?.roles.includes('supplier')
                              ? renderSupplierActions(sale)
                              : renderSellerActions(sale)}
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
      {user?.roles.includes('supplier') ? (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Download de Arquivos</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <Link href={selectedSale?.receipt_url ?? '#'} passHref>
                  <Button
                    as="a"
                    target="_blank"
                    leftIcon={<Icon as={RiDownloadLine} />}
                    disabled={!selectedSale?.receipt_url}
                    colorScheme="brand"
                  >
                    Comprovante de Pagamento{' '}
                    {!selectedSale?.receipt_url && '(Pendente)'}
                  </Button>
                </Link>
                <Link href={selectedSale?.label_url ?? '#'} passHref>
                  <Button
                    as="a"
                    target="_blank"
                    leftIcon={<Icon as={RiDownloadLine} />}
                    disabled={!selectedSale?.label_url}
                    colorScheme="brand"
                  >
                    Etiqueta {!selectedSale?.label_url && '(Pendente)'}
                  </Button>
                </Link>
                <Link href={selectedSale?.invoice_url ?? '#'} passHref>
                  <Button
                    as="a"
                    target="_blank"
                    leftIcon={<Icon as={RiDownloadLine} />}
                    disabled={!selectedSale?.invoice_url}
                    colorScheme="brand"
                  >
                    Nota Fiscal {!selectedSale?.invoice_url && '(Pendente)'}
                  </Button>
                </Link>
              </Stack>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent
            as="form"
            encType="multipart/form-data"
            onSubmit={handleSubmit(handleFilesFormSubmit)}
          >
            <ModalHeader>Enviar Arquivos</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack>
                <File
                  name="receipt"
                  label="Comprovante de pagamento (PDF)"
                  labelRightElement={
                    <Badge
                      ml="2"
                      variant="solid"
                      colorScheme={
                        selectedSale?.receipt_url ? 'green' : 'yellow'
                      }
                    >
                      {selectedSale?.receipt_url ? 'Enviado' : 'Pendente'}
                    </Badge>
                  }
                  type="file"
                  leftElement={
                    selectedSale?.receipt_url && (
                      <Link href={selectedSale?.receipt_url} passHref>
                        <Button
                          as="a"
                          colorScheme="brand"
                          target="_blank"
                          marginRight="1"
                        >
                          Ver arquivo
                        </Button>
                      </Link>
                    )
                  }
                  error={errors.receipt}
                  {...register('receipt')}
                />

                <File
                  name="label"
                  label="Etiqueta (PDF)"
                  type="file"
                  labelRightElement={
                    <Badge
                      ml="2"
                      variant="solid"
                      colorScheme={selectedSale?.label ? 'green' : 'yellow'}
                    >
                      {selectedSale?.label ? 'Enviado' : 'Pendente'}
                    </Badge>
                  }
                  leftElement={
                    selectedSale?.label_url && (
                      <Link href={selectedSale?.label_url} passHref>
                        <Button
                          as="a"
                          colorScheme="brand"
                          target="_blank"
                          marginRight="1"
                        >
                          Ver arquivo
                        </Button>
                      </Link>
                    )
                  }
                  error={errors.label}
                  {...register('label')}
                />

                <File
                  name="invoice"
                  label="NFe (PDF)"
                  type="file"
                  error={errors.invoice}
                  labelRightElement={
                    selectedSale?.invoice_url && (
                      <Badge ml="2" variant="solid" colorScheme="green">
                        Enviado
                      </Badge>
                    )
                  }
                  leftElement={
                    selectedSale?.invoice_url && (
                      <Link href={selectedSale?.invoice_url} passHref>
                        <Button
                          as="a"
                          target="_blank"
                          colorScheme="brand"
                          marginRight="1"
                        >
                          Ver arquivo
                        </Button>
                      </Link>
                    )
                  }
                  {...register('invoice')}
                />
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                isLoading={formState.isSubmitting}
                type="submit"
                variant="solid"
                colorScheme="brand"
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
