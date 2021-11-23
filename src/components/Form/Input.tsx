import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react'

import { FieldError } from 'react-hook-form'

import { forwardRef, ForwardRefRenderFunction, ReactElement } from 'react'

interface InputProps extends ChakraInputProps {
  name: string
  label?: string
  error?: FieldError
  leftElement?: ReactElement
  rightElement?: ReactElement
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { name, label, error = null, leftElement, rightElement, ...rest },
  ref
) => {
  return (
    <FormControl isInvalid={!!error}>
      {!!label && (
        <FormLabel htmlFor={name} id={`${name}-label`}>
          {label}
        </FormLabel>
      )}
      <InputGroup size="lg">
        {leftElement && leftElement}

        <ChakraInput
          ref={ref}
          id={name}
          name={name}
          colorScheme="brand"
          focusBorderColor="brand.400"
          variant="filled"
          size="lg"
          {...rest}
        />
        {rightElement && rightElement}
      </InputGroup>
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

export const Input = forwardRef(InputBase)
