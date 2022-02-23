import moment from 'moment'
import Layout from '@/components/Layout'
import { Pagination } from '@/components/Pagination'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'
import { ProductFormated, useCatalog } from '@/services/api/hooks/useCatalog'
import {
  Box,
  Flex,
  Heading,
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Icon,
  SimpleGrid,
  Image,
  Badge,
  Spinner,
  Link as ChakraLink,
  Text,
  Kbd,
  InputLeftElement,
  FormLabel,
  Stack,
  InputRightElement,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RiSearchLine, RiStarFill } from 'react-icons/ri'
import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import { useSuppliers } from '@/services/api/hooks/useSuppliers'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { withSSRAuth } from 'utils/withSSRAuth'
import { useSuppliersAuthorizations } from '@/services/api/hooks/useSuppliersAuthorizations'

interface Product {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
  created_at: Date
  updated_at: Date
  supplier: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    is_external: boolean
  }>
}

interface CatalogProps {
  query?: {
    page?: number
    perPage?: number
    search?: string
    supplier?: string
  }
}

export default function Catalog(props: CatalogProps) {
  const router = useRouter()

  const [page, setPage] = useState(props.query.page ?? 1)
  const [hasNoProductsAvailable, setHasNoProductsAvailable] = useState(false)
  const [perPage, setPerPage] = useState(props.query.perPage ?? 20)
  const [search, setSearch] = useState<string>(props.query.search)
  const [supplier, setSupplier] = useState<string>(props.query.supplier)
  const suppliersAuthorizations = useSuppliersAuthorizations()
  const [products, setProducts] = useState<ProductFormated[]>([])

  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    error: errorSuppliers,
  } = useSuppliers()

  const { data, isFetching, isLoading, error } = useCatalog(
    page,
    perPage,
    search,
    supplier
  )

  useEffect(() => {
    if (data) {
      setProducts(data.products)
      if (
        data.products.length === 0 &&
        (page == 1 || !page) &&
        !search &&
        !supplier
      ) {
        setHasNoProductsAvailable(true)
      } else {
        setHasNoProductsAvailable(false)
      }
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...((page > 1 || router.query.page) && { page }),
            ...(search && { search }),
            ...(supplier && { supplier }),
          },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [data])

  function renderProduct(product: Product) {
    return (
      <Flex
        key={product.id}
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
        direction="column"
      >
        {moment(product.created_at).diff(moment(), 'days') < 7 && (
          <Badge
            position="absolute"
            right="5"
            top="5"
            borderRadius="full"
            px="2"
            colorScheme="teal"
          >
            Novo
          </Badge>
        )}
        <Flex w="100%" pb="100%" position="relative" bgColor="white">
          {product.images.length ? (
            <SkeletonImage
              src={product.images[0].url}
              position="absolute"
              width="100%"
              height="100%"
              objectFit="contain"
            />
          ) : (
            <Image
              src="/assets/images/default-placeholder.png"
              position="absolute"
              width="100%"
              height="100%"
              objectFit="cover"
            />
          )}
        </Flex>

        <Flex p={4} direction="column" height="100%">
          <Box display="flex" alignItems="baseline">
            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
            >
              {0} vendas &bull; {product.stock} em estoque
            </Box>
          </Box>
          <Box
            mt="1"
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            // isTruncated
            title={product.name}
          >
            {product.name}
          </Box>
          <Box>
            {product.price}
            <Box as="span" color="gray.600" fontSize="sm">
              / un.
            </Box>
          </Box>
          <Box display="flex" mt="2" alignItems="center">
            {Array(5)
              .fill('')
              .map((_, i) => (
                <Icon
                  as={RiStarFill}
                  key={i}
                  color={i < 0 /*set reviewa*/ ? 'teal.500' : 'gray.300'}
                />
              ))}
            <Box as="span" ml="2" color="gray.600" fontSize="sm">
              {0} reviews
            </Box>
          </Box>
          <Box mt="1" as="h5" isTruncated lineHeight="tight" mb="2">
            <Box as="span" fontSize="sm" color="gray.500">
              Por:
            </Box>
            <Link href={`/supplier/${product.supplier.id}`} passHref>
              <ChakraLink
                ml="1"
                fontSize="sm"
                color="brand.500"
                title={product.supplier.name}
              >
                {product.supplier.name}
              </ChakraLink>
            </Link>
          </Box>
          <Link href={`/catalog/product/${product.id}`} passHref>
            <Button as="a" w="100%" mt="auto" colorScheme="brand">
              Mais detalhes
            </Button>
          </Link>
        </Flex>
      </Flex>
    )
  }

  function renderNoProductsAlert() {
    return (
      <Alert
        status="info"
        variant="subtle"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        flexDirection="column"
      >
        {hasNoProductsAvailable ? (
          <>
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Bem vindo ao Catálogo
            </AlertTitle>
            <AlertDescription maxWidth="md">
              Nenhum produto disponível até o momento. Aguarde até os
              fornecedores aprovarem sua solicitação de acesso. Voce pode velas
              em{' '}
              <Link href="/suppliers" passHref>
                <ChakraLink
                  as="a"
                  fontWeight="bold"
                  textDecor="underline"
                  color={useColorModeValue('brand.500', 'brand.500')}
                >
                  Fornecedores
                </ChakraLink>
              </Link>
            </AlertDescription>
          </>
        ) : (
          <AlertDescription display="flex" flexDirection="row">
            <AlertIcon />
            Nenhum dado encontrado.
          </AlertDescription>
        )}
      </Alert>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Catálogo - Outter DS</title>
        <meta
          property="og:title"
          content="Novo produto - Outter DS"
          key="title"
        />
      </Head>
      <Box className="panel" flex="1" p={['6', '8']}>
        <Stack
          mb="8"
          justify="space-between"
          align="center"
          direction={['column', 'column', 'column', 'row']}
        >
          <Heading size="lg" fontWeight="normal" width="282px">
            Catálogo
            {isFetching && !isLoading && (
              <Spinner color="gray.500" size="sm" ml="4" />
            )}
          </Heading>
          <Box w="100%" pr="6">
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
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                  const { value } = e.target as HTMLInputElement
                  setPage(1)
                  setSearch(value)
                }
              }}
              defaultValue={props.query.search}
              rightElement={
                <InputRightElement
                  pointerEvents="none"
                  mr="4"
                  children={<Kbd>ENTER</Kbd>}
                />
              }
            />
          </Box>

          <Flex align="center">
            <FormLabel mb="0" htmlFor="supplier" id="supplier-label">
              Fornecedor:
            </FormLabel>
            <Select
              name="supplier"
              minWidth="200px"
              placeholder="Todos"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              isDisabled={isLoadingSuppliers}
            >
              {!suppliersAuthorizations.error &&
                !suppliersAuthorizations.isLoading &&
                suppliersAuthorizations.data.map((supplierAuthorization) => {
                  return (
                    <>
                      {supplierAuthorization.authorized && (
                        <option
                          key={supplierAuthorization.supplier.id}
                          value={supplierAuthorization.supplier.id}
                        >
                          {supplierAuthorization.supplier.name}
                        </option>
                      )}
                    </>
                  )
                })}
            </Select>
          </Flex>
        </Stack>
        {isLoading ? (
          <Flex justify="center">
            <Spinner color="brand.500" />
          </Flex>
        ) : error ? (
          <Flex justify="center">
            <Text>Falha ao obter dados.</Text>
          </Flex>
        ) : !products.length ? (
          renderNoProductsAlert()
        ) : (
          <>
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {products.map((product) => renderProduct(product))}
            </SimpleGrid>
            <Pagination
              registersPerPage={perPage}
              totalCountOfRegisters={data.totalCount}
              currentPage={page}
              onPageChange={setPage}
            />
          </>
        )}
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    return {
      props: {
        query: ctx.query,
        cookies: ctx.req.headers.cookie ?? '',
      },
    }
  },
  {
    roles: ['seller'],
  }
)
