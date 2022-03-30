import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import Layout from '@/components/Layout'
import {
  getCatalog,
  ProductFormated,
  useCatalog,
} from '@/services/api/hooks/useCatalog'
import { Supplier, useSuppliers } from '@/services/api/hooks/useSuppliers'
import {
  Box,
  Flex,
  FormLabel,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'

export default function NewPage() {
  const typeMap = {
    compose: 'Combo',
    simple: 'Simples',
  }

  const router = useRouter()
  const type = router.query.type as string
  const { data, isLoading, error } = useSuppliers()
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [products, setProducts] = useState<ProductFormated[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setProducts([])
    if (!!selectedSupplier) {
      const fetchCatalog = async () => {
        const { products, totalCount } = await getCatalog(
          page,
          100,
          search,
          selectedSupplier
        )
        setProducts(products)
      }
      fetchCatalog().catch((err) => console.log(err))
    }
  }, [selectedSupplier])

  function renderProduct(product: ProductFormated) {
    return (
      <Stack key={product.id} direction="row" spacing="5" width="full">
        <Image
          rounded="lg"
          width="120px"
          height="120px"
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
        <Box pt="4">
          <Stack spacing="0.5">
            <Text fontWeight="medium">{product.name}</Text>
            <Text color={mode('gray.600', 'gray.400')} fontSize="sm">
              {product.sku}
            </Text>
          </Stack>
        </Box>
      </Stack>
    )
  }

  function renderProductsList() {
    return <Stack>{products.map((product) => renderProduct(product))}</Stack>
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
                hidden={!isLoading}
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
              isDisabled={isLoading}
            >
              {!isLoading &&
                !error &&
                data.suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
            </Select>
          </Box>
          <Box>{renderProductsList()}</Box>
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
