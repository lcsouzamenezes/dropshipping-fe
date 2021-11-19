import {
  Flex,
  Button,
  Stack,
  useToast,
  Link as ChakraLink,
  Image as ChakraImage,
  Box,
  useColorMode,
} from '@chakra-ui/react'
import Link from 'next/link'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Input } from '../components/Form/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../context/AuthContext'
import { withSSRGuest } from '../utils/withSSRGuest'

interface SignInFormData {
  email: string
  password: string
}

const signInFormSchema = yup.object({
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
  password: yup.string().required('Senha obrigatória'),
})

export default function SignIn() {
  const { signIn, isRedirecting } = useAuth()
  const toast = useToast()
  const { colorMode } = useColorMode()

  const { register, handleSubmit, formState } = useForm<SignInFormData>({
    resolver: yupResolver(signInFormSchema),
    mode: 'onBlur',
  })

  const { errors } = formState

  const handleSignIn: SubmitHandler<SignInFormData> = async (values) => {
    try {
      await signIn(values)
    } catch (error) {
      toast.closeAll()

      switch (error.response?.data.code) {
        case 'invalid.credentials':
          toast({
            position: 'top',
            variant: 'solid',
            title: 'E-mail ou Senha inválidos',
            status: 'error',
          })
          break
        case 'session.inactive_user':
          toast({
            position: 'top',
            variant: 'solid',
            title: 'Usuário Inativo!',
            description:
              'Por favor ative sua conta ou entre em contato com um Administrador.',
            status: 'error',
          })
          break
        case 'session.disabled_account':
          toast({
            position: 'top',
            variant: 'solid',
            title: 'Sua conta está desabilitada!',
            description: 'Entre em contato para mais informações.',
            status: 'error',
          })
          break

        default:
          toast({
            position: 'top',
            variant: 'solid',
            title: 'Houve uma falha na requisição, por favor tente novamente.',
            status: 'error',
          })
          break
      }
    }
  }

  return (
    <Flex
      minHeight="100vh"
      minWidth={320}
      direction="column"
      align="center"
      justify="center"
    >
      <Box mb={8}>
        <ChakraImage
          w={[150, 200]}
          src={
            colorMode === 'light'
              ? '/assets/logo/logo.svg'
              : '/assets/logo/logo-i.svg'
          }
          alt="Outter"
        />
      </Box>
      {/* <Icon as={RiShip2Fill} fontSize="52" color="brand.500" />
      <Text
        fontSize={['md', '3xl']}
        fontWeight="bold"
        letterSpacing="tight"
        mb="4"
      >
        DropShipping
        <Text as="span" color="brand.500">
          .
        </Text>
      </Text> */}
      <Flex
        as="form"
        width="100%"
        maxWidth={420}
        // bg="gray.800"
        className="panel"
        p="8"
        flexDir="column"
        action="/dashboard"
        onSubmit={handleSubmit(handleSignIn)}
      >
        <Stack spacing="4">
          <Input
            label="E-mail"
            name="email"
            type="email"
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
        </Stack>
        <Button
          colorScheme="brand"
          type="submit"
          mt="6"
          mb="6"
          size="lg"
          isLoading={formState.isSubmitting || isRedirecting}
        >
          Entrar
        </Button>
        <Stack direction="row" justify="space-between">
          <Link href="/register" passHref>
            <ChakraLink as="a" fontSize="sm">
              Esqueceu a senha?
            </ChakraLink>
          </Link>
          <Link href="/register" passHref>
            <ChakraLink as="a" fontSize="sm">
              Criar Conta
            </ChakraLink>
          </Link>
        </Stack>
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
