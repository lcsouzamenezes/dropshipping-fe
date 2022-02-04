import Layout from '@/components/Layout'
import { setupAPIClient } from '@/services/api/api'
import * as yup from 'yup'

import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  VStack,
  Button,
  Icon,
  InputRightElement,
  Tooltip,
  useToast,
  HStack,
} from '@chakra-ui/react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { Input } from '@/components/Form/Input'
import { Select } from '@/components/Form/Select'
import { RiFileCopyFill, RiInformationLine } from 'react-icons/ri'
import { useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import { api } from '@/services/api/apiClient'

interface BlingShowItemProps {
  integration: {
    id: string
    description: string
    access_token: string
    account_id: string
    provider: 'bling'
    settings: {
      store_id: string
    }
  }
}

type BlingSettingsFormData = {
  storeId: string
}

export default function BlingShowItem({ integration }: BlingShowItemProps) {
  const [tooltipData, setTooltipData] = useState({
    text: 'Copiar para área de transfêrencia',
    color: undefined,
  })
  const callbackUrlInput = useRef(null)
  const toast = useToast()

  const blingSettingsFormSchema = yup.object({
    storeId: yup.string(),
  })

  const { handleSubmit, formState, register, setValue } =
    useForm<BlingSettingsFormData>({
      resolver: yupResolver(blingSettingsFormSchema),
      mode: 'onBlur',
    })

  const { errors } = formState

  function handleCopyToClipboardButtonClick() {
    navigator.clipboard.writeText(callbackUrlInput.current.value)
    setTooltipData({
      text: 'Copiado',
      color: 'green.500',
    })
    setTimeout(() => {
      setTooltipData({
        text: 'Copiar para área de transfêrencia',
        color: undefined,
      })
    }, 1000)
  }

  const handleBlingSettingsSubmit: SubmitHandler<BlingSettingsFormData> =
    async (values) => {
      try {
        await api.patch(`integrations/${integration.id}/settings`, {
          settings: {
            store_id: values.storeId,
          },
        })

        toast({
          status: 'success',
          variant: 'solid',
          position: 'top',
          title: 'Configurações salvas com successo',
        })
      } catch (error) {
        console.error(error)
        toast({
          status: 'error',
          variant: 'solid',
          position: 'top',
          title: 'Falha ao atualizar configurações',
        })
      }
    }

  return (
    <Layout>
      <Box flex="1" className="panel" p="8">
        <Flex mb="4" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Bling - {integration.description}
          </Heading>
        </Flex>
        <VStack spacing="8">
          <Input
            label="URL de Callback de estoque"
            name="stock_callback_url"
            type="text"
            value={`${process.env.NEXT_PUBLIC_HOST}/api/bling/callback/${integration.id}`}
            ref={callbackUrlInput}
            rightElement={
              <InputRightElement>
                <Tooltip
                  label={tooltipData.text}
                  hasArrow
                  placement="auto"
                  closeOnClick={false}
                  bg={tooltipData.color}
                >
                  <Button
                    colorScheme="brand"
                    onClick={handleCopyToClipboardButtonClick}
                  >
                    <Icon fontSize="lg" as={RiFileCopyFill} />
                  </Button>
                </Tooltip>
              </InputRightElement>
            }
            isReadOnly
          />
          <Box
            as="form"
            onSubmit={handleSubmit(handleBlingSettingsSubmit)}
            w="100%"
          >
            <Input
              label="Código Loja"
              name="storeId"
              placeholder="12345678"
              defaultValue={integration.settings?.store_id}
              {...register('storeId')}
              error={errors.storeId}
            />
            <Flex mt="8" justify="flex-end">
              <HStack spacing="4">
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
        </VStack>
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const api = setupAPIClient(ctx)
    const { id } = ctx.params

    const { data: integration } = await api.get(`integrations/${id}`)

    return {
      props: {
        integration,
        cookies: ctx.req.headers.cookie ?? '',
      },
    }
  },
  {
    roles: ['supplier'],
  }
)
