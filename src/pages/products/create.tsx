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
} from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'
import { RiSearchLine } from 'react-icons/ri'
import { SubmitHandler, useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import { withSSRAuth } from 'utils/withSSRAuth'
import { setupAPIClient } from '@/services/api/api'
import { nextApi } from '@/services/api/nextApi'

type CreateProductFormData = {
  bling: string
  sku: string
  ean: string
  name: string
  price: string
  stock: number
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
  images?: Array<{
    link: string
    tipoArmazenamento: 'interno' | 'externo'
  }>
}

export default function CreateProductsPage({
  integrations,
}: CreateProductsPageProps) {
  const [disableFields, setDisableFields] = useState(true)
  const [isLoadingSku, setIsLoadingSku] = useState(false)
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

  const { errors } = formState

  const handleCreateProductSubmit: SubmitHandler<CreateProductFormData> = (
    data
  ) => {
    console.log(data)
  }

  async function handleSearchSKU() {
    setIsLoadingSku(true)

    setValue('ean', '')
    setValue('name', '')
    setValue('price', '0,00')
    setValue('stock', 0)

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

  function handlePriceChange(value: string) {
    console.log('')
    // console.log(
    //   <CurrencyFormat
    //     value={value}
    //     displayType={'text'}
    //     thousandSeparator={true}
    //     prefix={'$'}
    //   />
    // )
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
            Criação de Usuário
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
        <Flex mt="8" justify="flex-end">
          <HStack spacing="4">
            <Link href="/products" passHref>
              <Button as="a">Cancelar</Button>
            </Link>
            <Button type="submit" isLoading={false} colorScheme="brand">
              Salvar
            </Button>
          </HStack>
        </Flex>
      </Box>
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
