import { useRouter } from 'next/dist/client/router';
import { useContext, useEffect, createContext, ReactNode } from 'react';
import { useDisclosure, UseDisclosureReturn } from '@chakra-ui/react';

interface SideBarDrawerProviderProps {
  children: ReactNode;
}

type SidebarDrawerContext = UseDisclosureReturn;

const SideBarDrawerContext = createContext({} as SidebarDrawerContext);

export function SideBarDrawerProvider({
  children,
}: SideBarDrawerProviderProps) {
  const disclosure = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    disclosure.onClose();
  }, [router.asPath]);

  return (
    <SideBarDrawerContext.Provider value={disclosure}>
      {children}
    </SideBarDrawerContext.Provider>
  );
}

export const useSideBarDrawer = () => useContext(SideBarDrawerContext);
