import { Checkbox } from '@/components/Form/Checkbox'
import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import Layout from '@/components/Layout'
import { ProductFormated, useCatalog } from '@/services/api/hooks/useCatalog'
import { Supplier, useSuppliers } from '@/services/api/hooks/useSuppliers'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Image,
  InputLeftElement,
  Spinner,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react'
import _ from 'lodash'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import {
  RiArrowLeftCircleLine,
  RiArrowRightCircleLine,
  RiSearchLine,
} from 'react-icons/ri'
import { withSSRAuth } from 'utils/withSSRAuth'

export default function NewPage() {
  const typeMap = {
    compose: 'Combo',
    simple: 'Simples',
  }

  const router = useRouter()
  const type = router.query.type as string
  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useSuppliers()
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedProcuts, setSelectedProducts] = useState({})
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const updateSearch = useCallback(
    _.debounce((searchInput) => {
      setPage(1)
      setSearch(searchInput)
    }, 300),
    []
  )

  const {
    data: catalogData,
    isLoading: isLoadingCatalogSuppliers,
    error: catalogError,
  } = useCatalog(page, perPage, search, selectedSupplier)

  useEffect(() => {
    updateSearch(searchInput)
  }, [searchInput])

  useEffect(() => {
    if (catalogData?.totalCount) {
      setTotalPages(Math.ceil(catalogData.totalCount / perPage))
    }
  }, [catalogData])

  const renderProduct = (product: ProductFormated) => {
    return (
      <Stack key={product.id} direction="row" spacing="5" width="full">
        <Flex
          _hover={{ borderColor: 'brand.500' }}
          width="full"
          border="2px"
          borderColor="transparent"
          rounded="md"
          p={2}
        >
          <Checkbox
            isChecked={selectedProcuts[product.id] || false}
            onChange={() =>
              setSelectedProducts({
                ...selectedProcuts,
                ...{ [product.id]: !selectedProcuts[product.id] },
              })
            }
            colorScheme="brand"
            name="product[]"
            value={product.id}
          >
            <Flex alignItems="center">
              <Image
                rounded="lg"
                width="100px"
                height="100px"
                fit="cover"
                src={
                  product.images[0]
                    ? product.images[0].url
                    : '/assets/images/default-placeholder.png'
                }
                fallbackSrc="/assets/images/default-placeholder.png"
                alt={product.name}
                draggable="false"
                loading="lazy"
              />
              <Box pt="4" ml="2">
                <Stack spacing="0.5">
                  <Text fontWeight="medium">{product.name}</Text>
                  <Text fontSize="sm">{product.sku}</Text>
                </Stack>
              </Box>
            </Flex>
          </Checkbox>
        </Flex>
      </Stack>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Novo Anúncios - Outter DS</title>
        <meta
          property="og:title"
          content="Novo Anúncios - Outter DS"
          key="title"
        />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Criar novo anúncio "{typeMap[type]}"
          </Heading>
          <Stack direction="row">
            <Button
              onClick={() => {}}
              size="sm"
              fontSize="sm"
              colorScheme="brand"
            >
              Criar
            </Button>
          </Stack>
        </Flex>
        <Stack>
          <Box>
            <FormLabel
              display="flex"
              alignItems="center"
              htmlFor="supplier"
              id="supplier-label"
            >
              Fornecedor{' '}
              <Spinner
                hidden={!isLoadingSuppliers}
                marginLeft="1"
                size="sm"
                color="brand.500"
              />
            </FormLabel>
            <Select
              placeholder="Selecione um fornecedor"
              name="supplier"
              onChange={(e) => setSelectedSupplier(e.target.value)}
              value={selectedSupplier}
              isDisabled={isLoadingSuppliers}
            >
              {!isLoadingSuppliers &&
                !suppliersError &&
                suppliersData.suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </Select>
          </Box>
          {!!selectedSupplier && (
            <Stack>
              <Input
                leftElement={
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.500"
                    children={<Icon as={RiSearchLine} />}
                  />
                }
                name="search"
                placeholder="Buscar produto"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              {isLoadingCatalogSuppliers ? (
                <Flex justify="center" p={4}>
                  <Spinner size="md" color="brand.500" />
                </Flex>
              ) : catalogError ? (
                <Alert status="error">
                  <AlertIcon />
                  Falha ao obter dados
                </Alert>
              ) : catalogData && !catalogData.products.length ? (
                <Alert status="info">
                  <AlertIcon />
                  Nenhum produto encontrado
                </Alert>
              ) : (
                <Stack>
                  {catalogData.products.map((product) =>
                    renderProduct(product)
                  )}
                  {totalPages > 1 && (
                    <Flex justifyContent="space-between">
                      <Button
                        isDisabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        variant="ghost"
                        rounded="full"
                        colorScheme="brand"
                      >
                        <Icon mr={1} fontSize={24} as={RiArrowLeftCircleLine} />
                        Anterior
                      </Button>
                      <Flex alignItems="center">
                        {page}/{totalPages}
                      </Flex>
                      <Button
                        onClick={() => setPage(page + 1)}
                        isDisabled={page >= totalPages}
                        variant="ghost"
                        rounded="full"
                        colorScheme="brand"
                      >
                        Próxima
                        <Icon
                          ml={1}
                          fontSize={24}
                          as={RiArrowRightCircleLine}
                        />
                      </Button>
                    </Flex>
                  )}
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </Box>
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
