import gsap from 'gsap'

export const revealChars = (chars) =>
  gsap.fromTo(
    chars,
    { opacity: 0, color: '#3455fc' },
    {
      overwrite: true,
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
  )

export const imageIn = (img, cover) =>
  gsap
    .timeline()
    .fromTo(img, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' })
    .fromTo(cover, { right: '100%' }, { right: '0%' }, 0)
    .fromTo(cover, { left: '0%' }, { left: '100%', duration: 0.6 }, '<.2')
