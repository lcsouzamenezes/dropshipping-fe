import { Flex, SimpleGrid, Box, Text, theme } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'
import { setupAPIClient } from '../services/api/api'
import { withSSRAuth } from '../utils/withSSRAuth'

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

const options = {
  chart: {
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    foreColor: theme.colors.gray[500],
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  xaxis: {
    type: 'category',
    axisBorder: {
      color: theme.colors.gray[600],
    },
    axisTicks: {
      color: theme.colors.gray[600],
    },
    categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
  } as ApexXAxis,
  fill: {
    opacity: 0.3,
    type: 'gradient',
    gradient: {
      shade: 'dark',
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
}
const series = [
  {
    name: 'Vendas',
    data: [0, 0, 10, 0, 15, 0],
  },
]

export default function Dashboard() {
  return (
    <Flex direction="column" h="100vh">
      <Head>
        <title>Dashboard - Outter DS</title>
        <meta property="og:title" content="Dashboard - Outter DS" key="title" />
      </Head>
      <Header />
      <Flex w="100%" my="6" maxWidth="1480" mx="auto" px="6">
        <Sidebar />
        <SimpleGrid flex="1" gap="4" minChildWidth="320px" align="flex-start">
          <Box p={['6', '8']} className="panel" /* pb="4" */>
            <Text fontSize="lg" mb="4">
              Vendas da Semana
            </Text>
            <Chart options={options} series={series} type="area" height={160} />
          </Box>
          <Box p={['6', '8']} className="panel" /* pb="4" */>
            <Text fontSize="lg" mb="4">
              Anúncios Ativos
            </Text>
            <Chart options={options} series={series} type="area" height={160} />
          </Box>
        </SimpleGrid>
      </Flex>
    </Flex>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    // const apiClient = setupAPIClient(ctx);

    // const response = await apiClient.get('users/me');

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
