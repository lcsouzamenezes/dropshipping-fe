import Layout from '@/components/Layout'
import { Pagination } from '@/components/Pagination'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'
import { useCatalog } from '@/services/api/hooks/useCatalog'
import {
  Box,
  Divider,
  Flex,
  Heading,
  Alert,
  AlertIcon,
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
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { RiExternalLinkLine, RiStarFill } from 'react-icons/ri'

interface Product {
  id: string
  name: string
  price: string
  stock: number | string
  ean?: string
  sku: string
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

export default function Catalog() {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)

  const { data, isFetching, isLoading, error } = useCatalog(page, perPage)

  function renderProduct(product: Product) {
    return (
      <Box
        key={product.id}
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
      >
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
        {product.images.length ? (
          <SkeletonImage src={product.images[0].url} />
        ) : (
          <Image src="/assets/images/default-placeholder.png" />
        )}
        <Box p="6">
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
            isTruncated
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
          <Box mt="1" as="h5" isTruncated lineHeight="tight">
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
        </Box>
      </Box>
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
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Catálogo
          </Heading>
        </Flex>
        <Divider my="6" borderColor="gray.500" />
        {isLoading ? (
          <Flex justify="center">
            <Spinner color="brand.500" />
          </Flex>
        ) : error ? (
          <Flex justify="center">
            <Text>Falha ao obter dados.</Text>
          </Flex>
        ) : !data.products.length ? (
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Bem vindo ao Catálogo
            </AlertTitle>
            <AlertDescription maxWidth="md">
              Nenhum produto disponível até o momento. Peça autorização para um
              fornecedor para ter acesso aos seus produtos.
              <Link href="/suppliers" passHref>
                <Button
                  as="a"
                  leftIcon={<Icon as={RiExternalLinkLine} />}
                  variant="solid"
                  colorScheme="blue"
                  mt={2}
                >
                  Fornecedores
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {data.products.map((product) => renderProduct(product))}
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
