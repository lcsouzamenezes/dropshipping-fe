import Layout from '@/components/Layout'
import { Box, Flex, Heading } from '@chakra-ui/react'
import Head from 'next/head'
import { withSSRAuth } from 'utils/withSSRAuth'

export default function SuppliersPage() {
  return (
    <Layout>
      <Head>
        <title>Fornecedores - Outter DS</title>
        <meta
          property="og:title"
          content="Fornecedores - Outter DS"
          key="title"
        />
      </Head>
      <Box flex="1" className="panel" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Heading size="lg" fontWeight="normal" width="260px">
            Fornecedores
            {/* {isFetching && !isLoading && (
              <Spinner color="gray.500" size="sm" ml="4" />
            )} */}
          </Heading>
          <Box w="100%" pr="6"></Box>
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
