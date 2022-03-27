import Layout from '@/components/Layout'
import { Box, Flex, Heading } from '@chakra-ui/react'
import Head from 'next/head'

export default function NewPage(props) {
  return (
    <Layout>
      <Head>
        <title>Novo Anúncios - Outter DS</title>
        <meta
          property="og:title"
          content="Novo Anúncios - Outter DS"
          key="title"
        />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal">
            Criar novo anúncio
          </Heading>
        </Flex>
      </Box>
    </Layout>
  )
}
