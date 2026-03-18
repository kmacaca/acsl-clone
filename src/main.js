import initHero from './js/hero'
import initScroll from './js/scroll'
import initSlider from './js/slider'
import { $ } from './js/utils'
import './style.css'

// Hero Section
const heroEl = $('[data-hero]')
const heroImagePaths = [
  'https://cdn.pixabay.com/photo/2025/01/08/14/52/beach-9319305_1280.jpg',
  'https://cdn.pixabay.com/photo/2020/05/24/11/14/sea-5213746_1280.jpg',
  'https://cdn.pixabay.com/photo/2021/12/29/14/47/water-6901805_1280.jpg',
  'https://cdn.pixabay.com/photo/2022/09/05/16/17/baltic-sea-7434540_1280.jpg',
]
heroEl && initHero(heroEl, heroImagePaths)

// Slider Section
const sliderEl = $('[data-slider]')
const sliderData = [
  {
    title: 'OUR ACHIEVEMENTS',
    imgPath: 'https://cdn.pixabay.com/photo/2025/01/08/14/52/beach-9319305_1280.jpg',
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
