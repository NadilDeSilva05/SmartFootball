'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Components
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Styled Components
const MaskImg = styled('img')({
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const Illustrations = props => {
  // Props
  const { image1, image2, maskImg, mode } = props

  // States
  const [mounted, setMounted] = useState(false)

  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  // Hook
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const maskBackground = useImageVariant(mode, lightImg, darkImg)

  useEffect(() => {
    setMounted(true)
  }, [])

  function isImageObj(obj) {
    return obj && typeof obj === 'object' && 'src' in obj
  }

  if (!hidden) {
    return (
      <>
        {typeof image1 === 'undefined' || isImageObj(image1) ? (
          <img
            alt={image1?.alt || 'tree-1'}
            src={image1?.src || '/images/illustrations/objects/tree-1.png'}
            className={image1?.className || 'absolute inline-start-0 block-end-0'}
            width={image1?.width}
            height={image1?.height || 200}
          />
        ) : (
          image1
        )}
        {typeof maskImg === 'undefined' || isImageObj(maskImg) ? (
          <MaskImg
            alt={maskImg?.alt || 'mask'}
            src={mounted ? maskImg?.src || maskBackground : lightImg}
            className={maskImg?.className}
            width={maskImg?.width}
            height={maskImg?.height}
          />
        ) : (
          maskImg
        )}
        {typeof image2 === 'undefined' || isImageObj(image2) ? (
          <img
            alt={image2?.alt || 'tree-2'}
            src={image2?.src || '/images/illustrations/objects/tree-2.png'}
            className={image2?.className || 'absolute inline-end-0 block-end-0'}
            width={image2?.width}
            height={image2?.height || 200}
          />
        ) : (
          image2
        )}
      </>
    )
  } else {
    return null
  }
}

export default Illustrations
