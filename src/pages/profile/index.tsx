import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import Layout from '@/components/Layout'
import { setupAPIClient } from '@/services/api/api'
import { api } from '@/services/api/apiClient'
import {
  Box,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  InputRightElement,
  Icon,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { RiSearchLine } from 'react-icons/ri'
import { withSSRAuth } from 'utils/withSSRAuth'
import * as yup from 'yup'

interface GetProfile {
  profile: {
    id: string
    updated_at: Date
    created_at: Date
    name: string
    nickname?: string
    is_company: boolean
    document_number: number
    state_subscription_number?: number
    city_subscription_number?: number
    is_main: boolean
  }
  address: {
    id: string
    updated_at: Date
    created_at: Date
    zip: number
    state: string
    city: string
    district: string
    address: string
    number: string
    address_2?: string
  }
}

interface ProfileFormData {
  name: string
  nickname: string
  is_company: string
  document: string
  state_subscription_number: string
  city_subscription_number: string
  zip: string
  state: string
  city: string
  district: string
  address: string
  address_2: string
  number: string
}

const states = [
  {
    name: 'Acre',
    alias: 'AC',
  },
  {
    name: 'Alagoas',
    alias: 'AL',
  },
  {
    name: 'Amapá',
    alias: 'AP',
  },
  {
    name: 'Amazonas',
    alias: 'AM',
  },
  {
    name: 'Bahia',
    alias: 'BA',
  },
  {
    name: 'Ceará',
    alias: 'CE',
  },
  {
    name: 'Distrito Federal',
    alias: 'DF',
  },
  {
    name: 'Espírito Santo',
    alias: 'ES',
  },
  {
    name: 'Goiás',
    alias: 'GO',
  },
  {
    name: 'Maranhão',
    alias: 'MA',
  },
  {
    name: 'Mato Grosso',
    alias: 'MT',
  },
  {
    name: 'Mato Grosso do Sul',
    alias: 'MS',
  },
  {
    name: 'Minas Gerais',
    alias: 'MG',
  },
  {
    name: 'Pará',
    alias: 'PA',
  },
  {
    name: 'Paraíba',
    alias: 'PB',
  },
  {
    name: 'Paraná',
    alias: 'PR',
  },
  {
    name: 'Pernambuco',
    alias: 'PE',
  },
  {
    name: 'Piauí',
    alias: 'PI',
  },
  {
    name: 'Rio de Janeiro',
    alias: 'RJ',
  },
  {
    name: 'Rio Grande do Norte',
    alias: 'RN',
  },
  {
    name: 'Rio Grande do Sul',
    alias: 'RS',
  },
  {
    name: 'Rondônia',
    alias: 'RO',
  },
  {
    name: 'Roraima',
    alias: 'RR',
  },
  {
    name: 'Santa Catarina',
    alias: 'SC',
  },
  {
    name: 'São Paulo',
    alias: 'SP',
  },
  {
    name: 'Sergipe',
    alias: 'SE',
  },
  {
    name: 'Tocantins',
    alias: 'TO',
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const toast = useToast()
  const [isLoadingZipData, setIsLoadingZipData] = useState(false)
  const [isLoadingFormData, setIsLoadingFormData] = useState(false)

  const updateProfileFormSchema = yup.object({
    name: yup.string().required('Razão Social / Nome obrigatório'),
    nickname: yup.string().optional(),
    is_company: yup.string().required('Tipo obrigatório'),
    document: yup.string().when('is_company', {
      is: (is_company: string) => is_company === '1',
      then: yup
        .string()
        .required('CNPJ/CPF')
        .length(18, 'CNPJ deve conter 18 caracteres'),
      otherwise: yup
        .string()
        .required('CNPJ/CPF')
        .length(14, 'CPF deve conter 14 caracteres'),
    }),
    state_subscription_number: yup.string().when('is_company', {
      is: (is_company: string) => is_company === '1',
      then: yup.string().required('Escrição Estadual obrigatória'),
    }),
    city_subscription_number: yup.string().optional(),
    zip: yup.string().required('Cep obrigatório'),
    state: yup.string().required('Estado obrigatório'),
    city: yup.string().required('Cidade obrigatória'),
    district: yup.string().required('Bairro obrigatório'),
    address: yup.string().required('Endereço obrigatório'),
    address_2: yup.string().optional(),
    number: yup.string().required('Número obrigatório'),
  })

  const {
    formState,
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    trigger,
    setError,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(updateProfileFormSchema),
    mode: 'onBlur',
    // defaultValues: {
    //   name: profile?.profile.name,
    //   district: profile?.address.district,
    //   city: profile?.address.city,
    //   address_2: profile?.address.address_2,
    //   address: profile?.address.address,
    // },
  })

  const { errors } = formState

  useEffect(() => {
    setIsLoadingFormData(true)
    api.get<GetProfile>('profiles').then(({ data }) => {
      if (data.profile) {
        setValue('name', data.profile.name)
        setValue('nickname', data.profile.nickname ? data.profile.nickname : '')
        setValue('is_company', data.profile.is_company ? '1' : '0')
        if (data.profile.document_number.toString().length == 14) {
          setValue(
            'document',
            String(data.profile.document_number).replace(
              /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g,
              '$1.$2.$3/$4-$5'
            )
          )
        } else {
          setValue(
            'document',
            String(data.profile.document_number).replace(
              /^(\d{3})(\d{3})(\d{3})(\d{2})/g,
              '$1.$2.$3-$4'
            )
          )
        }
        setValue(
          'state_subscription_number',
          data.profile.state_subscription_number
            ? String(data.profile.state_subscription_number)
            : ''
        )
        setValue(
          'city_subscription_number',
          data.profile.city_subscription_number
            ? String(data.profile.city_subscription_number)
            : ''
        )
      }
      if (data.address) {
        setValue(
          'zip',
          String(data.address.zip).replace(/^(\d{5})(\d{3})/g, '$1-$2')
        )
        setValue('state', data.address.state)
        setValue('city', data.address.city)
        setValue('district', data.address.district)
        setValue('address', data.address.address)
        setValue(
          'address_2',
          data.address.address_2 ? data.address.address_2 : ''
        )
        setValue('number', data.address.number)
      }

      setIsLoadingFormData(false)
    })
  }, [])

  async function searchZip() {
    const zip = getValues('zip').replaceAll(/\D/g, '')

    if (!zip) {
      return
    }

    setIsLoadingZipData(true)

    try {
      const { data } = await Promise.race([
        axios.get(`https://viacep.com.br/ws/${zip}/json/`),
        axios.get(`https://ws.apicep.com/cep/${zip}.json`),
      ])

      if (data.logradouro) {
        setValue('address', data.logradouro)
        setValue('district', data.bairro)
        setValue('state', data.uf)
        setValue('city', data.localidade)
      } else if (data.address) {
        setValue('address', data.address)
        setValue('district', data.district)
        setValue('state', data.state)
        setValue('city', data.city)
      }
    } catch (error) {}

    setIsLoadingZipData(false)
  }

  const handleUpdateProfileSubmit: SubmitHandler<ProfileFormData> = async (
    data
  ) => {
    try {
      if (data.city_subscription_number == '') {
        delete data.city_subscription_number
      }
      if (data.state_subscription_number == '') {
        delete data.state_subscription_number
      }

      if (
        data.state_subscription_number &&
        isNaN(Number(data.state_subscription_number))
      ) {
        setError(
          'state_subscription_number',
          {
            type: 'manual',
            message: 'O valor deve ser apenas numérico',
          },
          {
            shouldFocus: true,
          }
        )
        return
      }

      if (
        data.city_subscription_number &&
        isNaN(Number(data.city_subscription_number))
      ) {
        setError(
          'city_subscription_number',
          {
            type: 'manual',
            message: 'O valor deve ser apenas numérico',
          },
          {
            shouldFocus: true,
          }
        )
        return
      }

      const response = await api.post('profiles', {
        ...data,
        document: Number(data.document.replaceAll(/\D/g, '')),
        zip: Number(data.zip.replaceAll(/\D/g, '')),
        state_subscription_number:
          data.state_subscription_number &&
          Number(data.state_subscription_number.replaceAll(/\D/g, '')),
        city_subscription_number:
          data.city_subscription_number &&
          Number(data.city_subscription_number.replaceAll(/\D/g, '')),
        is_company: data.is_company === '1' ? true : false,
      })
      toast({
        status: 'success',
        variant: 'solid',
        position: 'top',
        title: 'Dados atualizados com successo',
      })
    } catch (error) {
      toast({
        description: JSON.stringify(error),
      })
    }
  }

  function shouldRenderCompanyFields({ control }) {
    const type = useWatch({
      control,
      name: 'is_company',
      defaultValue: '1',
    })

    if (type === '0') {
      return false
    }

    return true
  }

  return (
    <Layout>
      <Box
        as="form"
        onSubmit={handleSubmit(handleUpdateProfileSubmit)}
        className="panel"
        flex="1"
        p={['6', '8']}
      >
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Profile
            {isLoadingFormData && (
              <Spinner ml="4" size="sm" color="brand.500" />
            )}
          </Heading>
        </Flex>
        <Divider my="6" borderColor="gray.500" />

        <VStack spacing="8">
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              name="name"
              label="Razão Social / Nome"
              type="text"
              showRequiredLabel
              {...register('name')}
              error={errors.name}
            />
            <Input
              name="nickname"
              label="Nome Fantasia / Apelido"
              type="text"
              error={errors.nickname}
            />
          </SimpleGrid>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Select
              name="is_company"
              label="Tipo"
              {...register('is_company')}
              error={errors.is_company}
            >
              <option value="1">Pessoa Jurídica</option>
              <option value="0">Pessoa Física</option>
            </Select>
            <Input
              name="document"
              label="CNPJ/CPF"
              type="text"
              mask={
                shouldRenderCompanyFields({ control })
                  ? '99.999.999-9999/99'
                  : '999.999.999-99'
              }
              showRequiredLabel
              {...register('document')}
              error={errors.document}
            />
          </SimpleGrid>
          {shouldRenderCompanyFields({ control }) && (
            <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
              <Input
                name="state_subscription_number"
                label="Escrição Estadual"
                type="text"
                showRequiredLabel
                {...register('state_subscription_number')}
                error={errors.state_subscription_number}
              />
              <Input
                name="city_subscription_number"
                label="Escrição Municipal"
                type="text"
                {...register('city_subscription_number')}
                error={errors.city_subscription_number}
              />
            </SimpleGrid>
          )}
          <Box width="100%">
            <Heading as="h3" fontSize="lg">
              Endereço
            </Heading>
          </Box>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              name="zip"
              label="Cep"
              type="text"
              showRequiredLabel
              {...register('zip')}
              error={errors.zip}
              rightElement={
                <InputRightElement>
                  <Button
                    colorScheme="brand"
                    onClick={() => searchZip()}
                    size="lg"
                    isLoading={isLoadingZipData}
                  >
                    <Icon as={RiSearchLine} />
                  </Button>
                </InputRightElement>
              }
            />
            <Select
              name="state"
              label="Estado"
              placeholder="Selecione o Estado"
              showRequiredLabel
              {...register('state')}
              error={errors.state}
            >
              {states.map((state) => (
                <option key={state.alias} value={state.alias}>
                  {state.name}
                </option>
              ))}
            </Select>
            <Input
              name="city"
              label="Cidade"
              type="text"
              showRequiredLabel
              {...register('city')}
              error={errors.city}
            />
            <Input
              name="district"
              label="Bairro"
              type="text"
              showRequiredLabel
              {...register('district')}
              error={errors.district}
            />
          </SimpleGrid>
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              name="address"
              label="Endereço"
              type="text"
              showRequiredLabel
              {...register('address')}
              error={errors.address}
            />
            <Input
              name="number"
              label="Número"
              type="text"
              showRequiredLabel
              {...register('number')}
              error={errors.number}
            />
            <Input
              name="address_2"
              label="Complemento"
              type="text"
              {...register('address_2')}
              error={errors.address_2}
            />
          </SimpleGrid>
        </VStack>
        <Flex mt="8" justify="flex-end">
          <HStack spacing="4">
            <Button onClick={() => router.back()}>Cancelar</Button>
            <Button
              type="submit"
              isLoading={formState.isSubmitting}
              colorScheme="brand"
            >
              Atualizar
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return {
    props: {
      cookies: ctx.req.headers.cookie ?? '',
    },
  }
})
