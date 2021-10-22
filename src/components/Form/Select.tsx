import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select as ChakraSelect,
  SelectProps as ChakraSelectProps,
} from '@chakra-ui/react'
import { forwardRef, ForwardRefRenderFunction } from 'react'

interface SelectProps extends ChakraSelectProps {
  name: string
  label?: string
  error?: string
}

const SelectBase: ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (
  { label, name, error = null, children, ...rest },
  ref
) => {
  return (
    <FormControl isInvalid={!!error}>
      {!!label && (
        <FormLabel htmlFor={name} id={`${name}-label`}>
          {label}
        </FormLabel>
      )}
      <ChakraSelect
        variant="filled"
        colorScheme="brand"
        focusBorderColor="brand.400"
        size="lg"
        ref={ref}
        id={name}
        name={name}
        {...rest}
      >
        {children}
      </ChakraSelect>
      {!!error && <FormErrorMessage>Error vai aqui</FormErrorMessage>}
    </FormControl>
  )
}

export const Select = forwardRef(SelectBase)
