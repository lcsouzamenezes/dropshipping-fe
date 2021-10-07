import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react';

import { FieldError } from 'react-hook-form';

import { forwardRef, ForwardRefRenderFunction } from 'react';

interface InputProps extends ChakraInputProps {
  name: string;
  label?: string;
  error?: FieldError;
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { name, label, error = null, ...rest },
  ref
) => {
  return (
    <FormControl isInvalid={!!error}>
      {!!label && (
        <FormLabel htmlFor={name} id={`${name}-label`}>
          {label}
        </FormLabel>
      )}
      <ChakraInput
        ref={ref}
        id={name}
        name={name}
        colorScheme="brand"
        focusBorderColor="brand.400"
        variant="filled"
        size="lg"
        {...rest}
        css={{
          '&::-webkit-autofill': {
            color: 'red',
          },
        }}
      />
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  );
};

export const Input = forwardRef(InputBase);
