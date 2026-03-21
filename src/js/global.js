import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { revealChars } from './tweens'
import { $, $$, getTemplateClone, getCssVar } from './utils'

gsap.registerPlugin(SplitText, ScrollTrigger)

const initGlobal = () => {
  // headline
  $$('[data-headline]').forEach((el) => {
    const split = new SplitText(el, { type: 'chars' })

    ScrollTrigger.create({
      trigger: el,
      onEnter: () =>
        gsap
          .timeline({
            onComplete: () => split.revert(),
          })
          .add(revealChars(split.chars)),
      once: true,
    })
  })

  // link
  $$('[data-link]').forEach((link) => {
    const text = $('[data-link-text]', link)
    const split = new SplitText(text, { type: 'chars' })
    let isAnimating = false

    link.addEventListener('mouseenter', () => {
      if (isAnimating) {
        return
      }

      isAnimating = true
      gsap.to(split.chars, {
        onComplete: () => (isAnimating = false),
        stagger: {
          amount: 0.4,
          from: 'random',
          onStart() {
            gsap.to(this.targets()[0], {
              opacity: 0,
              yoyo: true,
              repeat: 1,
              duration: 0.2,
              ease: 'power1.inOut',
            })
          },
        },
      })
    })
  })

  // button
  $$('[data-button]').forEach((button) => {
    // generate button body
    const body = getTemplateClone('#button-body-template')
    const bg = $('[data-button-bg]', body)
    const text = $('[data-button-text]', body)
    const arrow = $('[data-button-arrow]', body)

    text.textContent = button.textContent
    const split = new SplitText(text, { type: 'chars' })
    button.innerHTML = ''
    button.appendChild(body)

    body.addEventListener('mouseenter', () => {
      const rollUp = (target) =>
        gsap
          .timeline()
          .to(target, { color: getCssVar('--color-primary'), duration: 0.2 })
          .to(
            target,
            {
              opacity: -1,
              yPercent: -200,
              duration: 0.2,
              modifiers: {
                opacity: gsap.utils.wrapYoyo(0, 1),
                yPercent: gsap.utils.wrap(-100, 100),
              },
            },
            '<.1',
          )

      gsap
        .timeline()
        .to(bg, { xPercent: 100, duration: 0.8, overwrite: true, ease: 'expo.out' })
        .to(
          split.chars,
          {
            stagger: {
              amount: 0.1,
              from: 'random',
              onStart() {
                rollUp(this.targets()[0])
              },
            },
          },
          0,
        )
        .add(rollUp(arrow), '<.1')
    })

    body.addEventListener('mouseleave', () => {
      const reveal = (target) =>
        gsap
          .timeline()
          .to(target, { opacity: 0 })
          .set(target, { color: '#fff' })
          .to(target, { opacity: 1 })
          .duration(0.5)

      gsap
        .timeline()
        .to(bg, {
          xPercent: 200,
          duration: 0.8,
          overwrite: true,
          ease: 'expo.out',
          onComplete: () => {
            gsap.set(bg, { xPercent: 0 })
          },
        })
        .to(
          split.chars,
          {
            stagger: {
              amount: 0.1,
              from: 'random',
              onStart() {
                reveal(this.targets()[0])
              },
            },
          },
          0,
        )
        .add(reveal(arrow), '<.1')
    })
  })
}

export default initGlobal
