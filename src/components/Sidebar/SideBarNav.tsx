import { Stack } from '@chakra-ui/react'
import { useCan } from 'hooks/useCan'
import {
  RiContactsLine,
  RiDashboardLine,
  RiFileList2Line,
  RiPlugLine,
  RiPriceTag2Line,
} from 'react-icons/ri'
import { NavLink } from './NavLink'
import { NavSection } from './NavSection'

export function SideBarNave() {
  return (
    <Stack spacing="12" align="flex-start">
      <NavSection title="Geral">
        <NavLink icon={RiDashboardLine} href="/dashboard">
          Dashboard
        </NavLink>
        {useCan({
          roles: ['supplier'],
        }) && (
          <NavLink icon={RiPriceTag2Line} href="/products">
            Produtos
          </NavLink>
        )}
        {useCan({
          roles: ['seller'],
        }) && (
          <NavLink icon={RiFileList2Line} href="/catalog">
            Catálogo
          </NavLink>
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
