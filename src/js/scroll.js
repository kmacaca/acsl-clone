import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { $, $$ } from './utils'

gsap.registerPlugin(ScrollTrigger)

const initScroll = (el) => {
  const container = $('[data-scroll-container]', el)
  const imgs = $$('[data-scroll-img]', el)
  const covers = $$('[data-scroll-cover]', el)

  gsap.fromTo(
    imgs,
    { yPercent: (i) => [20, 50, 40][i] },
    {
      yPercent: (i) => [-20, -50, -40][i],
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
      },
    },
  )

  const revealTween = gsap
    .timeline()
    .fromTo(imgs, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
    .to(covers, { right: '0%' }, '<')
    .to(covers, { left: '100%', duration: 0.6 }, '<.2')

  ScrollTrigger.create({
    trigger: container,
    animation: revealTween,
    toggleActions: 'restart reset restart reset',
  })
}

export default initScroll
