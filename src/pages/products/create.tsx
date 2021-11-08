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
} from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
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

type CreateProductFormData = {
  bling: string
  sku: string
  ean: string
  name: string
  price: string
  stock: number
  images: Array<{
    url: string
  }>
}

const schema = yup.object({
  bling: yup.string(),
  sku: yup.string().required('SKU obrigatório'),
  ean: yup
    .string()
    .trim()
    .matches(/^\d*$/, 'EAN deve conter apenas números')
    .matches(/^(\d{13})?$/, 'EAN deve conter 13 caracteres'),
  name: yup.string().trim().required('Nome obrigatório'),
  price: yup
    .string()
    .required('Preço obrigatório')
    .matches(/[^0,00]/, 'Valor deve ser maior que R$0,00')
    .matches(/^(\d+)(,\d{0,2})?$/, 'Formato inválido'),
  stock: yup
    .number()
    .required('Estoque obrigatório')
    .typeError('EAN deve conter apenas dígitos'),
  images: yup.array().of(
    yup.object({
      url: yup.string().url('URL inválido'),
    })
  ),
})

type Integration = {
  id: string
  description: string
  access_token: string
}

interface CreateProductsPageProps {
  integrations: Integration[]
}

interface GetBlingProductsResponse {
  descricao: string
  gtin: string
  preco: string
  estoqueAtual: number
  imagem?: Array<{
    link: string
    tipoArmazenamento: 'interno' | 'externo'
  }>
}

export default function CreateProductsPage({
  integrations,
}: CreateProductsPageProps) {
  const maxImages = 6
  const [disableFields, setDisableFields] = useState(true)
  const [isLoadingSku, setIsLoadingSku] = useState(false)
  const [currentImage, SetCurrentImage] = useState<string>(undefined)
  const [loadingModalImage, setLoadingModalImage] = useState(false)

  const router = useRouter()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState,
    control,
    getValues,
    setError,
    setValue,
  } = useForm<CreateProductFormData>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })
  const {
    fields,
    append,
    remove: removeImages,
  } = useFieldArray({
    control,
    name: 'images',
  })
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { errors } = formState

  const handleCreateProductSubmit: SubmitHandler<CreateProductFormData> =
    async ({ name, bling: integration_id, sku, stock, price, ean, images }) => {
      const product = {
        name,
        integration_id,
        sku,
        stock,
        price: parseFloat(price.replace(',', '.')) * 100,
        ean,
        images,
      }

      try {
        await api.post('/products', product)

        toast({
          status: 'success',
          variant: 'solid',
          position: 'top',
          title: 'Produto cadastrado com sucesso',
        })

        router.push('/products')
      } catch (error) {
        if (error.response?.data.code === 'create_product:sku_in_use') {
          toast({
            status: 'error',
            variant: 'solid',
            position: 'top',
            title: 'Falha ao cadastrar produto.',
            description: 'SKU já cadastrado para esta conta Bling.',
          })
        } else {
          toast({
            status: 'error',
            variant: 'solid',
            position: 'top',
            title: 'Falha ao cadastrar produto.',
            description: 'Por favor tente novamente.',
          })
        }
      }
    }

  function resetFields() {
    setValue('ean', '')
    setValue('name', '')
    setValue('price', '0,00')
    setValue('stock', 0)
    removeImages()
    SetCurrentImage(undefined)
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
      <Box
        className="panel"
        as="form"
        onSubmit={handleSubmit(handleCreateProductSubmit)}
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
                  label="Conta Bling"
                  placeholder="Selecione uma conta"
                  onChange={(e) => {
                    resetFields()
                    setValue('sku', '')
                    if (!e.target.value) {
                      setDisableFields(true)
                    } else {
                      setDisableFields(false)
                    }
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
            <Input
              name="sku"
              isDisabled={disableFields}
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

            <Input
              isDisabled={disableFields}
              {...register('ean')}
              error={errors.ean}
              label="EAN"
              name="ean"
              type="text"
            />
          </SimpleGrid>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              isDisabled={disableFields}
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
                    isDisabled={disableFields}
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
              isDisabled={disableFields}
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
                  isDisabled={disableFields}
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
                        disabled={disableFields}
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
                        disabled={disableFields}
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
            disabled={disableFields || getValues('images').length == maxImages}
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
  const api = setupAPIClient(ctx)
  const { data } = await api.get('integrations', {
    params: {
      type: 'bling',
    },
  })

  return {
    props: {
      integrations: data,
    },
  }
})
