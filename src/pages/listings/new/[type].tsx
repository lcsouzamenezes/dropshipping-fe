import { Checkbox } from '@/components/Form/Checkbox'
import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import Layout from '@/components/Layout'
import { ProductFormated, useCatalog } from '@/services/api/hooks/useCatalog'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import { useSuppliers } from '@/services/api/hooks/useSuppliers'
import { nextApi } from '@/services/api/nextApi'
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
  InputRightElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import _ from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { MouseEventHandler, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  RiArrowLeftCircleLine,
  RiArrowRightCircleLine,
  RiSearchLine,
} from 'react-icons/ri'
import { withSSRAuth } from 'utils/withSSRAuth'
import * as yup from 'yup'

interface MercadoLivreItem {
  id: string
  title: string
  price: number
  secure_thumbnail: string
  permalink: string
  variations: Array<{
    id: number
    price: number
    attribute_combinations: Array<{
      id: string
      name: string
      value_name: string
    }>
  }>
}
interface CreateComboSellingItemFormData {
  mercadolivre_account: string
  mercadolivre_item_url: string
  mercadolivre_account_code: string
}

interface getItemAPIInterface {
  status: boolean
  item?: MercadoLivreItem
  message?: string
  code: string
}

export default function NewPage() {
  const typeMap = {
    compose: 'Combo',
    simple: 'Simples',
  }

  const router = useRouter()
  const toast = useToast()
  const type = router.query.type as string
  const {
    data: suppliersData,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useSuppliers()
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [isSearchingItem, setIsSearchingItem] = useState(false)

  const [selectedProcuts, setSelectedProducts] = useState({})
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [canCreate, setCanCreate] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [mercadolivreItem, setMercadoLivreItem] =
    useState<MercadoLivreItem | null>(null)

  const createSellingItem = yup.object({
    mercadolivre_account: yup
      .string()
      .required('Conta do MercadoLivre obrigatória'),
    mercadolivre_item_url: yup
      .string()
      .required('URL do anúncio obrigatório')
      .url('URL inválida'),
    mercadolivre_account_code: yup.string(),
  })

  const { getValues, setValue, register, watch, handleSubmit, formState } =
    useForm<CreateComboSellingItemFormData>({
      resolver: yupResolver(createSellingItem),
      mode: 'onBlur',
    })

  const { errors } = formState

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

  const {
    data: integrations,
    error,
    isLoading: isLoadingIntegrations,
  } = useIngrations('mercadolivre')

  useEffect(() => {
    updateSearch(searchInput)
  }, [searchInput])

  useEffect(() => {
    if (catalogData?.totalCount) {
      setTotalPages(Math.ceil(catalogData.totalCount / perPage))
    }
  }, [catalogData])

  useEffect(() => {
    setSelectedCount(
      Object.values(selectedProcuts).filter(
        (selectedProcuts) => selectedProcuts
      ).length
    )
  }, [selectedProcuts])

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

  const handleSearchButtonClick: MouseEventHandler<HTMLButtonElement> =
    async () => {
      setIsSearchingItem(true)
      setValue('mercadolivre_account_code', undefined)
      try {
        const listingUrl = getValues('mercadolivre_item_url')
        const {
          groups: { code },
        } = /MLB-?(?<code>\d+)/.exec(listingUrl)
        if (!code) {
          throw new Error(
            'Falha ao encontrar anúncio. Por favor verifique o url'
          )
        }
        const mercadoLivreId = getValues('mercadolivre_account')
        const { data } = await nextApi.post<getItemAPIInterface>(
          `mercadolivre/api/items/${code}`,
          {
            mercadoLivreId,
          }
        )
        setMercadoLivreItem(data.item)
        setValue('mercadolivre_account_code', data.item.id)
      } catch (error) {
        let description: string
        if (axios.isAxiosError(error)) {
          switch (error.response.data.code) {
            case 'item:invalid_account':
              description = 'Item não pertence a conta selecionada.'
              break
            case 'ml_response:item_not_found':
              description =
                'Não foi possível encontrar esse anúncio. Por favor verifique o URL fornecido.'
              break
            default:
              description = error.response.data.message
              break
          }
        } else {
          description =
            'Falha ao carregar imagem. Verifique o URL e tente novamente.'
        }
        toast({
          status: 'error',
          description,
        })
      } finally {
        setIsSearchingItem(false)
      }
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
              isDisabled={selectedCount < 2}
              onClick={() => {}}
              size="md"
              fontSize="sm"
              colorScheme="brand"
            >
              Criar
            </Button>
          </Stack>
        </Flex>
        <Stack>
          <Stack>
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Select
                {...register('mercadolivre_account')}
                label="Conta MercadoLivre"
                placeholder="Selecione uma conta"
                error={errors.mercadolivre_account}
              >
                {!isLoadingIntegrations &&
                  integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name}
                    </option>
                  ))}
              </Select>
              <Input
                {...register('mercadolivre_item_url')}
                label="URL do seu Anúncio"
                type="text"
                isDisabled={!watch('mercadolivre_account')}
                error={errors.mercadolivre_item_url}
                rightElement={
                  <InputRightElement top="50%" transform="translatey(-50%)">
                    <Button
                      variant="solid"
                      size="lg"
                      isDisabled={!watch('mercadolivre_account')}
                      colorScheme="brand"
                      onClick={handleSearchButtonClick}
                      isLoading={isSearchingItem}
                    >
                      <Icon as={RiSearchLine} />
                    </Button>
                  </InputRightElement>
                }
              />
            </SimpleGrid>

            <FormLabel
              display="flex"
              alignItems="center"
              htmlFor="supplier"
              id="supplier-label"
            >
              Fornecedor
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
          </Stack>
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
