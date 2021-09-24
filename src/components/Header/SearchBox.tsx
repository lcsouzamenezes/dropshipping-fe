import { Flex, Input, Icon, useColorModeValue } from '@chakra-ui/react';
import { useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';

export function SearchBox() {
  const [search, setSearch] = useState('');
  const inputBackgroundColor = useColorModeValue('gray.200', 'gray.700');
  const inputPlaceholderColor = useColorModeValue('gray.400', 'gray.600');

  function handleChange(e) {
    setSearch(e.target.value);
  }

  return (
    <Flex
      as="label"
      flex="1"
      py="4"
      px="8"
      ml="6"
      maxWidth={400}
      alignSelf="center"
      color="gray.500"
      position="relative"
      bg={inputBackgroundColor}
      borderRadius="full"
      align="center"
    >
      <Input
        value={search}
        onChange={handleChange}
        name="search"
        color="gray.500"
        variant="unstyled"
        px="4"
        mr="4"
        placeholder="Buscar"
        _placeholder={{ color: inputPlaceholderColor }}
      />
      <Icon as={RiSearchLine} fontSize="20" />
    </Flex>
  );
}
