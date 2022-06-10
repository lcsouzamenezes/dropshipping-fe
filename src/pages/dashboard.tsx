import { setupAPIClient } from '@/services/api/api'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  theme,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { RiLinksLine } from 'react-icons/ri'
import Layout from '../components/Layout'
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
    data: [0, 0, 0, 0, 0, 0],
  },
]

interface DashboardProps {
  profile: {
    profile: {
      id: string
    }
  } | null
  salesMetric: {
    salesCount: number
  }
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
          <Link href="/profile" passHref>
            <Alert as="a" status="warning" mb="2" borderRadius="base">
              <AlertIcon />
              <AlertTitle>Próximos passos:</AlertTitle>
              <Icon as={RiLinksLine} mr="1" />
              Clique aqui e preencha todos os dados do Perfil{' '}
            </Alert>
          </Link>
        )}
        <SimpleGrid columns={[1, 2, 4]} spacing={4} mb={4}>
          <Stat p={['2', '4']} className="panel">
            <StatLabel>Faturamento</StatLabel>
            <StatNumber>R$0,00</StatNumber>
            <StatHelpText>Fevereiro</StatHelpText>
          </Stat>
          <Stat p={['2', '4']} className="panel">
            <StatLabel>Vendas do Mês</StatLabel>
            <StatNumber>{props.salesMetric?.salesCount ?? 0}</StatNumber>
            <StatHelpText>Fevereiro</StatHelpText>
          </Stat>
          <Stat p={['2', '4']} className="panel">
            <StatLabel>Fornecedores</StatLabel>
            <StatNumber>120</StatNumber>
            <StatHelpText>Ativos</StatHelpText>
          </Stat>
          <Stat p={['2', '4']} className="panel">
            <StatLabel>Anúncios</StatLabel>
            <StatNumber>110</StatNumber>
            <StatHelpText>Ativos</StatHelpText>
          </Stat>
        </SimpleGrid>
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
    let salesMetric = null
    try {
      const { data: profileData } = await apiClient.get(`/profiles`)
      const { data: salesMetricsData } = await apiClient.get(`/metrics/sales`)
      profile = profileData
      salesMetric = salesMetricsData
    } catch (error) {
      console.error(error)
    }

    // const response = await apiClient.get('users/me');
    return {
      props: {
        cookies: ctx.req.headers.cookie ?? '',
        profile,
        salesMetric,
      },
    }
  },
  {
    roles: ['seller', 'supplier'],
  }
)
