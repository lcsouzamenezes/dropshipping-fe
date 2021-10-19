import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Flex,
  Box,
  Heading,
  Alert,
  AlertIcon,
  Button,
  useToast,
} from '@chakra-ui/react'

import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { withSSRAuth } from '../../utils/withSSRAuth'
import meliConfig from '@/config/mercadolivre'
import { nextApi } from '../../services/api/nextApi'
import { setupAPIClient } from '@/services/api/api'
import { AuthorizationResponse } from 'pages/api/mercadolivre/authorize'

interface MercadolivrePageProps {
  success: boolean
  errors: string[]
}

export default function MercadolivrePage({
  errors,
  success,
}: MercadolivrePageProps) {
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (errors.length) {
      errors.forEach((error) => {
        toast({
          status: 'error',
          position: 'top',
          title: error,
        })
      })
      router.replace('/integrations/mercadolivre', undefined, { shallow: true })
    } else if (success) {
      toast({
        status: 'success',
        position: 'top',
        title: 'Conta adicionada com sucesso!',
      })

      router.push('/integrations')
    }
  }, [])

  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Nova Integração - Mercado Livre
            </Heading>
          </Flex>
          <Box>
            <Alert mb="6" status="info" borderRadius="md">
              <AlertIcon />
              Certifique-se de estar autenticado na conta que deseja adicionar
              antes de clicar em Adicionar.
            </Alert>
            <Link
              href={`${meliConfig.authURL}&client_id=${process.env.NEXT_PUBLIC_ML_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_HOST}/integrations/mercadolivre`}
              passHref
            >
              <Button as="a" colorScheme="brand">
                Autorizar
              </Button>
            </Link>
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const errors = []
  let success = false
  const { code } = ctx.query

  if (code) {
    try {
      const authorizationResponse = await nextApi.post<AuthorizationResponse>(
        '/mercadolivre/authorize',
        {
          code,
        }
      )
      const { description, access_token, expires_in, user_id, refresh_token } =
        authorizationResponse.data
      const api = setupAPIClient(ctx)

      await api.post('integrations/mercadolivre', {
        description,
        access_token,
        refresh_token,
        expires_at: expires_in,
        user_id,
      })

      success = true
    } catch (error) {
      if (error.response.data.error === 'invalid_grant') {
        errors.push('Codigo inválido ou expirado.')
      } else if (error.response.data.error === 'invalid_operator_user_id') {
        errors.push('Usuário Mercado Livre não tem permissão para autorizar.')
      } else {
        console.error(error.toJSON())
        errors.push('Houve uma falha na autenticação.')
      }
    }
  }

  return {
    props: {
      success,
      errors,
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
