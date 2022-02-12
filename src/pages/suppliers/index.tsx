import Layout from '@/components/Layout'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'
import { Supplier, useSuppliers } from '@/services/api/hooks/useSuppliers'
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  Image,
  WrapItem,
  Avatar,
  SimpleGrid,
  Button,
  Stack,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'

export default function SuppliersPage() {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)
  const { isFetching, isLoading, error, data } = useSuppliers(page, perPage)

  function renderSupplier(supplier: Supplier) {
    return (
      <Flex
        key={supplier.id}
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        position="relative"
        direction="column"
      >
        <Flex w="100%" pb="100%" position="relative" bgColor="white">
          {supplier.logo ? (
            <SkeletonImage
              src={supplier.logo}
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
          <Box
            fontWeight="semibold"
            as="h4"
            lineHeight="tight"
            textAlign="center"
            // isTruncated
            title={supplier.name}
            mb="2"
          >
            {supplier.name}
          </Box>
          <Stack>
            <Link href={`/supplier/${supplier.id}/request-access`} passHref>
              <Button as="a" w="100%" mt="auto" disabled colorScheme="brand">
                Solicitar Acesso
              </Button>
            </Link>
            <Link href={`/supplier/${supplier.id}/products`} passHref>
              <Button as="a" w="100%" mt="auto" disabled colorScheme="gray">
                Ver Produtos
              </Button>
            </Link>
          </Stack>
        </Flex>
      </Flex>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Fornecedores - Outter DS</title>
        <meta
          property="og:title"
          content="Fornecedores - Outter DS"
          key="title"
        />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal" width="260px">
            Fornecedores
            {isFetching && !isLoading && (
              <Spinner color="gray.500" size="sm" ml="4" />
            )}
          </Heading>
        </Flex>
        <Flex align="center">
          <Box className="panel" flex="1" p={['6', '8']}>
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
              {data?.suppliers.map((supplier) => renderSupplier(supplier))}
            </SimpleGrid>
          </Box>
        </Flex>
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
