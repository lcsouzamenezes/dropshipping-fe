import {
  Flex,
  SimpleGrid,
  Box,
  Text,
  theme,
  Alert,
  AlertIcon,
  AlertTitle,
  Icon,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Layout from '../components/Layout'
import { withSSRAuth } from '../utils/withSSRAuth'
import Link from 'next/link'
import { RiLinksLine } from 'react-icons/ri'
import { setupAPIClient } from '@/services/api/api'

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

interface DashboardProps {
  profile: {
    profile: {
      id: string
    }
  } | null
}

export default function Dashboard(props: DashboardProps) {
  return (
    <Layout>
      <Head>
        <title>Dashboard - Outter DS</title>
        <meta property="og:title" content="Dashboard - Outter DS" key="title" />
      </Head>
      <Flex w="100%" direction="column">
        {!props.profile?.profile?.id && (
          <Link href="profile" passHref>
            <Alert as="a" status="warning" mb="2" borderRadius="base">
              <AlertIcon />
              <AlertTitle>Próximos passos:</AlertTitle>
              <Icon as={RiLinksLine} mr="1" />
              Clique aqui e preencha todos os dados do Perfil{' '}
            </Alert>
          </Link>
        )}
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
    </Layout>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx)

    let profile = null
    try {
      const { data } = await apiClient.get(`/profiles`)
      profile = data
    } catch (error) {}

    // const response = await apiClient.get('users/me');
    return {
      props: {
        cookies: ctx.req.headers.cookie ?? '',
        profile: profile,
      },
    }
  },
  {
    roles: ['seller', 'supplier'],
  }
)
