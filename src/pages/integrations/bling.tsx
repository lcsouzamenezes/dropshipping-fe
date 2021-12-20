import React from 'react'
import Link from 'next/link'
import {
  Flex,
  Box,
  Heading,
  Button,
  SimpleGrid,
  Divider,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Text,
  useToast,
} from '@chakra-ui/react'

import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { withSSRAuth } from '../../utils/withSSRAuth'
import { Input } from '@/components/Form/Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js'
import { nextApi } from '@/services/api/nextApi'
import { api } from '@/services/api/apiClient'
import { useRouter } from 'next/router'
import { useMutation } from 'react-query'
import { queryClient } from '@/services/queryClient'
import Head from 'next/head'

interface CreateBlingFormData {
  name: string
  apiKey: string
}

export default function BlingPage() {
  const toast = useToast()
  const router = useRouter()

  const createBlingFormSchema = Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    apiKey: Yup.string().required('Api Key é obrigatória'),
  })

  const { handleSubmit, register, formState, setError } =
    useForm<CreateBlingFormData>({
      resolver: yupResolver(createBlingFormSchema),
      mode: 'onBlur',
    })

  const { errors } = formState

  const createIntegrations = useMutation(
    async (integration: CreateBlingFormData) => {
      const response = await api.post('integrations/bling', {
        description: integration.name,
        access_token: integration.apiKey,
      })
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('integrations')
      },
    }
  )

  const handleCreateBlingSubmit: SubmitHandler<CreateBlingFormData> = async (
    values
  ) => {
    try {
      await nextApi.post('/bling/verify', {
        apikey: values.apiKey,
      })

      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Conta adicionada com sucesso!',
      })

      createIntegrations.mutateAsync(values)

      router.push('/integrations')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('apiKey', {
          message: 'Api Key inválida, verifique e tente novamente.',
          type: 'manual',
        })
      } else if (err.response?.status === 403) {
        setError('apiKey', {
          message:
            'API Key sem permissões, por favor verifique e tente novamente',
          type: 'manual',
        })
      }
    }
  }

  return (
    <Flex direction="column" h="100vh">
      <Head>
        <title>Nova integração - Bling - Outter DS</title>
        <meta
          property="og:title"
          content="Nova integração - Bling - Outter DS"
          key="title"
        />
      </Head>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box
          className="panel"
          as="form"
          onSubmit={handleSubmit(handleCreateBlingSubmit)}
          flex="1"
          p={['6', '8']}
        >
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Nova Conta Bling
            </Heading>
          </Flex>
          <Divider my="6" borderColor="gray.500" />
          <VStack spacing="8">
            <Alert status="info" borderRadius="md" variant="left-accent">
              <AlertIcon />
              <Text>
                Para garantir atualizações de estoque em tempo real é necessário
                criar um{' '}
                <Text as="span" fontWeight="bold">
                  Callback de Estoque
                </Text>{' '}
                nas configurações do Bling.
              </Text>
            </Alert>
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Input
                label="Nome (Identificador)"
                name="name"
                type="text"
                {...register('name')}
                error={errors.name}
              />
              <Input
                label="Api Key"
                name="apiKey"
                type="text"
                {...register('apiKey')}
                error={errors.apiKey}
              />
            </SimpleGrid>
          </VStack>
          <Flex mt="8" justify="flex-end">
            <HStack spacing="4">
              <Link href="/integrations" passHref>
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
      </Flex>
    </Flex>
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
    roles: ['supplier'],
  }
)
