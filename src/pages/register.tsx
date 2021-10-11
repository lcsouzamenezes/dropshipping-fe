import {
  Flex,
  Text,
  Stack,
  Button,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js'
import * as yup from 'yup'
import { Input } from '../components/Form/Input'

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
  password: yup.string().required('Senha obrigatória'),
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

  const { errors, isSubmitting } = formState

  const handleRegister: SubmitHandler<RegisterFormData> = async (values) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(values)
        resolve('ok')
      }, 1500)
    })
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
        minWidth="380"
        onSubmit={handleSubmit(handleRegister)}
        p="8"
        flexDirection="column"
        className="panel"
      >
        <Stack spacing="4">
          <Input
            label="Nome da Empresa"
            name="company"
            error={errors.company}
            {...register('company')}
          />
          <Input
            label="Nome"
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
            error={errors.password}
            {...register('password')}
          />
          <Input
            label="Confirmação de Senha"
            name="password_confirmation"
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
