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
import Router from 'next/router'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js'
import * as yup from 'yup'
import { Input } from '../../components/Form/Input'
import { api } from '../../services/api/apiClient'

import { withSSRGuest } from '../../utils/withSSRGuest'
import Head from 'next/head'

interface PasswordRecoveryFormData {
  email: string
}

const recoveryPasswordFormSchema = yup.object({
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
})

export default function PasswordRecoveryPage() {
  const { handleSubmit, register, formState } =
    useForm<PasswordRecoveryFormData>({
      resolver: yupResolver(recoveryPasswordFormSchema),
      mode: 'onBlur',
    })
  const toast = useToast()

  const { errors, isSubmitting } = formState

  const handlePasswordRecovery: SubmitHandler<PasswordRecoveryFormData> =
    async (values) => {
      try {
        await api.post('/users/reset-password', { email: values.email })

        toast({
          position: 'top',
          isClosable: false,
          variant: 'solid',
          status: 'success',
          title:
            'Um e-mail foi enviado com instruções para recuperar sua senha',
        })

        Router.push('/')
      } catch (error) {
        toast({
          position: 'top',
          variant: 'solid',
          title: 'Houve uma falha na requisição, por favor tente novamente.',
          status: 'error',
        })
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
            label="E-mail"
            name="email"
            error={errors.email}
            {...register('email')}
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
