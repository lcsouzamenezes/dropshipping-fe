import Layout from '@/components/Layout'
import Head from 'next/head'
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link as Chakralink,
  List,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import {
  SupplierAuthorizations,
  useSuppliersAuthorizations,
} from '@/services/api/hooks/useSuppliersAuthorizations'
import { useState } from 'react'
import Link from 'next/link'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { api } from '@/services/api/apiClient'
import { queryClient } from '@/services/queryClient'
import { useMutation } from 'react-query'
import { AxiosError } from 'axios'

export default function SellersPage() {
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [isOpenAuthorize, setIsOpenAuthorize] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isOpenDetails, setIsOpenDetails] = useState(false)

  const [selectedSupplierAuthorization, setSelectedSupplierAuthorization] =
    useState<null | SupplierAuthorizations>(null)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  const { data, isFetching, isLoading, error } =
    useSuppliersAuthorizations(page)

  const approveAuthentication = useMutation<void, AxiosError, { id: string }>(
    async (variables) => {
      await api.patch(
        `/accounts/${variables.id}/request/update-authorization`,
        {
          authorized: true,
        }
      )
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('suppliersAuthorizations')
      },
    }
  )

  async function approve(id: string) {
    try {
      setIsApproving(true)

      await approveAuthentication.mutateAsync({ id })

      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Requisição aprovada com successo',
      })
    } catch (err) {
      toast({
        status: 'error',
        variant: 'solid',
        position: 'top',
        title: 'Houve uma falha inesperada',
      })
    } finally {
      setIsApproving(false)
    }
  }

  async function handleMenuApproveClick(
    supplierAuthorization: SupplierAuthorizations
  ) {
    await approve(supplierAuthorization.id)
  }

  async function handleApproveClick() {
    await approve(selectedSupplierAuthorization.id)
    handleCloseModal()
  }

  function handleSeeDetailsClick(
    supplierAuthorization: SupplierAuthorizations
  ) {
    setSelectedSupplierAuthorization(supplierAuthorization)
    setIsOpenDetails(true)
  }

  function handleCloseModal() {
    setIsOpenDetails(false)
    setSelectedSupplierAuthorization(null)
  }

  function DetailModal() {
    return (
      <Modal isOpen={isOpenDetails} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>Detalhes da Solicitação</Text>
            <Text
              fontSize="xs"
              fontStyle="italic"
              fontWeight="medium"
              color="gray.500"
            >
              Solicitado em: {selectedSupplierAuthorization.created_at}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                <Text
                  fontSize={{ base: '16px', lg: '18px' }}
                  color={useColorModeValue('brand.500', 'brand.300')}
                  fontWeight={'500'}
                >
                  Dados
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Nome:
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.profile.name}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      {selectedSupplierAuthorization.account.profile.is_company
                        ? 'CNPJ'
                        : 'CPF'}
                      :
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.profile.is_company
                      ? selectedSupplierAuthorization.account.profile.document_number.replace(
                          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                          '$1.$2.$3/$4-$5'
                        )
                      : selectedSupplierAuthorization.account.profile.document_number.replace(
                          /^(\d{3})(\d{3})(\d{3})(\d{2})/,
                          '$1.$2.$3-$4'
                        )}
                  </ListItem>
                </List>
              </Box>
              <Box>
                <Text
                  fontSize={{ base: '16px', lg: '18px' }}
                  color={useColorModeValue('brand.500', 'brand.300')}
                  fontWeight={'500'}
                >
                  Contato
                </Text>
                <List spacing={2}>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Nome:
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.user.name}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      E-mail:
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.user.email}
                  </ListItem>
                </List>
              </Box>
              <Box>
                <Text
                  fontSize={{ base: '16px', lg: '18px' }}
                  color={useColorModeValue('brand.500', 'brand.300')}
                  fontWeight={'500'}
                >
                  Endereço
                </Text>

                <List spacing={2}>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Endereço:
                    </Text>{' '}
                    {
                      selectedSupplierAuthorization.account.profile.address
                        .address
                    }
                    ,{' '}
                    {
                      selectedSupplierAuthorization.account.profile.address
                        .number
                    }{' '}
                    {
                      selectedSupplierAuthorization.account.profile.address
                        .address_2
                    }
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Cep:
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.profile.address.zip}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Cidade / Estado:
                    </Text>{' '}
                    {selectedSupplierAuthorization.account.profile.address.city}{' '}
                    /{' '}
                    {
                      selectedSupplierAuthorization.account.profile.address
                        .state
                    }
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Fechar
            </Button>
            {!selectedSupplierAuthorization.authorized && (
              <Button
                isLoading={isApproving}
                variant="solid"
                colorScheme="brand"
                onClick={handleApproveClick}
                mr={3}
              >
                Aprovar
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  function PopupModal() {
    if (isOpenDetails) return <DetailModal />
    return null
  }

  return (
    <Layout>
      <Head>
        <title>Vendedores - Outter DS</title>
        <meta
          property="og:title"
          content="Vendedores - Outter DS"
          key="title"
        />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal" width="260px">
            Vendedores
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
                  <Th>Usuário</Th>
                  <Th>Status</Th>
                  {isWideVersion && <Th>Data de cadastro</Th>}
                  <Th width={['6', '6', '8']}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((seller) => (
                  <Tr key={seller.id}>
                    <Td>
                      <Box>
                        <Text fontWeight="bold">{seller.account.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {seller.account.user.email}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      {seller.authorized ? (
                        <Badge colorScheme="green">Autorizado</Badge>
                      ) : (
                        <Badge colorScheme="red">Não Autorizado</Badge>
                      )}
                    </Td>
                    {isWideVersion && <Td>{seller.created_at}</Td>}
                    <Td>
                      <Menu>
                        <MenuButton
                          as={Button}
                          rightIcon={<Icon as={RiArrowDropDownLine} />}
                        >
                          Ações
                        </MenuButton>
                        <MenuList>
                          {!seller.authorized && (
                            <MenuItem
                              onClick={() => handleMenuApproveClick(seller)}
                            >
                              Aprovar
                            </MenuItem>
                          )}
                          <MenuItem
                            onClick={() => handleSeeDetailsClick(seller)}
                          >
                            Ver detalhes
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </>
        )}
        {/* <Flex align="center">
          <Box className="panel" flex="1" p={['6', '8']}>
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {data?.map((authRequest) => authRequest.id)}
            </SimpleGrid>
          </Box>
        </Flex> */}
      </Box>
      <PopupModal />
    </Layout>
  )
}
