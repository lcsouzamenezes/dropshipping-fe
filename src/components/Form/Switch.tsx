import {
  FormControl,
  FormLabel,
  Switch as SwitchChakra,
  SwitchProps,
} from '@chakra-ui/react'

interface CustomSwitchProps extends SwitchProps {
  title: string
  name: string
}

export function Switch({ title, name, ...rest }: CustomSwitchProps) {
  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="{name}" mb="0">
        {title}
      </FormLabel>
      <SwitchChakra colorScheme="brand" id={name} {...rest} />
    </FormControl>
  )
}
