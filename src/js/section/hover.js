import { faker } from '@faker-js/faker'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { revealChars } from '../tweens'
import { $, $$, getTemplateClone, getCssVar } from '../utils'

gsap.registerPlugin(SplitText, DrawSVGPlugin, ScrollTrigger)

const initHover = (el, dataArray) => {
  const container = $('[data-hover-container]', el)
  const list = $('[data-hover-list]', el)
  const bg = $('[data-hover-bg]', el)
  const pointer = [0, 0]
  let currentIndex = -1

  dataArray.forEach((data, i) => {
    const item = getTemplateClone('#hover-item-template')
    const bgImg = getTemplateClone('#hover-bg-img-template')
    const img = $('[data-hover-item-img]', item)
    const title = $('[data-hover-item-title]', item)
    const anchor = $('[data-hover-item-anchor]', item)
    const index = $('[data-hover-item-index]', item)
    const text = $('[data-hover-item-text]', item)
    bgImg.src = data.imgPath
    img.src = data.imgPath
    title.textContent = data.title
    index.textContent = String(i + 1).padStart(2, '0')
    text.textContent = faker.lorem.sentence({ min: 8, max: 16 })
    text._split = new SplitText(text, { type: 'chars' })

    anchor.addEventListener('pointerenter', () => {
      activate(i)
    })

    list.appendChild(item)
    bg.appendChild(bgImg)
  })

  const activate = (index) => {
    if (currentIndex === index) {
      return
    }

    const tl = gsap.timeline({ defaults: { overwrite: true } })

    if (currentIndex >= 0) {
      // deactivate
      tl.to(navs[currentIndex], { opacity: 0.4, color: getCssVar('--color-text'), duration: 0.4 })
        .to(circleFgs[currentIndex], { drawSVG: '100% 100%', duration: 0.4 }, 0)
        .to(cnts[currentIndex], { autoAlpha: 0, duration: 0.2 }, 0)
        .to(bgImgs[currentIndex], { autoAlpha: 0, duration: 0.2 }, 0)
    }

    tl.to(navs[index], { opacity: 1, color: getCssVar('--color-primary') }, 0)
      .to(circleFgs[index], { drawSVG: '0% 100%' }, 0)
      .fromTo(bgImgs[index], { x: -40, opacity: 0 }, { x: 0, autoAlpha: 1, ease: 'expo.out', duration: 1 }, 0.3)
      .to(cnts[index], { autoAlpha: 1, ease: 'power1.in' }, 0.2)
      .add(revealChars($('[data-hover-item-text]', cnts[index])._split.chars), '<')
      .fromTo(
        $('[data-hover-item-bar]', cnts[index]),
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'bottom', duration: 0.8 },
        '<.2',
      )

    currentIndex = index
  }

  const navs = $$('[data-hover-item-nav]', list)
  const cnts = $$('[data-hover-item-cnt]', list)
  const circleFgs = $$('[data-hover-circle-fg]', list)
  const bgImgs = $$('[data-hover-bg-img]', bg)

  gsap.set(navs, { opacity: 0.4 })
  gsap.set(circleFgs, { drawSVG: '100% 100%' })
  gsap.set(cnts, { autoAlpha: 0 })
  gsap.set(bgImgs, { autoAlpha: 0 })

  ScrollTrigger.create({
    trigger: list,
    onEnter: () => activate(0),
    once: true,
  })

  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect()
    pointer[0] = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer[1] = -((e.clientY - rect.top) / rect.height) * 2 + 1

    gsap.to(bg, {
      rotateX: 10 * pointer[1],
      rotateY: 10 * pointer[0],
      duration: 1,
    })
  })
}

export default initHover
