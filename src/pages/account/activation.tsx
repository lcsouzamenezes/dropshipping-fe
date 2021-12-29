import { useRouter } from 'next/router'
import Link from 'next/link'
import { Flex, Icon, Text, useToast, Spinner, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { RiCheckLine, RiCloseLine } from 'react-icons/ri'
import { api } from '../../services/api/apiClient'

export default function AccountsActivation({ query }) {
  const router = useRouter()
  const toast = useToast()
  const { token, id } = router.query
  const [isActivating, setIsActivating] = useState(false)
  const [isActivated, setIsActivated] = useState(false)
  const [isResending, setIsResending] = useState(false)

  async function activeUser() {
    try {
      await api.post('/users/activate', {
        token,
        user_id: id,
      })

      setIsActivated(true)
    } catch (error) {
      console.error(error)
    }
  }

  async function activateAccount() {
    setIsActivating(true)
    setTimeout(async () => {
      await activeUser()
      setIsActivating(false)
    }, 500)
  }

  async function handleResendEmail() {
    setIsResending(true)
    setTimeout(() => {
      toast({
        variant: 'solid',
        status: 'success',
        title: 'E-mail reenviado com successo!',
        position: 'top',
      })
      setIsResending(false)
    }, 2000)
  }

  useEffect(() => {
    activateAccount()
  }, [])

  function renderMessage() {
    if (isActivating) {
      return (
        <Flex justify="center" flexDir="row">
          <Spinner color="brand.500" mr="4" />
          <Text>Ativando conta...</Text>
        </Flex>
      )
    }
    if (isActivated) {
      return (
        <Flex justify="center" flexDir="row">
          <Icon color="brand.500" mr="4" as={RiCheckLine} fontSize="2xl" />
          <Text>Conta ativada com successo!</Text>
        </Flex>
      )
    }
    return (
      <Flex flexDir="column">
        <Flex justify="center" flexDir="row" mb="4">
          <Icon color="red.500" mr="4" as={RiCloseLine} fontSize="2xl" />
          <Text>Falha ao ativar conta</Text>
        </Flex>
        <Flex flexDir="column">
          <Button
            size="lg"
            onClick={() => {
              activateAccount()
            }}
            colorScheme="brand"
          >
            Tentar novamente
          </Button>
          {/* <Button
            size="lg"
            mt="2"
            onClick={() => {
              handleResendEmail()
            }}
            colorScheme="gray"
            isLoading={isResending}
          >
            Reenviar E-mail
          </Button> */}
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex minHeight="100vh" direction="column" align="center" justify="center">
      <Text
        fontSize={['md', '3xl']}
        fontWeight="bold"
        letterSpacing="tight"
        mb="4"
      >
        Ativação de conta
      </Text>
      <Flex
        width="100%"
        maxWidth={360}
        className="panel"
        p="8"
        flexDir="column"
      >
        {renderMessage()}
        {isActivated && (
          <Link href="/">
            <Button mt="4" as="a" size="lg" colorScheme="brand">
              Ir para Login
            </Button>
          </Link>
        )}
      </Flex>
    </Flex>
  )
}
export function getServerSideProps({ query }) {
  if (!query.token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: {},
  }
}
