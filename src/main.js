import initHero from './js/hero'
import { $ } from './js/utils'
import './style.css'

const heroEl = $('[data-hero]')
const imagePaths = [
  'https://cdn.pixabay.com/photo/2025/01/08/14/52/beach-9319305_1280.jpg',
  'https://cdn.pixabay.com/photo/2020/05/24/11/14/sea-5213746_1280.jpg',
  'https://cdn.pixabay.com/photo/2021/12/29/14/47/water-6901805_1280.jpg',
  'https://cdn.pixabay.com/photo/2022/09/05/16/17/baltic-sea-7434540_1280.jpg',
]
initHero(heroEl, imagePaths)
