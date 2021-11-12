import { withSSRAuth } from 'utils/withSSRAuth'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'

import Template from '@/components/Layout'
import { setupAPIClient } from '@/services/api/api'
import { User } from '@/services/api/hooks/useUsers'
import { useMutation } from 'react-query'
import { api } from '@/services/api/apiClient'
import { queryClient } from '@/services/queryClient'
import * as yup from 'yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Input } from '@/components/Form/Input'
import { Checkbox } from '@/components/Form/Checkbox'
import Link from 'next/link'

interface EditUserPageProps {
  user: User
}

type EditUserFormData = {
  name: string
  email: string
  password: string
  password_confirmation: string
  active: boolean
}

export default function EditUserPage({ user }: EditUserPageProps) {
  const router = useRouter()
  const { id } = user

  const editUser = useMutation(
    async ({
      name,
      email,
      active,
      password,
      password_confirmation,
    }: EditUserFormData) => {
      const updateData = {
        name,
        email,
        active,
      }

      if (password) {
        Object.assign(updateData, { password })
      }

      const response = await api.put(`users/${id}`, updateData)

      return response.data.user
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
      },
    }
  )

  const editUserFormSchema = yup.object({
    name: yup.string().required('Nome obrigatório'),
    email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
    password: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%¨&*]).{8,}$/, {
        message:
          'A senha deve conter pelo menos 8 digitos, sendo letras maiúsulas, minúsculas, um número e um símbolo',
        excludeEmptyString: true,
      }),
    password_confirmation: yup.string().when('password', {
      is: (password: string) => password.length > 0,
      then: yup
        .string()
        .required('A confirmação de senha é obrigatória')
        .oneOf([null, yup.ref('password')], 'A senha informada não confere'),
    }),

    active: yup.boolean(),
  })

  const { handleSubmit, formState, register } = useForm<EditUserFormData>({
    resolver: yupResolver(editUserFormSchema),
    mode: 'onBlur',
    defaultValues: {
      ...user,
    },
  })

  const handleEditUserSubmit: SubmitHandler<EditUserFormData> = async (
    values
  ) => {
    await editUser.mutateAsync(values)
    router.push('/users')
  }

  const { errors } = formState

  return (
    <Template>
      <Box
        className="panel"
        as="form"
        onSubmit={handleSubmit(handleEditUserSubmit)}
        flex="1"
        p={['6', '8']}
      >
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Editar Usuário{' '}
            <Text as="span" fontSize="sm" color="gray.500">
              ({user.name})
            </Text>
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
            <Box>
              <Input
                label="Senha"
                name="password"
                type="password"
                {...register('password')}
                error={errors.password}
              />
            </Box>
            <Input
              label="Confirmação de Senha"
              name="password_confirmation"
              type="password"
              {...register('password_confirmation')}
              error={errors.password_confirmation}
            />
          </SimpleGrid>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Checkbox
              {...register('active')}
              defaultChecked
              colorScheme="brand"
              size="lg"
            >
              Usuário Ativo
            </Checkbox>
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
    </Template>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupAPIClient(ctx)
  const { id } = ctx.params

  const { data: user } = await api.get(`users/${id}`)

  return {
    props: {
      cookies: ctx.req.headers.cookie ?? '',
      user,
    },
  }
})
