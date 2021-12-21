import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  Text,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react'

import MaskedInput from 'react-input-mask'

import { FieldError } from 'react-hook-form'

import { forwardRef, ForwardRefRenderFunction, ReactElement } from 'react'

interface InputProps extends ChakraInputProps {
  name: string
  label?: string
  error?: FieldError
  leftElement?: ReactElement
  rightElement?: ReactElement
  showRequiredLabel?: boolean
  mask?: string | Array<string | RegExp>
  maskPlaceholder?: null | string
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    name,
    label,
    error = null,
    leftElement,
    rightElement,
    showRequiredLabel = false,
    mask,
    maskPlaceholder = null,
    ...rest
  },
  ref
) => {
  return (
    <FormControl isInvalid={!!error}>
      {!!label && (
        <FormLabel htmlFor={name} id={`${name}-label`}>
          {label}
          {showRequiredLabel && (
            <Text as="span" color="red" ml="0.5">
              *
            </Text>
          )}
        </FormLabel>
      )}
      <InputGroup size="lg">
        {leftElement && leftElement}

        <ChakraInput
          as={mask && MaskedInput}
          ref={ref}
          id={name}
          name={name}
          colorScheme="brand"
          focusBorderColor="brand.400"
          variant="filled"
          size="lg"
          mask={mask}
          {...(mask && { maskPlaceholder })}
          {...rest}
        />
        {rightElement && rightElement}
      </InputGroup>
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

export const Input = forwardRef(InputBase)
