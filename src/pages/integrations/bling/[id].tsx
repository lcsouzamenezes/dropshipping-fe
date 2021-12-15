import Layout from '@/components/Layout'
import { setupAPIClient } from '@/services/api/api'

import {
  Box,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  VStack,
  Button,
  Icon,
  InputRightElement,
  Tooltip,
} from '@chakra-ui/react'
import { withSSRAuth } from 'utils/withSSRAuth'
import { Input } from '@/components/Form/Input'
import { RiFileCopyFill } from 'react-icons/ri'
import { useRef, useState } from 'react'

interface BlingShowItemProps {
  integration: {
    id: string
    description: string
    access_token: string
    account_id: string
    provider: 'bling'
  }
}

export default function BlingShowItem({ integration }: BlingShowItemProps) {
  const [tooltipData, setTooltipData] = useState({
    text: 'Copiar para área de transfêrencia',
    color: undefined,
  })
  const callbackUrlInput = useRef(null)

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

  return (
    <Layout>
      <Box flex="1" className="panel" p="8">
        <Flex className="panel" flex="1" p={['6', '8']}>
          <Heading size="lg" fontWeight="normal">
            Bling - {integration.description}
          </Heading>
        </Flex>
        <Divider my="6" borderColor="gray.500" />
        <VStack spacing="8">
          <SimpleGrid minChildWidth="240px" spacing="8" w="100%">
            <Input
              label="URL de Callback de estoque"
              name="stock_callback_url"
              type="text"
              value={`${process.env.NEXT_PUBLIC_HOST}/api/bling/${integration.id}`}
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
          </SimpleGrid>
        </VStack>
      </Box>
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupAPIClient(ctx)
  const { id } = ctx.params

  const { data: integration } = await api.get(`integrations/${id}`)

  return {
    props: {
      integration,
    },
  }
})
