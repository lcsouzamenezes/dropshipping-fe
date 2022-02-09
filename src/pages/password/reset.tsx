import {
  Flex,
  Text,
  Stack,
  Button,
  Icon,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js'
import * as yup from 'yup'
import { Input } from '../../components/Form/Input'
import { api } from '../../services/api/apiClient'

import { withSSRGuest } from '../../utils/withSSRGuest'
import Head from 'next/head'
import Router, { useRouter } from 'next/router'

interface PasswordRecoveryFormData {
  password: string
  password_confirmation: string
}

const resetFormSchema = yup.object({
  password: yup
    .string()
    .required('Senha obrigatória')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      'A Senha deve conter pelo menos um caractere Minúsculo, um Maiúsculo, um Número e um Especial'
    ),
  password_confirmation: yup
    .string()
    .required('Confirmação de Senha obrigatória')
    .oneOf([yup.ref('password')], 'Senha não confere'),
})

export default function PasswordResetPage() {
  const { handleSubmit, register, formState } =
    useForm<PasswordRecoveryFormData>({
      resolver: yupResolver(resetFormSchema),
      mode: 'onBlur',
    })
  const toast = useToast()
  const router = useRouter()
  const { token, id } = router.query
  const { errors, isSubmitting } = formState

  const handlePasswordRecovery: SubmitHandler<PasswordRecoveryFormData> =
    async (values) => {
      try {
        const data = { password: values.password, token, user_id: id }

        await api.post('/users/reset-password/update', data)

        toast({
          position: 'top',
          isClosable: false,
          variant: 'solid',
          status: 'success',
          title: 'Senha resetada com successo',
        })

        Router.push('/')
      } catch (error) {
        if (
          error.response?.data.code === 'recovery_password_token.not_found' ||
          error.response?.data.code === 'recovery_password_token.expired'
        ) {
          toast({
            position: 'top',
            variant: 'solid',
            status: 'error',
            title: 'Token Inválido ou Expirado',
            description: 'Por favor recupere a senha novamente.',
          })
        } else {
          toast({
            position: 'top',
            variant: 'solid',
            title: 'Houve uma falha na requisição, por favor tente novamente.',
            status: 'error',
          })
        }
      }
    }

  return (
    <Flex
      minHeight="100vh"
      direction="column"
      align="center"
      justify="center"
      pt="6"
      pb="6"
    >
      <Head>
        <title>Recuperação Senha - Outter DS</title>
        <meta
          property="og:title"
          content="Recuperação Senha - Outter DS"
          key="title"
        />
      </Head>
      <Text
        fontSize={['md', '3xl']}
        fontWeight="bold"
        letterSpacing="tight"
        mb="4"
      >
        Recuperação Senha
      </Text>
      <Flex
        as="form"
        width="100%"
        maxWidth={420}
        onSubmit={handleSubmit(handlePasswordRecovery)}
        p="8"
        flexDirection="column"
        className="panel"
      >
        <Stack spacing="4">
          <Input
            label="Senha"
            name="password"
            type="password"
            error={errors.password}
            {...register('password')}
          />
          <Input
            label="Confirmação de Senha"
            name="password_confirmation"
            type="password"
            error={errors.password_confirmation}
            {...register('password_confirmation')}
          />
        </Stack>
        <Button
          isLoading={isSubmitting}
          colorScheme="brand"
          type="submit"
          size="lg"
          mt="6"
          mb="6"
        >
          Enviar
        </Button>
        <Link href="/" passHref>
          <ChakraLink m="0 auto">Voltar para Login</ChakraLink>
        </Link>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
