import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'
import {
  Box,
  Button,
  Divider,
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
} from '@chakra-ui/react'

import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import { MouseEventHandler, useState } from 'react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { setupAPIClient } from '@/services/api/api'
import { nextApi } from '@/services/api/nextApi'
import { useIngrations } from '@/services/api/hooks/useIntegrations'
import axios from 'axios'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { RiCheckLine, RiExternalLinkLine, RiSearchLine } from 'react-icons/ri'
import Image from 'next/image'
import { api } from '@/services/api/apiClient'
import { useRouter } from 'next/router'

interface Product {
  name: string
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

export default function SellItem({ product }: SellItemsProps) {
  const router = useRouter()
  const [mercadolivreItem, setMercadoLivreItem] =
    useState<MercadoLivreItem | null>(null)
  const [isSearchingItem, setIsSearchingItem] = useState(false)
  const toast = useToast()
  const mlProductBackgroundColor = useColorModeValue('gray.200', 'gray.800')

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

  return (
    <Layout>
      <Head>
        <title>Vender produto - Outter DS</title>
        <meta
          property="og:title"
          content="Vender produto - Outter DS"
          key="title"
        />
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
            Vender produto{' '}
            <Text as="span" isTruncated fontSize="sm" color="gray.500">
              ({product.name})
            </Text>
          </Heading>
          <Link href="/catalog" passHref>
            <Button as="a" colorScheme="brand">
              Voltar
            </Button>
          </Link>
        </Stack>
        <Divider my="6" borderColor="gray.500" />
        <Input type="hidden" {...register('mercadolivre_account_code')} />

        <VStack spacing="8">
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
                  display="flex"
                  alignItems="center"
                  color="brand.500"
                  target="_blank"
                >
                  Ver anúncio
                  <Icon as={RiExternalLinkLine} mx="1" />
                </ChakraLink>
              </Link>
            </Box>
            <Icon ml="auto" fontSize="4xl" color="green.500" as={RiCheckLine} />
          </Flex>
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
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupAPIClient(ctx)
  const { id } = ctx.params

  const { data: product } = await api.get(`products/${id}`)

  return {
    props: {
      product,
    },
  }
})
