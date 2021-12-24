import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'
import {
  Box,
  Button,
  Heading,
  InputRightElement,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Image as ChakraImage,
  HStack,
  Flex,
  useToast,
  Link as ChakraLink,
  useColorModeValue,
  Icon,
  UnorderedList,
  ListItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Alert,
  AlertDialogBody,
} from '@chakra-ui/react'

import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import { MouseEventHandler, useEffect, useRef, useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { setupAPIClient } from '@/services/api/api'
import { nextApi } from '@/services/api/nextApi'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import axios from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  RiCheckLine,
  RiCloseLine,
  RiExternalLinkLine,
  RiSearchLine,
} from 'react-icons/ri'
import { api } from '@/services/api/apiClient'
import { useRouter } from 'next/router'
import { GetCatalogResponse, useCatalog } from '@/services/api/hooks/useCatalog'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'

interface Product {
  name: string
  sku: string
  account_id: string
}

interface SellItemsProps {
  product: Product
}

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

interface CreateSellingItemFormData {
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

interface VariationList {
  [key: number]: {
    id: string
    name: string
  } | null
}

export default function SellItem({ product }: SellItemsProps) {
  const router = useRouter()
  const [modalScrollPos, setModalScrollPos] = useState(0)
  const [isVariationsComplete, setIsVariationsComplete] = useState(false)
  const productListingRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<GetCatalogResponse['products']>([])
  const [search, setSearch] = useState<string>()
  const searchBox = useRef<HTMLInputElement>()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [variationModalId, setVariationModalId] = useState<number | null>()
  const [selectedProducts, setSelectedProducts] = useState({})
  const [mercadolivreItem, setMercadoLivreItem] =
    useState<MercadoLivreItem | null>(null)
  const [variationsList, setVariationsList] = useState<VariationList>({})
  const [isSearchingItem, setIsSearchingItem] = useState(false)
  const toast = useToast()
  const mlProductBackgroundColor = useColorModeValue('gray.200', 'gray.800')
  const selectedProductBackgroundColor = useColorModeValue(
    'blue.200',
    'blue.800'
  )

  const {
    data: catalog,
    error: catalogError,
    isLoading: catalogIsLoading,
  } = useCatalog(page, perPage, search, product.account_id)

  const {
    data: integrations,
    error,
    isLoading: isLoadingIntegrations,
  } = useIngrations('mercadolivre')

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
    useForm<CreateSellingItemFormData>({
      resolver: yupResolver(createSellingItem),
      mode: 'onBlur',
    })

  const { errors } = formState

  async function handleSelectProductButtonClick(variationId: number) {
    setVariationModalId(variationId)
    onOpen()
  }

  function handleModalClose() {
    setVariationModalId(null)
    onClose()
  }

  function handleSelectProductModalButtonClick(product: {
    id: string
    name: string
  }) {
    setSelectedProducts({ ...selectedProducts, [product.id]: 1 })
    setVariationsList({
      ...variationsList,
      [variationModalId]: {
        id: product.id,
        name: product.name,
      },
    })
    handleModalClose()
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

  useEffect(() => {
    const newVariationList: VariationList = []

    mercadolivreItem?.variations.map(
      (variation) => (newVariationList[variation.id] = null)
    )

    setVariationsList(newVariationList)
  }, [mercadolivreItem])

  const handleCreateSellingItemSubmit: SubmitHandler<CreateSellingItemFormData> =
    async ({
      mercadolivre_account_code: code,
      mercadolivre_account: integration_id,
    }) => {
      try {
        await api.post('/listings', {
          code,
          integration_id,
          product_id: router.query.id,
        })

        toast({
          status: 'success',
          variant: 'solid',
          position: 'top',
          title: 'Produto cadastrado com sucesso',
        })

        router.push('/listings')
      } catch (error) {
        toast({
          status: 'error',
          variant: 'solid',
          position: 'top',
          title: 'Falha ao cadastrar produto.',
          description: 'Por favor tente novamente.',
        })
      }
    }

  async function handleSearchInputButtonClick() {
    setPerPage(12)
    setModalScrollPos(0)
    setSearch(searchBox.current.value)
  }

  function unSelectVariation(variationId: number) {
    const product = variationsList[variationId]
    setVariationsList({
      ...variationsList,
      [variationId]: null,
    })
    setSelectedProducts({
      ...selectedProducts,
      [product.id]: undefined,
    })
  }

  useEffect(() => {
    if (
      Object.keys(selectedProducts).length >= Object.keys(variationsList).length
    ) {
      setIsVariationsComplete(true)
    } else {
      setIsVariationsComplete(false)
    }
  }, [selectedProducts])

  useEffect(() => {
    if (catalog?.products) {
      setProducts(catalog.products)
    }
    if (productListingRef.current) {
      productListingRef.current.scrollTo({
        top: modalScrollPos,
        behavior: 'smooth',
      })
    }
  }, [catalog])

  return (
    <Layout>
      <Head>
        <title>Vender - Outter DS</title>
        <meta property="og:title" content="Vender - Outter DS" key="title" />
      </Head>
      <Box
        className="panel"
        as="form"
        onSubmit={handleSubmit(handleCreateSellingItemSubmit)}
        flex="1"
        p={['6', '8']}
      >
        <Stack
          mb="8"
          justify="space-between"
          align="center"
          direction={['column', 'column', 'column', 'row']}
        >
          <Heading>
            Vender
            <Text as="span" isTruncated fontSize="sm" color="gray.500" ml="2">
              (Novo vínculo com Marketplace)
            </Text>
          </Heading>
          <Link href="/catalog" passHref>
            <Button as="a" colorScheme="brand">
              Voltar
            </Button>
          </Link>
        </Stack>
        <Input type="hidden" {...register('mercadolivre_account_code')} />

        <VStack spacing="8">
          <Flex
            bgColor={selectedProductBackgroundColor}
            mt="4"
            p="4"
            borderRadius="base"
            direction="column"
            width="100%"
          >
            <Text>
              Produto base selecionado: <Text as="strong">{product.name}</Text>
            </Text>
            <Text>
              Sku do fornecedor: <Text as="strong">{product.sku}</Text>
            </Text>
          </Flex>

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
        </VStack>

        {mercadolivreItem && (
          <Flex
            bgColor={mlProductBackgroundColor}
            mt="4"
            p="4"
            borderRadius="base"
            align="center"
          >
            <ChakraImage
              boxSize="96px"
              borderRadius="base"
              src={mercadolivreItem.secure_thumbnail}
            />
            <Box ml="4">
              <Text fontSize="lg" fontWeight="bold">
                {mercadolivreItem.title}
              </Text>
              <Text>
                {mercadolivreItem.price.toLocaleString('pt-BR', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </Text>
              <Link href={mercadolivreItem.permalink} passHref>
                <ChakraLink
                  display="flex-inline"
                  alignItems="center"
                  color="brand.500"
                  target="_blank"
                >
                  Ver anúncio
                  <Icon as={RiExternalLinkLine} mx="1" />
                </ChakraLink>
              </Link>
            </Box>
            {!!mercadolivreItem.variations.length || isVariationsComplete ? (
              <Text ml="auto" color="brand.500">
                Aguardando preenchimento de variações
              </Text>
            ) : (
              <Icon
                ml="auto"
                fontSize="4xl"
                color="green.500"
                as={RiCheckLine}
              />
            )}
          </Flex>
        )}
        {!!mercadolivreItem?.variations.length && (
          <Stack>
            {mercadolivreItem.variations.map((variation) => (
              <Flex
                bgColor={mlProductBackgroundColor}
                borderLeftColor="brand.500"
                borderLeftWidth="5px"
                mt="4"
                p="4"
                borderRadius="base"
                align="center"
                justify="space-between"
                key={variation.id}
              >
                <Flex direction="column">
                  <Stack spacing="0">
                    <Text>
                      Variação:{' '}
                      <Text as="span" color="brand.500" fontWeight="bold">
                        {variation.id}
                      </Text>
                    </Text>
                    <Text>
                      Preço:{' '}
                      {variation.price.toLocaleString('pt-BR', {
                        currency: 'BRL',
                        style: 'currency',
                      })}
                    </Text>
                    <UnorderedList pl="4">
                      {variation.attribute_combinations.map((attribute) => (
                        <ListItem key={attribute.id}>
                          {attribute.name}: {attribute.value_name}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </Stack>
                </Flex>
                {variationsList[variation.id] ? (
                  <Flex alignItems="center">
                    <Text fontSize="md" color="gray" isTruncated>
                      {variationsList[variation.id].name}
                    </Text>
                    <Icon
                      onClick={() => unSelectVariation(variation.id)}
                      as={RiCloseLine}
                      ml="2"
                      cursor="pointer"
                      color="red"
                      fontSize="2xl"
                    />
                  </Flex>
                ) : (
                  <Button
                    onClick={() => handleSelectProductButtonClick(variation.id)}
                    colorScheme="brand"
                  >
                    Selecionar Produto
                  </Button>
                )}
              </Flex>
            ))}
          </Stack>
        )}
        <Flex mt="8" justify="flex-end">
          <HStack spacing="4">
            <Link href="/catalog" passHref>
              <Button as="a">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              isLoading={formState.isSubmitting}
              isDisabled={!watch('mercadolivre_account_code')}
              colorScheme="brand"
            >
              Salvar
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Modal
        onClose={handleModalClose}
        isOpen={isOpen}
        isCentered
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex direction="column">
              <Text mb="4">
                Selecionar produto para variação "{variationModalId}"
              </Text>
              <Input
                ref={searchBox}
                name="search"
                placeholder="Buscar produto"
                onKeyPress={(e) => {
                  if (e.key == 'Enter') {
                    handleSearchInputButtonClick()
                  }
                }}
                rightElement={
                  <InputRightElement
                    w="auto"
                    children={
                      <Button
                        onClick={() => handleSearchInputButtonClick()}
                        colorScheme="brand"
                        size="lg"
                        isLoading={catalogIsLoading}
                      >
                        <Icon as={RiSearchLine} />
                      </Button>
                    }
                  />
                }
              />
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody ref={productListingRef}>
            <VStack>
              {!products.length && (
                <Alert status="info" justifyContent="center">
                  <AlertDialogBody>
                    Nenhum produto encontrado 😪
                  </AlertDialogBody>
                </Alert>
              )}
              {!catalogError &&
                products.map((product) => (
                  <Flex
                    className="panel"
                    width="100%"
                    key={product.id}
                    alignItems="center"
                    p="2"
                  >
                    {product.images.length ? (
                      <SkeletonImage
                        src={product.images[0].url}
                        boxSize="50px"
                        borderRadius="base"
                      />
                    ) : (
                      <ChakraImage
                        src="/assets/images/default-placeholder.png"
                        boxSize="50px"
                        borderRadius="base"
                      />
                    )}
                    <Box ml="2">
                      <Text title={product.name}>{product.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        SKU fornecedor: {product.sku}
                      </Text>
                    </Box>
                    {selectedProducts[product.id] ? (
                      <Button
                        ml="auto"
                        minWidth="110px"
                        colorScheme="green"
                        isDisabled
                      >
                        Selecionado
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleSelectProductModalButtonClick(product)
                        }
                        ml="auto"
                        minWidth="110px"
                        colorScheme="brand"
                      >
                        Selecionar
                      </Button>
                    )}
                  </Flex>
                ))}
              {catalog?.totalCount > page * perPage && (
                <Button
                  onClick={() => {
                    setModalScrollPos(productListingRef.current.scrollTop)
                    setPerPage(perPage + perPage)
                  }}
                >
                  Mostrar mais
                </Button>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleModalClose}>Fechar</Button>
            <Button colorScheme="brand" ml="2">
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const api = setupAPIClient(ctx)
    const { id } = ctx.params

    const { data: product } = await api.get(`products/${id}`)

    return {
      props: {
        product,
        cookies: ctx.req.headers.cookie ?? '',
      },
    }
  },
  {
    roles: ['seller'],
  }
)
