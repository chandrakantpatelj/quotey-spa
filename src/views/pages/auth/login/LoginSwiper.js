// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import clsx from 'clsx'
import { useKeenSlider } from 'keen-slider/react'

const LoginSwiper = () => {
  // ** States
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // ** Hook
  const [sliderRef, instanceRef, slider] = useKeenSlider({
    slidesPerView: 1,
    initial: 0,
    loop: true,

    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
    },
    created() {
      setLoaded(true)
    }
  })

  return (
    <>
      <Box ref={sliderRef} className='keen-slider'>
        <Box className='keen-slider__slide'>
          <Box sx={{ maxWidth: 661, width: '100%', height: 'auto', m: '0px auto', overflow: 'hidden' }}>
            <img
              src='/warehouse-img/login/login-anim-1.png'
              alt='login-anim-img'
              style={{ width: '100%', height: '100%', objectFit: 'fill' }}
            />{' '}
          </Box>
        </Box>
        <Box className='keen-slider__slide'>
          <Box sx={{ maxWidth: 661, width: '100%', height: 'auto', m: '0px auto', overflow: 'hidden' }}>
            <img
              src='/warehouse-img/login/login-anim-2.png'
              alt='login-anim-img'
              style={{ width: '100%', height: '100%', objectFit: 'fill' }}
            />{' '}
          </Box>
        </Box>
        <Box className='keen-slider__slide'>
          <Box sx={{ maxWidth: 661, width: '100%', height: 'auto', m: '0px auto', overflow: 'hidden' }}>
            <img
              src='/warehouse-img/login/login-anim-3.png'
              alt='login-anim-img'
              style={{ width: '100%', height: '100%', objectFit: 'fill' }}
            />{' '}
          </Box>
        </Box>
      </Box>

      {loaded && instanceRef.current && (
        <Box className='swiper-dots'>
          {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => {
            return (
              <Badge
                key={idx}
                variant='dot'
                component='div'
                className={clsx({
                  active: currentSlide === idx
                })}
                onClick={() => {
                  instanceRef.current?.moveToIdx(idx)
                }}
              ></Badge>
            )
          })}
        </Box>
      )}
    </>
  )
}

export default LoginSwiper
