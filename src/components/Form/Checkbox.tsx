import { forwardRef, ForwardRefRenderFunction } from 'react'
import {
  Checkbox as CheckboxChakra,
  CheckboxProps as CheckboxPropsChakra,
} from '@chakra-ui/react'

interface CheckboxProps extends CheckboxPropsChakra {}

const CheckboxBase: ForwardRefRenderFunction<HTMLInputElement, CheckboxProps> =
  ({ children, ...rest }, ref) => {
    return (
      <CheckboxChakra colorScheme="brand" ref={ref} {...rest}>
        {children}
      </CheckboxChakra>
    )
  }

export const Checkbox = forwardRef(CheckboxBase)
