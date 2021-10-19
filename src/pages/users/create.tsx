import {
  Box,
  Heading,
  Button,
  Divider,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react'
import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { Input } from '../../components/Form/Input'
import { SubmitHandler, useForm } from 'react-hook-form'
import Link from 'next/link'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation } from 'react-query'
import { api } from '../../services/api/apiClient'
import { queryClient } from '../../services/queryClient'
import { useRouter } from 'next/router'
import { withSSRAuth } from '../../utils/withSSRAuth'

type CreateUserFormData = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function CreateUser() {
  const router = useRouter()

  const createUser = useMutation(
    async (user: CreateUserFormData) => {
      const response = await api.post('users', {
        user: {
          ...user,
          created_at: new Date(),
        },
      })

      return response.data.user
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
      },
    }
  )

  const createUserFormSchema = yup.object({
    name: yup.string().required('Nome obrigatório'),
    email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
    password: yup
      .string()
      .required('Senha obrigatória')
      .min(6, 'A senha deve conter no mínimo 6 caracteres'),
    password_confirmation: yup
      .string()
      .required('A confirmação de senha é obrigatória')
      .oneOf([null, yup.ref('password')], 'A senha informada não confere'),
  })

  const { handleSubmit, formState, register } = useForm<CreateUserFormData>({
    resolver: yupResolver(createUserFormSchema),
    mode: 'onBlur',
  })

  const handleCreateUserSubmit: SubmitHandler<CreateUserFormData> = async (
    values
  ) => {
    await createUser.mutateAsync(values)
    router.push('/users')
  }

  const { errors } = formState

  return (
    <Box>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box
          className="panel"
          as="form"
          onSubmit={handleSubmit(handleCreateUserSubmit)}
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
              <Input
                label="Nome completo"
                name="name"
                type="text"
                {...register('name')}
                error={errors.name}
              />
              <Input
                label="E-mail"
                name="email"
                type="email"
                {...register('email')}
                error={errors.email}
              />
            </SimpleGrid>
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Input
                label="Senha"
                name="password"
                type="password"
                {...register('password')}
                error={errors.password}
              />
              <Input
                label="Confirmação de Senha"
                name="password_confirmation"
                type="password"
                {...register('password_confirmation')}
                error={errors.password_confirmation}
              />
            </SimpleGrid>
          </VStack>
          <Flex mt="8" justify="flex-end">
            <HStack spacing="4">
              <Link href="/users" passHref>
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
    </Box>
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
    roles: ['master'],
  }
)
