import Layout from '@/components/Layout'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'
import { setupAPIClient } from '@/services/api/api'
import { api } from '@/services/api/apiClient'
import { Supplier, useSuppliers } from '@/services/api/hooks/useSuppliers'
import { useSuppliersAuthorizations } from '@/services/api/hooks/useSuppliersAuthorizations'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'

interface SuppliersPageProps {
  profile: {
    profile: {
      id: string
    }
  } | null
}

export default function SuppliersPage(props: SuppliersPageProps) {
  const [page, setPage] = useState(1)
  const [perPage, SetPerPage] = useState(20)
  const toast = useToast()
  const [authorized, setAuthorized] = useState({})
  const [requested, setRequested] = useState({})
  const { isFetching, isLoading, error, data } = useSuppliers(page, perPage)
  const suppliersAuthorizations = useSuppliersAuthorizations()

  useEffect(() => {
    if (suppliersAuthorizations.data) {
      let authorized = suppliersAuthorizations.data.reduce(
        (acc, supplierAuthorization) => {
          if (supplierAuthorization.authorized) {
            acc[supplierAuthorization.supplier.id] = supplierAuthorization
          }
          return acc
        },
        {}
      )
      setAuthorized(authorized)

      let requested = suppliersAuthorizations.data.reduce(
        (acc, supplierAuthorization) => {
          acc[supplierAuthorization.supplier.id] = supplierAuthorization
          return acc
        },
        {}
      )
      setRequested(requested)
    }
  }, [suppliersAuthorizations.data])

  async function onRequestAuthorization(supplier: Supplier): Promise<void> {
    try {
      const response = await api.post(
        `/suppliers/${supplier.id}/request/authorization`
      )
      toast({
        position: 'top',
        isClosable: false,
        variant: 'solid',
        status: 'success',
        title: 'Acesso solicitado com successo',
      })
      setRequested({ ...requested, [supplier.id]: supplier })
    } catch (err) {
      if (err.response) {
        switch (err.response.data.code) {
          case 'request_authorization:authorization_already_requested':
            toast({
              position: 'top',
              variant: 'solid',
              status: 'error',
              title: 'Solicitação falhou',
              description: 'Você já enviou solicitação para esse fornecedor.',
            })
            break

          default:
            toast({
              position: 'top',
              variant: 'solid',
              status: 'error',
              title: 'Solicitação falhou',
              description: 'A solicitação não pode ser enviada.',
            })
            break
        }
      } else {
        console.error(err)
        toast({
          position: 'top',
          variant: 'solid',
          status: 'error',
          title: 'Falha na Requisição',
          description: 'Houve uma falha desconhecida.',
        })
      }
    }
  }

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
          {supplier.address && (
            <Badge
              colorScheme="brand"
              pos="absolute"
              right={2}
              bottom={2}
              zIndex={2}
            >
              {supplier.address.city} / {supplier.address.state}
            </Badge>
          )}
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
        <Flex
          p={4}
          direction="column"
          justifyContent="space-between"
          height="100%"
        >
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
            {!!authorized[supplier.id] ? (
              <Button
                type="button"
                w="100%"
                mt="auto"
                colorScheme="green"
                disabled
              >
                Aprovado
              </Button>
            ) : (
              <Button
                onClick={() => onRequestAuthorization(supplier)}
                type="button"
                w="100%"
                mt="auto"
                colorScheme="brand"
                disabled={!!requested[supplier.id]}
                isLoading={suppliersAuthorizations.isFetching}
              >
                {!!requested[supplier.id]
                  ? 'Aguardando Aprovação'
                  : 'Solicitar Acesso'}
              </Button>
            )}
          </Stack>
        </Flex>
      </Flex>
    )
  }

  function renderNoSuppliersAlert() {
    return (
      <Alert>
        <AlertDescription display="flex" flexDirection="row">
          <AlertIcon />
          Nenhum dado encontrado.
        </AlertDescription>
      </Alert>
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
            {!props.profile?.profile?.id ? (
              <Alert
                status="warning"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Perfil Incompleto
                </AlertTitle>
                <AlertDescription maxWidth="md">
                  <Text>
                    Por favor preencha completamente seu perfil para ter acesso
                    aos fornecedores. Esse passo é necessário para que o
                    fornecedor possa identificar seus dados e autorizar o acesso
                    ao catalogo de produtos rapidamente
                  </Text>
                  <Link href="/profile" passHref>
                    <Button as="a" mt={4} colorScheme="brand">
                      Ir para Perfil
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            ) : data?.totalCount === 0 ? (
              renderNoSuppliersAlert()
            ) : (
              <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
                {data?.suppliers.map((supplier) => renderSupplier(supplier))}
              </SimpleGrid>
            )}
          </Box>
        </Flex>
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    let profile = null
    try {
      const { data } = await apiClient.get(`/profiles`)
      profile = data
    } catch (error) {}

    // const response = await apiClient.get('users/me');
    return {
      props: {
        cookies: ctx.req.headers.cookie ?? '',
        profile: profile,
      },
    }
  },
  {
    roles: ['seller'],
  }
)
