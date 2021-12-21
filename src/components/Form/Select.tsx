import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Select as ChakraSelect,
  SelectProps as ChakraSelectProps,
} from '@chakra-ui/react'
import { forwardRef, ForwardRefRenderFunction } from 'react'
import { FieldError } from 'react-hook-form'

interface SelectProps extends ChakraSelectProps {
  name: string
  label?: string
  error?: FieldError
  showRequiredLabel?: boolean
}

const SelectBase: ForwardRefRenderFunction<HTMLSelectElement, SelectProps> = (
  { label, name, error = null, children, showRequiredLabel = false, ...rest },
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
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

export const Select = forwardRef(SelectBase)
