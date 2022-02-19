import { Stack } from '@chakra-ui/react'
import { useCan } from 'hooks/useCan'
import {
  RiArticleLine,
  RiBookLine,
  RiBuildingLine,
  RiContactsLine,
  RiDashboardLine,
  RiLineChartLine,
  RiPlugLine,
  RiPriceTag3Line,
  RiTeamLine,
} from 'react-icons/ri'
import { NavLink } from './NavLink'
import { NavSection } from './NavSection'

export function SideBarNave() {
  return (
    <Stack spacing="12" align="flex-start">
      <NavSection title="Geral">
        <NavLink icon={RiDashboardLine} href="/dashboard">
          Painel
        </NavLink>
        {useCan({
          roles: ['supplier'],
        }) && (
          <>
            <NavLink icon={RiPriceTag3Line} href="/products">
              Produtos
            </NavLink>
            <NavLink icon={RiTeamLine} href="/sellers">
              Vendedores
            </NavLink>
          </>
        )}
        {useCan({
          roles: ['seller'],
        }) && (
          <>
            <NavLink icon={RiLineChartLine} href="/sales">
              Vendas
            </NavLink>
            <NavLink icon={RiBookLine} href="/catalog">
              Catálogo
            </NavLink>
            <NavLink icon={RiArticleLine} href="/listings">
              Anúncios
            </NavLink>
            <NavLink icon={RiBuildingLine} href="/suppliers">
              Fornecedores
            </NavLink>
          </>
        )}
        <NavLink icon={RiContactsLine} href="/users">
          Usuários
        </NavLink>
      </NavSection>
      <NavSection title="Configurações">
        <NavLink icon={RiPlugLine} href="/integrations">
          Integrações
        </NavLink>
      </NavSection>
    </Stack>
  )
}
