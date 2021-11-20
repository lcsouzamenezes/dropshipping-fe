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
import { Input } from '../components/Form/Input'
import { api } from '../services/api/apiClient'

import { withSSRGuest } from '../utils/withSSRGuest'
import Head from 'next/head'

interface RegisterFormData {
  company: string
  name: string
  email: string
  password: string
  password_confirmation: string
}

const registerFormSchema = yup.object({
  company: yup.string().required('Nome obrigatório'),
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
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

export default function RegisterPage() {
  const { handleSubmit, register, formState } = useForm<RegisterFormData>({
    resolver: yupResolver(registerFormSchema),
    mode: 'onBlur',
  })
  const toast = useToast()

  const { errors, isSubmitting } = formState

  const handleRegister: SubmitHandler<RegisterFormData> = async (values) => {
    try {
      const data = { ...values, type: 'seller' }

      await api.post('/accounts', data)

      toast({
        position: 'top',
        isClosable: false,
        variant: 'solid',
        status: 'success',
        title: 'Conta criada com successo',
      })

      Router.push('/')
    } catch (error) {
      if (error.response?.data.code === 'users.exists') {
        toast({
          position: 'top',
          variant: 'solid',
          status: 'error',
          title: 'E-mail já cadastrado',
          description: 'Por favor efetue login ou recupere a senha.',
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
        <title>Cadastro - Outter DS</title>
        <meta property="og:title" content="Cadastro - Outter DS" key="title" />
      </Head>
      <Text
        fontSize={['md', '3xl']}
        fontWeight="bold"
        letterSpacing="tight"
        mb="4"
      >
        Cadastro
      </Text>
      <Flex
        as="form"
        width="100%"
        maxWidth={420}
        onSubmit={handleSubmit(handleRegister)}
        p="8"
        flexDirection="column"
        className="panel"
      >
        <Stack spacing="4">
          <Input
            label="Razão Social"
            name="company"
            error={errors.company}
            {...register('company')}
          />
          <Input
            label="Nome Completo"
            name="name"
            error={errors.name}
            {...register('name')}
          />
          <Input
            label="E-mail"
            name="email"
            error={errors.email}
            {...register('email')}
          />
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
          Registar
        </Button>
        <Link href="/" passHref>
          <ChakraLink m="0 auto">Voltar para Login</ChakraLink>
        </Link>
      </Flex>
    </Flex>
  )
}

const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
