import {
  Flex,
  Button,
  useColorMode,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiMoonLine, RiSunLine } from 'react-icons/ri';

export function ColorModeSwitch() {
  const { toggleColorMode, colorMode } = useColorMode();
  const iconColor = useColorModeValue('blue.700', 'yellow.400');

  return (
    <Flex mr={['6', '8']} pr={['6', '8']} py="1" borderRightWidth={1}>
      <Icon
        fontSize="20"
        cursor="pointer"
        onClick={toggleColorMode}
        color={iconColor}
        as={colorMode === 'light' ? RiMoonLine : RiSunLine}
      ></Icon>
    </Flex>
  );
}
