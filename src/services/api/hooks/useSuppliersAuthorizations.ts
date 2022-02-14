import { useQuery } from 'react-query'
import { api } from '../apiClient'

export interface SupplierAuthorizations {
  id: string
  supplier_id: string
  authorized: boolean
}

async function getSuppliersAuthorizations(
  page?: number,
  perPage?: number
): Promise<SupplierAuthorizations[]> {
  const { data } = await api.get<SupplierAuthorizations[]>(
    'suppliers/authotization-requests'
  )

  const suppliersAuthorizations = data.map(
    (supplierAuthorization) =>
      ({
        id: supplierAuthorization.id,
        authorized: supplierAuthorization.authorized,
        supplier_id: supplierAuthorization.supplier_id,
      } as SupplierAuthorizations)
  )

  return suppliersAuthorizations
}

export function useSuppliersAuthorizations() {
  return useQuery(
    ['suppliersAuthorizations'],
    async () => await getSuppliersAuthorizations(),
    {
      staleTime: 1000 * 60 * 5, //5 minutes
    }
  )
}
