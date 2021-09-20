import { Flex, Button, Stack, Image } from '@chakra-ui/react';

import { Input } from '../components/Form/Input';

export default function SignIn() {
  return (
    <Flex
      w="100vw"
      h="100vh"
      direction="column"
      align="center"
      justify="center"
    >
      <Image
        p="8"
        src="/logo.svg"
        fallbackSrc="https://via.placeholder.com/150x100"
        alt="Logo da Empresa"
      />
      <Flex
        as="form"
        width="100%"
        maxWidth={360}
        bg="gray.800"
        p="8"
        borderRadius={8}
        flexDir="column"
        action="/dashboard"
      >
        <Stack spacing="4">
          <Input label="E-mail" name="email" type="email" />
          <Input label="Senha" name="password" type="password" />
        </Stack>
        <Button colorScheme="yellow" type="submit" mt="6" size="lg">
          Entrar
        </Button>
      </Flex>
    </Flex>
  );
}
