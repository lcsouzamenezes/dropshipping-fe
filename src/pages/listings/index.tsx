import { AxiosError } from 'axios'
import { useRef, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Text,
  useBreakpointValue,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Badge,
  useToast,
  Icon,
} from '@chakra-ui/react'

import Layout from '@/components/Layout'
import { Checkbox } from '@/components/Form/Checkbox'
import { useListings } from '@/services/api/hooks/useListings'
import { Pagination } from '@/components/Pagination'
import { api } from '@/services/api/apiClient'
import { queryClient } from '@/services/queryClient'
import { useMutation } from 'react-query'
import Link from 'next/link'
import { RiFileList2Line } from 'react-icons/ri'
import { withSSRAuth } from 'utils/withSSRAuth'

type Listing = {
  id: string
  code: string
  product: {
    name: string
  }
}

export default function ListingsPage() {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const [deletingListing, setDeletingListing] = useState<Listing | null>(null)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  const { isFetching, isLoading, error, data } = useListings(page, perPage)

  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)
  const cancelRef = useRef()

  const deleteListing = useMutation<void, AxiosError>(
    async () => {
      await api.delete(`/listings/${deletingListing.id}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('listings')
      },
    }
  )

  function handleOpenDeleteModal(listing: Listing) {
    setDeletingListing(listing)
    setIsOpen(true)
  }

  async function handleClickDeleteModalButton() {
    try {
      setIsDeleting(true)
      await deleteListing.mutateAsync()

      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Vínculo de anúncio deletado com successo',
      })
    } catch (error) {
      toast({
        status: 'error',
        variant: 'solid',
        position: 'top',
        title: 'Falha ao deletar Vínculo de anúncio',
      })
    } finally {
      setIsOpen(false)
      setDeletingListing(null)
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Produtos Anúnciados
            {isFetching && !isLoading && (
              <Spinner color="gray.500" size="sm" ml="4" />
            )}
          </Heading>
          <Link href="/catalog" passHref>
            <Button
              as="a"
              size="sm"
              fontSize="sm"
              leftIcon={<Icon as={RiFileList2Line} fontSize={20} />}
              colorScheme="brand"
            >
              Ver Catalogo
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
                  <Th>Produto</Th>
                  <Th>Preço</Th>
                  <Th>Integração</Th>
                  {isWideVersion && <Th>Estoque</Th>}
                  <Th width={['6', '6', '8']}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.listings.map((listing) => (
                  <Tr key={listing.id}>
                    <Td px={['4', '4', '6']}>
                      <Checkbox colorScheme="brand" />
                    </Td>
                    <Td>{listing.product.name}</Td>
                    <Td>{listing.product.price}</Td>
                    <Td>
                      <Text isTruncated>{listing.integration.description}</Text>
                    </Td>
                    {isWideVersion && <Td>{listing.product.stock}</Td>}
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleOpenDeleteModal(listing)}
                      >
                        Deletar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {!data.listings.length && (
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

      {deletingListing && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Deletar Vínculo
              </AlertDialogHeader>

              <AlertDialogBody>
                <Alert status="warning" mb="2">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">ATENÇÃO:</Text>
                    <Text>
                      O anúncio deve ser{' '}
                      <Text as="strong">
                        finalizado manualmente no Mercado Livre
                      </Text>
                      , essa exclusão não executara nenhuma alteração no
                      anúncio.
                    </Text>
                  </Box>
                </Alert>
                Tem certeza que deseja deletar o vínculo com o anúncio{' '}
                <Badge colorScheme="green" variant="outline">
                  {deletingListing.code}
                </Badge>{' '}
                do produto{' '}
                <Text as="span" fontWeight="bold" color="brand.500">
                  {deletingListing.product.name}
                </Text>
                ? Essa ação não pode ser desfeita.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setDeletingListing(null)
                    onClose()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleClickDeleteModalButton()}
                  ml={3}
                  isLoading={isDeleting}
                >
                  Deletar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </Layout>
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
    roles: ['seller'],
  }
)