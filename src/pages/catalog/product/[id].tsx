import { setupAPIClient } from '@/services/api/api'
import { withSSRAuth } from 'utils/withSSRAuth'
import xss from 'xss'

import Layout from '@/components/Layout'
import Head from 'next/head'
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useToast,
  Link as ChakraLink,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  SimpleGrid,
} from '@chakra-ui/react'
import Link from 'next/link'
import { RiExternalLinkLine, RiStarFill } from 'react-icons/ri'
import { blingApi } from '@/services/bling'
import { SkeletonImage } from '@/components/Skeleton/SkeletonImage'
import { OverButton } from '@/components/OverButton'
import { nextApi } from '@/services/api/nextApi'
import { useState } from 'react'

interface DetailedProductPageProps {
  product: {
    id: string
    name: string
    price: string
    stock: number
  }
  blingProduct: null | {
    descricao: string
    marca: string
    unidade: string
    estoqueAtual: number
    descricaoCurta: string
    descricaoComplementar: string
    urlVideo: string
    linkExterno: string
    pesoLiq: string
    pesoBruto: string
    gtin: string
    larguraProduto: string
    alturaProduto: string
    profundidadeProduto: string
    unidadeMedida: 'Centímetros' | 'Milímetros'
    imagem: Array<{
      link: string
    }>
  }
}

export default function DetailedProductPage({
  product,
  blingProduct,
}: DetailedProductPageProps) {
  const toast = useToast()

  async function downloadImage(url: string) {
    try {
      toast({
        status: 'info',
        variant: 'solid',
        position: 'top',
        title: 'Iniciando download...',
      })
      const { data } = await nextApi.post(
        'image/download',
        {
          url,
        },
        {
          responseType: 'arraybuffer',
        }
      )
      let filename = url.split('/').pop().trim()
      const blob = new Blob([data])
      const urlCreator = window.URL || window.webkitURL
      const imageUrl = urlCreator.createObjectURL(blob)
      const tag = document.createElement('a')
      tag.href = imageUrl
      tag.download = filename
      document.body.appendChild(tag)
      tag.click()
      document.body.removeChild(tag)
    } catch (error) {
      toast({
        status: 'error',
        variant: 'solid',
        position: 'top',
        title: 'Falha ao fazer download da Imagem',
      })
    }
  }

  return (
    <Layout>
      <Head>
        <title>Produto Detalhado - Outter DS - {product.name}</title>
        <meta
          property="og:title"
          content="Produto Detalhado - Outter DS - {product.name}"
          key="title"
        />
      </Head>
      <Box className="panel" flex="1" p={['6', '8']}>
        <Stack
          mb="8"
          justify="space-between"
          align="center"
          direction={['column', 'column', 'column', 'row']}
        >
          <Heading>Produto Detalhado</Heading>
          <Box>
            <Link href="/catalog" passHref>
              <Button as="a" colorScheme="gray">
                Voltar
              </Button>
            </Link>
            <Link href={`/catalog/sell/${product.id}`} passHref>
              <Button as="a" ml="2" colorScheme="brand">
                Vender
              </Button>
            </Link>
          </Box>
        </Stack>
        <Flex justify="space-between" alignItems="center">
          <Stack direction="row">
            <Flex alignItems="center">
              {Array(5)
                .fill('')
                .map((_, i) => {
                  return (
                    <Icon
                      key={i}
                      as={RiStarFill}
                      ml="0.5"
                      color={i < 0 ? 'brand.500' : 'gray.300'}
                    />
                  )
                })}
              <Text as="span" ml="1" color="gray.500">
                0 reviews
              </Text>
            </Flex>
            <Text
              as="span"
              ml="1"
              color="gray.500"
              pl="2"
              borderLeftWidth="1px"
            >
              0 vendas
            </Text>
          </Stack>

          {blingProduct?.linkExterno && (
            <Link href={blingProduct.linkExterno} passHref>
              <ChakraLink
                display="flex"
                target="_blank"
                alignItems="center"
                color="brand.500"
              >
                Link externo <Icon ml="1" as={RiExternalLinkLine} />
              </ChakraLink>
            </Link>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} pt={4} mb={50}>
          <Stack spacing={4}>
            <Heading>{product.name}</Heading>
            <Stack direction="row">
              <Text>
                Estoque: <Text as="strong">{product.stock}</Text>
              </Text>
              {blingProduct && (
                <>
                  <Text>
                    Marca: <Text as="strong">{blingProduct.marca}</Text>
                  </Text>
                  {blingProduct.gtin && (
                    <Text>
                      GTIN: <Text as="strong">{blingProduct.gtin}</Text>
                    </Text>
                  )}
                </>
              )}
            </Stack>
            <Text mt="2" fontSize="lg" fontWeight="semibold">
              {product.price}
            </Text>
            {blingProduct?.descricaoCurta && (
              <Text
                color="gray.500"
                dangerouslySetInnerHTML={{
                  __html: xss(blingProduct.descricaoCurta),
                }}
              />
            )}
            <Accordion mt="4" colorScheme="blue" allowMultiple>
              {blingProduct?.descricaoComplementar && (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Descrição Complementar
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Text
                      color="gray.500"
                      dangerouslySetInnerHTML={{
                        __html: xss(blingProduct.descricaoComplementar),
                      }}
                    />
                  </AccordionPanel>
                </AccordionItem>
              )}
              {!!blingProduct?.imagem.length && (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Imagens
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Stack direction="row">
                      {blingProduct.imagem.map((image) => (
                        <OverButton
                          buttons={
                            <Button
                              onClick={() => downloadImage(image.link)}
                              colorScheme="brand"
                            >
                              Download
                            </Button>
                          }
                          key={image.link}
                        >
                          <SkeletonImage boxSize="200px" src={image.link} />
                        </OverButton>
                      ))}
                    </Stack>
                    <Button mt="2" colorScheme="brand">
                      Download Imagens
                    </Button>
                  </AccordionPanel>
                </AccordionItem>
              )}
              {!!blingProduct?.urlVideo && (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Vídeo
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Stack direction="row">
                      <Link href="{blingProduct.urlVideo}" passHref>
                        <ChakraLink target="_blank" color="brand.500">
                          {blingProduct.urlVideo}
                        </ChakraLink>
                      </Link>
                    </Stack>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </Stack>
        </SimpleGrid>
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth<{
  product: any
  blingProduct: any
}>(async (ctx) => {
  const api = setupAPIClient(ctx)

  const { data: product } = await api.get(`products/${ctx.params.id}`)

  product.price = product.price.toLocaleString('pt-BR', {
    currency: 'BRL',
    style: 'currency',
  })

  const { data: integration } = await api.get(
    `integrations/${product.integration_id}`,
    {
      headers: {
        token: product.account_id,
      },
    }
  )

  const bling = blingApi(integration.access_token)

  let blingProduct = null
  try {
    const {
      data: {
        retorno: { produtos },
      },
    } = await bling.get(`produto/${product.sku}/json`, {
      params: {
        imagem: 'S',
        estoque: 'S',
      },
    })
    const [{ produto: produtoBling }] = produtos
    blingProduct = produtoBling
  } catch (error) {
    console.error(error)
  }

  return {
    props: {
      product,
      blingProduct,
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
