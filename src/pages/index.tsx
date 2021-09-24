import {
  Flex,
  Button,
  Stack,
  Image,
  useColorModeValue,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Input } from '../components/Form/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface SignInFormData {
  email: string;
  password: string;
}

const signInFormSchema = yup.object({
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
  password: yup.string().required('Senha obrigatória'),
});

export default function SignIn() {
  const bg = useColorModeValue('gray.100', 'gray.900');

  const { register, handleSubmit, formState } = useForm<SignInFormData>({
    resolver: yupResolver(signInFormSchema),
    mode: 'onBlur',
  });

  const { errors } = formState;

  const handleSignIn: SubmitHandler<SignInFormData> = async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(values);
  };

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
        // bg="gray.800"
        bg={bg}
        p="8"
        borderRadius={8}
        flexDir="column"
        action="/dashboard"
        onSubmit={handleSubmit(handleSignIn)}
      >
        <Stack spacing="4">
          <Input
            label="E-mail"
            name="email"
            type="email"
            error={errors.email}
            {...register('email')}
          />
          <Input
            label="Senha"
            name="password"
            type="password"
            error={errors.password}
            {...register('password')}
          />
        </Stack>
        <Button
          colorScheme="brand"
          type="submit"
          mt="6"
          size="lg"
          isLoading={formState.isSubmitting}
        >
          Entrar
        </Button>
      </Flex>
    </Flex>
  );
}
