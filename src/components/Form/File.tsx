import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Flex,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Button,
} from '@chakra-ui/react'

import { FieldError } from 'react-hook-form'
import {
  ChangeEvent,
  ChangeEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  MouseEventHandler,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

interface InputProps extends ChakraInputProps {
  name: string
  label?: string
  error?: FieldError
  showRequiredLabel?: boolean
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  { name, label, error = null, showRequiredLabel = false, ...rest },
  ref
) => {
  const [file, setFile] = useState(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => inputRef.current)

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFile(e.target.files[0])
  }

  const handleRemoveFile: MouseEventHandler<HTMLButtonElement> = () => {
    inputRef.current.value = ''
    setFile(null)
  }

  return (
    <FormControl isInvalid={!!error}>
      {!!label && (
        <Flex htmlFor={name} id={`${name}-label`} mb="2" fontWeight="medium">
          {label}
          {showRequiredLabel && (
            <Text as="span" color="red" ml="0.5">
              *
            </Text>
          )}
        </Flex>
      )}
      <ChakraInput
        type="file"
        ref={inputRef}
        id={name}
        name={name}
        variant="unstyled"
        {...rest}
        hidden
        onChange={handleFileChange}
      />
      {!file ? (
        <FormLabel cursor="pointer" htmlFor={name}>
          <Button as="span" colorScheme="brand">
            Selecionar arquivo
          </Button>
        </FormLabel>
      ) : (
        <Flex alignItems="center">
          <Text isTruncated as="i" title={file.name}>
            {file.name}
          </Text>
          <Button onClick={handleRemoveFile} colorScheme="red">
            Remover
          </Button>
        </Flex>
      )}
      {!!error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  )
}

export const File = forwardRef(InputBase)
