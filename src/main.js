import initGlobal from './js/global'
import initHero from './js/hero'
import initScroll from './js/scroll'
import initSlider from './js/slider'
import { $ } from './js/utils'
import './style.css'

// Hero Section
const heroEl = $('[data-hero]')
const heroImagePaths = [
  'https://cdn.pixabay.com/photo/2023/07/12/18/21/croatia-8123037_1280.jpg',
  'https://cdn.pixabay.com/photo/2020/05/24/11/14/sea-5213746_1280.jpg',
  'https://cdn.pixabay.com/photo/2021/12/29/14/47/water-6901805_1280.jpg',
  'https://cdn.pixabay.com/photo/2021/11/21/21/14/mountain-6815304_1280.jpg',
]
heroEl && initHero(heroEl, heroImagePaths)

// Slider Section
const sliderEl = $('[data-slider]')
const sliderData = [
  {
    title: 'OUR ACHIEVEMENTS',
    imgPath: 'https://cdn.pixabay.com/photo/2023/07/12/18/21/croatia-8123037_1280.jpg',
  },
  {
    title: 'OUR VALUES',
    imgPath: 'https://cdn.pixabay.com/photo/2020/05/24/11/14/sea-5213746_1280.jpg',
  },
  {
    title: 'OUR CAPABILITY',
    imgPath: 'https://cdn.pixabay.com/photo/2021/12/29/14/47/water-6901805_1280.jpg',
  },
]
sliderEl && initSlider(sliderEl, sliderData)

// Scroll Section
const scrollEl = $('[data-scroll]')
scrollEl && initScroll(scrollEl)

// after all contents generated
initGlobal()
