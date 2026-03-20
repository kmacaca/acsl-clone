import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { imageIn } from '@/js/tweens'

import { $, $$ } from '@/js/utils'

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
        invalidateOnRefresh: true,
      },
    },
  )

  const revealTween = imageIn(imgs, covers)

  ScrollTrigger.create({
    trigger: container,
    animation: revealTween,
    toggleActions: 'restart reset restart reset',
  })
}

export default initScroll
