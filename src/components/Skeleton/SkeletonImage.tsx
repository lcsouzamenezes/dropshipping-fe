import {
  Skeleton,
  Image,
  ImageProps,
  SkeletonProps,
  ComponentWithAs,
} from '@chakra-ui/react'
import { useState } from 'react'

interface SkeletonImageProps extends ImageProps {
  src: string
  wrapperProps?: SkeletonProps
}

export function SkeletonImage({
  onLoad,
  onError,
  wrapperProps,
  ...rest
}: SkeletonImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Skeleton isLoaded={!isLoading} {...wrapperProps}>
      <Image
        onLoad={(e) => {
          setIsLoading(false)
          if (onLoad) {
            onLoad(e)
          }
        }}
        fallbackSrc="/assets/images/default-placeholder.png"
        {...rest}
      />
    </Skeleton>
  )
}
