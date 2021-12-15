import {
  Box,
  Flex,
  Heading,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  useBreakpointValue,
  Spinner,
  Link as Chakralink,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Pagination } from '../../components/Pagination'
import { RiAddLine } from 'react-icons/ri'
import { MouseEventHandler, useRef, useState } from 'react'
import { useUsers } from '../../services/api/hooks/useUsers'
import Template from '@/components/Layout'
import { withSSRAuth } from 'utils/withSSRAuth'
import { api } from '@/services/api/apiClient'
import { AxiosError } from 'axios'
import { useMutation } from 'react-query'
import { queryClient } from '@/services/queryClient'
import { useAuth } from 'context/AuthContext'
import Head from 'next/head'

type User = {
  id: string
  email: string
  createdAt: string
}

type fetchUserResponse = {
  totalCount: number
  users: User[]
}

export default function UserList() {
  const [page, setPage] = useState(1)
  const { user: authenticatedUser } = useAuth()
  const [deletingUser, SetDeletingUser] = useState<User>(undefined)
  const [isDeleting, setIsDeleting] = useState(false)

  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)
  const cancelRef = useRef()

  const { isFetching, isLoading, error, data } = useUsers(page)

  const isWideVersion = useBreakpointValue({ base: false, lg: true })

  const deleteUser = useMutation<void, AxiosError>(
    async () => {
      await api.delete(`users/${deletingUser.id}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users')
      },
    }
  )

  function handleOpenDeleteModal(user: User) {
    SetDeletingUser(user)
    setIsOpen(true)
  }

  const handleClickDeleteButtonModal: MouseEventHandler<HTMLButtonElement> =
    async (e) => {
      e.preventDefault()
      setIsDeleting(true)

      try {
        await deleteUser.mutateAsync()

        toast({
          status: 'success',
          variant: 'solid',
          position: 'top',
          title: 'Usuário deletado com successo',
        })
      } catch (error) {
        if (error.response?.data.code === 'delete_user:delete_not_allowed') {
          toast({
            status: 'error',
            variant: 'solid',
            position: 'top',
            title: 'Não é permetido deletar usuários Master',
          })
        } else {
          toast({
            status: 'error',
            variant: 'solid',
            position: 'top',
            title: 'Falha ao deletar Usuário',
          })
        }
      } finally {
        onClose()
        setIsDeleting(false)
      }
    }

  async function handlePrefetchUser(user_id: string) {
    // await queryClient.prefetchQuery(
    //   ['user', user_id],
    //   async () => {
    //     const response = await api.get(`users/${user_id}`)
    //     return response.data
    //   },
    //   {
    //     staleTime: 1000 * 60 * 10, //10 min
    //   }
    // )
  }

  return (
    <Template>
      <Head>
        <title>Usuários - Outter DS</title>
        <meta property="og:title" content="Usuários - Outter DS" key="title" />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="4" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Usuários
            {isFetching && !isLoading && (
              <Spinner color="gray.500" size="sm" ml="4" />
            )}
          </Heading>
          <Link href="/users/create" passHref>
            <Button
              as="a"
              size="sm"
              fontSize="sm"
              leftIcon={<Icon as={RiAddLine} fontSize={20} />}
              colorScheme="brand"
            >
              Adicionar
            </Button>
          </Link>
        </Flex>
        {/* <Flex mb="4" justify="flex-end">
          <Box>
            <Select
              placeholder="Selecione uma ação"
              name="mass-action"
              size="sm"
            >
              <option>Deletar</option>
            </Select>
          </Box>
          <Button
            ml="2"
            w="140"
            size="sm"
            fontSize="sm"
            variant="outline"
            colorScheme="brand"
            isDisabled={true}
          >
            Enviar
          </Button>
        </Flex> */}
        {isLoading ? (
          <Flex justify="center">
            <Spinner color="brand.500" />
          </Flex>
        ) : error ? (
          <Flex justify="center">
            <Text>Falha ao obter dados.</Text>
          </Flex>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  {/* <Th px={['4', '4', '6']} color="gray.500" width="8">
                    <Checkbox colorScheme="brand" />
                  </Th> */}
                  <Th>Usuário</Th>
                  <Th>Status</Th>
                  {isWideVersion && <Th>Data de cadastro</Th>}
                  <Th width={['6', '6', '8']}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.users.map((user) => (
                  <Tr key={user.id}>
                    {/* <Td px={['4', '4', '6']}>
                      <Checkbox
                        name="massAction[]"
                        colorScheme="brand"
                        value={user.id}
                      />
                    </Td> */}
                    <Td>
                      <Box>
                        <Link href={`/users/${user.id}`} passHref>
                          <Chakralink
                            onMouseEnter={() => handlePrefetchUser(user.id)}
                            color="brand.500"
                          >
                            <Text fontWeight="bold">{user.name}</Text>
                          </Chakralink>
                        </Link>
                        <Text fontSize="sm" color="gray.500">
                          {user.email}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      {user.active ? (
                        <Badge colorScheme="green">Ativo</Badge>
                      ) : (
                        <Badge colorScheme="red">Inativo</Badge>
                      )}
                    </Td>
                    {isWideVersion && <Td>{user.createdAt}</Td>}
                    <Td>
                      {authenticatedUser && authenticatedUser.id !== user.id && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleOpenDeleteModal(user)}
                        >
                          Deletar
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              totalCountOfRegisters={data.totalCount}
              currentPage={page}
              onPageChange={setPage}
            />
          </>
        )}
      </Box>

      {deletingUser && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Deletar Usuário
              </AlertDialogHeader>

              <AlertDialogBody>
                Tem certeza que deseja deletar o usuário{' '}
                <Text as="span" fontWeight="bold">
                  {deletingUser.email}
                </Text>
                ? Essa ação não pode ser desfeita.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    SetDeletingUser(undefined)
                    onClose()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleClickDeleteButtonModal}
                  ml={3}
                  isLoading={isDeleting}
                >
                  Deletar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </Template>
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
    roles: ['seller', 'supplier'],
  }
)
