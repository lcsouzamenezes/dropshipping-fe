import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Flex,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'

import { FieldError } from 'react-hook-form'
import {
  ChangeEvent,
  ChangeEventHandler,
  forwardRef,
  ForwardRefRenderFunction,
  MouseEventHandler,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

interface InputProps extends ChakraInputProps {
  name: string
  label?: string
  error?: FieldError
  showRequiredLabel?: boolean
  labelRightElement?: ReactNode
}

const InputBase: ForwardRefRenderFunction<HTMLInputElement, InputProps> = (
  {
    name,
    label,
    error = null,
    showRequiredLabel = false,
    labelRightElement,
    ...rest
  },
  ref
) => {
  const [file, setFile] = useState(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bgColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

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
        <Flex
          htmlFor={name}
          id={`${name}-label`}
          mb="2"
          alignItems="center"
          fontWeight="medium"
        >
          {label}
          {showRequiredLabel && (
            <Text as="span" color="red" ml="0.5">
              *
            </Text>
          )}
          {labelRightElement && labelRightElement}
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
        onChange={(e) => {
          handleFileChange(e)
          if (typeof rest.onChange === 'function') {
            rest.onChange(e)
          }
        }}
      />
      {!file ? (
        <FormLabel display="inline-flex" cursor="pointer" htmlFor={name}>
          <Button as="span" colorScheme="brand">
            Selecionar arquivo
          </Button>
        </FormLabel>
      ) : (
        <Flex alignItems="center" justifyContent="space-between">
          <Text
            isTruncated
            as="i"
            bgColor={bgColor}
            p="2"
            w="100%"
            mr="2"
            borderRadius="md"
            title={file.name}
          >
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
