import { faker } from '@faker-js/faker'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { $, $$, getTemplateClone } from './utils'

gsap.registerPlugin(SplitText, ScrollTrigger)

const initSlider = (el, dataArray) => {
  const nav = $('[data-slider-nav]', el)
  const list = $('[data-slider-list]', el)

  // generate contents
  dataArray.forEach((data, i) => {
    const navItem = getTemplateClone('#slider-nav-item-template')
    const item = getTemplateClone('#slider-item-template')
    const index = String(i + 1).padStart(2, '0')

    $('[data-slider-item-index]', item).textContent = index
    const title = $('[data-slider-item-title]', item)
    title.textContent = data.title
    title._split = new SplitText(title, { type: 'chars' })
    $('[data-slider-item-img]', item).src = data.imgPath
    $('[data-slider-item-copy]', item).textContent = faker.lorem.words(5)
    $('[data-slider-item-text]', item).textContent = faker.lorem.sentences(5)
    $('[data-slider-nav-title]', navItem).textContent = data.title
    $('[data-slider-nav-index]', navItem).textContent = index

    nav.appendChild(navItem)
    list.appendChild(item)
  })

  const navItems = $$('[data-slider-nav-item]', el)
  const items = $$('[data-slider-item]', el)
  const imgs = $$('[data-slider-item-img]', el)
  const covers = $$('[data-slider-item-cover]', el)
  const cnts = $$('[data-slider-item-cnt]', el)
  const wrapIndex = gsap.utils.wrap(0, items.length)
  let currentIndex = -1
  let isAnimating = false
  let autoPlayTween

  gsap.set([imgs, covers, cnts], { autoAlpha: 0 })

  const startProgress = (index) => {
    navItems.forEach((el, i) => {
      el.classList.toggle('is-active', i === index)
    })

    return gsap.fromTo(
      $('[data-slider-nav-progress]', navItems[index]),
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: 'top',
        duration: 5,
        ease: 'linear',
      },
    )
  }

  const slideIn = (index) =>
    gsap
      .timeline()
      .set([imgs[index], covers[index], cnts[index]], { autoAlpha: 1 })
      .set(covers[index], { left: '0%', right: '100%' })
      .add('start')
      // image
      .fromTo(imgs[index], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
      .to(covers[index], { right: '0%' }, '<')
      .to(covers[index], { left: '100%', duration: 0.6 }, '<.2')
      // content
      .from(
        $$(':scope > *:not([data-slider-item-title])', cnts[index]),
        { x: -40, opacity: 0, stagger: 0.2, duration: 1 },
        'start',
      )
      .fromTo(
        $('[data-slider-item-title]', cnts[index])._split.chars,
        { opacity: 0, color: '#3455fc' },
        {
          stagger: {
            amount: 0.4,
            from: 'random',
            onStart() {
              const target = this.targets()[0]
              gsap
                .timeline()
                .to(target, { opacity: 1, ease: 'power1.inOut' })
                .to(target, { color: '#000', ease: 'power1.inOut', duration: 0.2 })
            },
          },
        },
        '<.4',
      )

  const slideOut = (index) =>
    gsap
      .timeline()
      .set(cnts[index], { autoAlpha: 0 })
      .set(covers[index], { left: '0%', right: '100%' })
      .to(covers[index], { right: '0%' })
      .to(covers[index], { left: '100%', duration: 0.3 }, '<.2')
      .fromTo(imgs[index], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.3 }, '<')

  const goTo = (index) => {
    index = wrapIndex(index)

    if (isAnimating || currentIndex === index) {
      return
    }

    autoPlayTween?.kill()
    isAnimating = true

    const tl = gsap.timeline({ onComplete: () => goTo(index + 1) })
    tl.set(cnts[index], { autoAlpha: 1 })

    if (currentIndex >= 0) {
      tl.add(slideOut(currentIndex))
    }

    tl.add('slideIn')
      .add(slideIn(index))
      .call(() => (isAnimating = false))
      .add(startProgress(index), 'slideIn')

    currentIndex = index
    autoPlayTween = tl
  }

  navItems.forEach((item, i) => {
    item.addEventListener('click', () => goTo(i))
  })

  ScrollTrigger.create({
    trigger: $('[data-slider-container]', el),
    start: 'top bottom-=120',
    onEnter: () => goTo(0),
    once: true,
  })
}

export default initSlider
