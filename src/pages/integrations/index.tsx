import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Flex,
  Box,
  Heading,
  Text,
  Grid,
  Image,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from '@chakra-ui/react'

import { Header } from '../../components/Header'
import { Sidebar } from '../../components/Sidebar'
import { useIngrations } from '@/services/api/hooks/useIntegrations'

export default function Integrations() {
  const { data, error, isFetching, isLoading } = useIngrations()

  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <Box flex="1" className="panel" p="8">
          <Flex mb="8" justify="space-between" align="center">
            <Heading size="lg" fontWeight="normal">
              Integrações
            </Heading>
          </Flex>
          <Flex mb="8" justify="center">
            {isFetching ? (
              <Spinner color="brand.500" />
            ) : error ? (
              <Text>Falha ao obter dados.</Text>
            ) : (
              <>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Tipo</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.map(({ id, name, type }) => {
                      return (
                        <Tr key={id}>
                          <Td>{name}</Td>
                          <Td>{type}</Td>
                          <Td></Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </>
            )}
          </Flex>
          <Box>
            <Heading mb="8" size="md" fontWeight="normal">
              Adicionar Integrações
            </Heading>
            <Grid templateColumns="repeat(5, 1fr)" gap={6} align="center">
              <Box bgColor="white" p="4" borderWidth="1px" borderRadius="lg">
                <Flex
                  p="6"
                  mb="6"
                  borderRadius="sm"
                  h="120px"
                  align="center"
                  justify="center"
                >
                  <Image src="/assets/images/services/bling.svg" alt="Bling" />
                </Flex>
                <Box>
                  <Text color="gray.800" fontSize="lg" fontWeight="bold">
                    Bling
                  </Text>
                  <Link href="/integrations/bling" passHref>
                    <Button as="a" mt="4" colorScheme="brand">
                      Adicionar
                    </Button>
                  </Link>
                </Box>
              </Box>
              <Box bgColor="white" p="4" borderWidth="1px" borderRadius="lg">
                <Flex
                  bgColor="white"
                  p="6"
                  mb="6"
                  borderRadius="sm"
                  h="120px"
                  align="center"
                  justify="center"
                >
                  <Image
                    src="/assets/images/services/mercadolivre.svg"
                    alt="MercadoLivre"
                  />
                </Flex>
                <Box>
                  <Text color="gray.800" fontSize="lg" fontWeight="bold">
                    Mercado Livre
                  </Text>
                  <Link href="/integrations/mercadolivre" passHref>
                    <Button as="a" mt="4" colorScheme="brand">
                      Adicionar
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}
