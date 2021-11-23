import { Skeleton, Image, ImageProps } from '@chakra-ui/react'
import { useState } from 'react'

interface SkeletonImageProps extends ImageProps {
  src: string
}

export function SkeletonImage({
  onLoad,
  onError,
  ...rest
}: SkeletonImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Skeleton isLoaded={!isLoading}>
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
