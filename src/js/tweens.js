import gsap from 'gsap'

export const revealChars = (chars) =>
  gsap.fromTo(
    chars,
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
  )
