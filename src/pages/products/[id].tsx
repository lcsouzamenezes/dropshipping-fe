import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import Layout from '@/components/Layout'
import {
  Box,
  Flex,
  Heading,
  Divider,
  VStack,
  SimpleGrid,
  HStack,
  Button,
  InputLeftElement,
  InputRightElement,
  Icon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Spinner,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import { FormEventHandler, useState } from 'react'
import {
  RiSearchLine,
  RiImageAddLine,
  RiCloseLine,
  RiExternalLinkLine,
} from 'react-icons/ri'
import {
  SubmitHandler,
  useForm,
  Controller,
  useFieldArray,
} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { withSSRAuth } from 'utils/withSSRAuth'
import { setupAPIClient } from '@/services/api/api'
import { nextApi } from '@/services/api/nextApi'
import { api } from '@/services/api/apiClient'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import { queryClient } from '@/services/queryClient'
import { AxiosError } from 'axios'
import {
  productYupSchema,
  CreateProductFormData,
  Integration,
  GetBlingProductsResponse,
} from './create'
import Head from 'next/head'

interface EditPageProps {
  product: {
    id: string
    name: string
    sku: string
    ean: string
    price: number
    stock: number
    integration_id: string
    images: Array<{
      id: string
      url: string
    }>
  }
  integrations: Integration[]
}

interface EditProductFormData extends CreateProductFormData {}

export default function EditPage({ product, integrations }: EditPageProps) {
  const maxImages = 6
  const [isLoadingSku, setIsLoadingSku] = useState(false)
  const [currentImage, SetCurrentImage] = useState<string>(undefined)
  const [loadingModalImage, setLoadingModalImage] = useState(false)

  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const updateProduct = useMutation(
    async ({
      name,
      bling: integration_id,
      sku,
      stock,
      price,
      ean,
      images,
    }: EditProductFormData) => {
      const product = {
        name,
        integration_id,
        sku,
        stock,
        price: parseFloat(price.replace(',', '.')),
        ean,
        images,
      }

      const { id } = router.query

      await api.put(`products/${id}`, product)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products')
      },
    }
  )

  const {
    register,
    handleSubmit,
    formState,
    control,
    getValues,
    setError,
    setValue,
  } = useForm<EditProductFormData>({
    resolver: yupResolver(productYupSchema),
    mode: 'onBlur',
    defaultValues: {
      ...product,
      bling: product.integration_id,
      price: Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        currencyDisplay: 'code',
      })
        .format(product.price)
        .replace('BRL', '')
        .trim(),
    },
  })

  const { errors } = formState

  function resetFields() {
    setValue('ean', '')
    setValue('name', '')
    setValue('price', '0,00')
    setValue('stock', 0)
    removeImages()
    SetCurrentImage(undefined)
  }

  const {
    fields,
    append,
    remove: removeImages,
  } = useFieldArray({
    control,
    name: 'images',
  })

  const handleEditProductSubmit: SubmitHandler<EditProductFormData> = async (
    values
  ) => {
    try {
      await updateProduct.mutateAsync(values)

      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Produto cadastrado com sucesso',
      })

      router.push('/products')
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

  async function handleSearchSKU() {
    setIsLoadingSku(true)

    resetFields()

    try {
      const bling = integrations.find(
        (integration) => integration.id === getValues('bling')
      )

      const { data } = await nextApi.post<GetBlingProductsResponse>(
        'bling/products',
        {
          blingApiKey: bling.access_token,
          sku: getValues('sku'),
        }
      )

      setValue('ean', data.gtin)
      setValue('name', data.descricao)
      setValue('price', parseFloat(data.preco).toFixed(2).replace('.', ','))
      setValue('stock', data.estoqueAtual)

      data.imagem.map((image) => {
        append({ url: image.link })
      })
    } catch (error) {
      if (error.response?.statusText === 'SKU not found') {
        setError('sku', {
          type: 'manual',
          message: 'Nenhum produto encontrado',
        })
      } else {
        toast({
          status: 'error',
          variant: 'solid',
          position: 'top',
          title: 'Houve uma falha ao procurar pelo SKU.',
        })
      }
    } finally {
      setIsLoadingSku(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Editar usuário - Outter DS</title>
        <meta
          property="og:title"
          content="Editar usuário - Outter DS"
          key="title"
        />
      </Head>
      <Box
        className="panel"
        as="form"
        onSubmit={handleSubmit(handleEditProductSubmit)}
        flex="1"
        p={['6', '8']}
      >
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Cadastro de Produto
          </Heading>
        </Flex>
        <Divider my="6" borderColor="gray.500" />
        <VStack spacing="8">
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Controller
              control={control}
              name="bling"
              defaultValue=""
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={true}
                  label="Conta Bling"
                  placeholder="Selecione uma conta"
                  onChange={(e) => {
                    resetFields()
                    setValue('sku', '')
                    field.onChange(e)
                  }}
                >
                  {integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.description}
                    </option>
                  ))}
                </Select>
              )}
            />
            <Box>
              <Input
                name="sku"
                label="SKU"
                type="text"
                error={errors.sku}
                {...register('sku')}
                rightElement={
                  <InputRightElement
                    right="1"
                    top="50%"
                    transform="translatey(-50%)"
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      colorScheme="teal"
                      onClick={handleSearchSKU}
                      isLoading={isLoadingSku}
                    >
                      <Icon as={RiSearchLine} />
                    </Button>
                  </InputRightElement>
                }
              />
              <Text mt="1" fontSize="sm" color="gray.500">
                Certifique-se que o SKU é igual ao do ERP
              </Text>
            </Box>

            <Input
              {...register('ean')}
              error={errors.ean}
              label="EAN"
              name="ean"
              type="text"
            />
          </SimpleGrid>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              label="Nome"
              {...register('name')}
              error={errors.name}
              name="name"
              type="text"
            />

            <Controller
              name="price"
              control={control}
              defaultValue="0,00"
              render={({ field }) => {
                return (
                  <Input
                    {...field}
                    leftElement={
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.500"
                        m="1"
                        children="R$"
                      />
                    }
                    label="Preço"
                    error={errors.price}
                    onChange={(e) => {
                      if (e.target.value) {
                        if (e.target.value.length > 2) {
                          const value = e.target.value.replace(',', '')
                          let formatedValue = (parseFloat(value) / 100).toFixed(
                            2
                          )
                          e.target.value = String(formatedValue).replace(
                            '.',
                            ','
                          )
                        }
                      }
                      field.onChange(e)
                    }}
                  />
                )
              }}
            />

            <Input
              isReadOnly={true}
              label="Quantidade em Estoque"
              name="stock"
              defaultValue={0}
              {...register('stock')}
              error={errors.stock}
              type="text"
            />
          </SimpleGrid>
        </VStack>

        <Flex my="6" justify="space-between" align="center"></Flex>
        <VStack spacing="8">
          {fields.map((item, index) => {
            return (
              <Flex key={item.id} width="100%">
                <Input
                  label="URL da imagem"
                  defaultValue=""
                  {...register(`images.${index}.url`)}
                  error={errors.images ? errors.images[index]?.url : undefined}
                  name={`images.${index}.url`}
                  type="text"
                  pr="12rem"
                  rightElement={
                    <InputRightElement width="12rem" height="100%">
                      <Button
                        mx="1"
                        variant="ghost"
                        color="gray"
                        onClick={() => {
                          setLoadingModalImage(true)
                          SetCurrentImage(getValues(`images.${index}.url`))
                          onOpen()
                        }}
                      >
                        <Icon as={RiExternalLinkLine} fontSize="20" />
                      </Button>
                      <Button
                        leftIcon={<Icon as={RiCloseLine} fontSize="20" />}
                        mx="1"
                        colorScheme="red"
                        onClick={() => removeImages(index)}
                      >
                        Remover
                      </Button>
                    </InputRightElement>
                  }
                />
              </Flex>
            )
          })}
          <Button
            disabled={getValues('images').length == maxImages}
            alignSelf="flex-start"
            colorScheme="green"
            leftIcon={<Icon as={RiImageAddLine} fontSize={20} />}
            onClick={() => {
              append({ url: '' })
            }}
          >
            Adicionar Imagem
          </Button>
        </VStack>
        <Flex mt="8" justify="flex-end">
          <HStack spacing="4">
            <Link href="/products" passHref>
              <Button as="a">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              isLoading={formState.isSubmitting}
              colorScheme="brand"
            >
              Salvar
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pt="12" justify="center" align="center">
            {loadingModalImage && <Spinner m="8" color="brand.500" />}
            {currentImage && (
              <Image
                src={currentImage}
                onLoad={() => setLoadingModalImage(false)}
                loading="eager"
                onError={() => {
                  onClose()
                  toast({
                    status: 'error',
                    description:
                      'Falha ao carregar imagem. Verifique o URL e tente novamente.',
                  })
                }}
              />
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const { id } = ctx.params
  const api = setupAPIClient(ctx)
  const { data: product } = await api.get(`products/${id}`)
  const { data: integrations } = await api.get('integrations', {
    params: {
      type: 'bling',
    },
  })

  return {
    props: {
      product,
      integrations,
    },
  }
})
