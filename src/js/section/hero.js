import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import * as THREE from 'three'
import particlesFragmentShader from '../shaders/hero/particles/fragment.glsl'
import particlesVertexShader from '../shaders/hero/particles/vertex.glsl'
import transitionFragmentShader from '../shaders/hero/transition/fragment.glsl'
import transitionVertexShader from '../shaders/hero/transition/vertex.glsl'
import { $, $$, getTemplateClone, lerp, getCssVar } from '../utils'

gsap.registerPlugin(SplitText, DrawSVGPlugin)

const initHero = (el, imagePaths) => {
  setupTitle(el)
  setupSlider(el, imagePaths)
}

const setupTitle = (el) => {
  const title = $('[data-hero-title]', el)
  const split = new SplitText(title, { type: 'chars' })
  let isAnimating = false

  title.addEventListener('mouseenter', () => {
    if (isAnimating) {
      return
    }
    isAnimating = true

    gsap.to(split.chars, {
      onComplete() {
        isAnimating = false
      },
      stagger: {
        amount: 1.5,
        from: 'random',
        onStart() {
          gsap.to(this.targets()[0], {
            color: getCssVar('--color-primary'),
            yoyo: true,
            repeat: 3,
            duration: 0.2,
            ease: 'power1.inOut',
          })
        },
      },
    })
  })
}

const setupSlider = (el, imagePaths) => {
  const canvas = $('[data-hero-webgl]', el)
  const pagination = $('[data-hero-pagination]', el)
  const pointer = new THREE.Vector2()
  const timer = new THREE.Timer()
  let textures = []
  let currentIndex = -1
  let isAnimating = false
  let autoPlayTween, circleBgs, circleFgs, wrapIndex

  /**
   * WebGL
   */
  const sizes = {
    width: el.clientWidth,
    height: el.clientHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
  const textureLoader = new THREE.TextureLoader()
  renderer.setClearColor('#222')
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
  camera.position.set(0, 0, 10)

  const visibleSize = () => {
    const visibleH = 2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z
    const visibleW = visibleH * (sizes.width / sizes.height)
    return [visibleW, visibleH]
  }

  /**
   * Scene
   */
  // plane (slider)
  const planeGeometry = new THREE.PlaneGeometry(1, 1)
  const planeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: transitionVertexShader,
    fragmentShader: transitionFragmentShader,
    uniforms: {
      uTexture1: new THREE.Uniform(null),
      uTexture2: new THREE.Uniform(null),
      uTexture1Aspect: new THREE.Uniform(1),
      uTexture2Aspect: new THREE.Uniform(1),
      uPlaneAspect: new THREE.Uniform(sizes.width / sizes.height),
      uProgress: new THREE.Uniform(0),
      uGradeShadow: new THREE.Uniform(new THREE.Color('#001e4e')),
      uGradeMid: new THREE.Uniform(new THREE.Color('#3f79b1')),
      uGradeHigh: new THREE.Uniform(new THREE.Color('#bee5ff')),
    },
  })
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
  planeMesh.position.z = 0.1 // prevent mesh from being clipped at viewport edges during cursor-driven rotation
  planeMesh.scale.set(...visibleSize(), 1)
  scene.add(planeMesh)

  const setPlaneUniforms = (from, to) => {
    const uni = planeMaterial.uniforms
    uni.uTexture1.value = textures[from]
    uni.uTexture1Aspect.value = textures[from].image.width / textures[from].image.height
    uni.uTexture2.value = textures[to]
    uni.uTexture2Aspect.value = textures[to].image.width / textures[to].image.height
    uni.uProgress.value = 0
  }

  // particles
  const particleCount = 80
  const particlesGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = gsap.utils.random(-0.5, 0.5)
    positions[i * 3 + 1] = gsap.utils.random(-0.5, 0.5)
    positions[i * 3 + 2] = gsap.utils.random(0, 1)
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uResolution: new THREE.Uniform(new THREE.Vector2(sizes.width, sizes.height)),
      uColor: new THREE.Uniform(new THREE.Color(getCssVar('--color-primary'))),
      uDeltaZ: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
  particlesMesh.scale.set(...visibleSize(), camera.position.z)
  scene.add(particlesMesh)

  /**
   * Controls
   */
  const slideTo = (index) => {
    setPlaneUniforms(currentIndex, index)
    return gsap
      .timeline({ defaults: { duration: 3, ease: 'power2.inOut' } })
      .to(planeMaterial.uniforms.uProgress, { value: 1 })
      .to(particlesMaterial.uniforms.uDeltaZ, { value: '+=.8' }, 0)
  }

  const circleIn = (index) =>
    gsap
      .timeline()
      .set([circleBgs[index], circleFgs[index]], { autoAlpha: 1, drawSVG: '0%' })
      .to(
        gsap
          .timeline({ paused: true })
          .to(circleBgs[index], { drawSVG: '100%', ease: 'none' })
          .to(circleFgs[index], { drawSVG: '100%', ease: 'none' }),
        { progress: 1, duration: 1.6 },
      )

  const circleOut = (index) =>
    gsap
      .timeline()
      .to(circleFgs[index], { drawSVG: '100% 100%', duration: 0.2 })
      .to(circleBgs[index], { drawSVG: '100% 100%', duration: 0.6 })

  const startProgress = (index) => gsap.to(circleFgs[index], { drawSVG: '85% 100%', ease: 'none', duration: 4 })

  const goTo = (index) => {
    index = wrapIndex(index)

    if (isAnimating || currentIndex === index) {
      return
    }

    autoPlayTween?.kill()
    isAnimating = true

    const tl = gsap.timeline({ onComplete: () => goTo(index + 1) })

    if (currentIndex >= 0) {
      tl.add(circleOut(currentIndex)).add(slideTo(index), '>-.8')
    } else {
      setPlaneUniforms(index, index)
    }

    tl.add(circleIn(index), currentIndex >= 0 ? '>-1.8' : '+=0')
      .add('animationEnd')
      .add(startProgress(index), '>')
      .call(() => (isAnimating = false), null, 'animationEnd')

    currentIndex = index
    autoPlayTween = tl
  }

  /**
   * Events
   */
  const onResize = () => {
    sizes.width = el.clientWidth
    sizes.height = el.clientHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // materials
    planeMaterial.uniforms.uPlaneAspect.value = sizes.width / sizes.height
    planeMesh.scale.set(...visibleSize(), 1)
    particlesMaterial.uniforms.uResolution.value.set(sizes.width, sizes.height)
    particlesMesh.scale.set(...visibleSize(), camera.position.z)

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
  }

  const onPointerMove = (e) => {
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  let loadedCount = 0
  const onLoadTexture = () => {
    loadedCount++

    if (loadedCount === imagePaths.length) {
      textures = textures.filter(Boolean)

      if (!textures.length) {
        return
      }

      // generate pagination dots
      textures.forEach((_, i) => {
        const dot = getTemplateClone('#hero-dot-template')
        dot.addEventListener('click', () => goTo(i))
        pagination.appendChild(dot)
      })

      circleBgs = $$('[data-hero-circle-bg]', pagination)
      circleFgs = $$('[data-hero-circle-fg]', pagination)
      wrapIndex = gsap.utils.wrap(0, textures.length)

      // start slider
      goTo(0)
    }
  }

  /**
   * Animation
   */
  const tick = (time) => {
    timer.update(time)
    const elapsed = timer.getElapsed()

    particlesMaterial.uniforms.uTime.value = elapsed
    planeMesh.rotation.x = lerp(planeMesh.rotation.x, pointer.y * 0.02, 0.05)
    planeMesh.rotation.y = lerp(planeMesh.rotation.y, -pointer.x * 0.02, 0.05)
    particlesMesh.rotation.x = lerp(particlesMesh.rotation.x, pointer.y * 0.05, 0.05)
    particlesMesh.rotation.y = lerp(particlesMesh.rotation.y, -pointer.x * 0.05, 0.05)

    renderer.render(scene, camera)

    requestAnimationFrame(tick)
  }

  /**
   * Main
   */
  window.addEventListener('resize', onResize)
  el.addEventListener('pointermove', onPointerMove)

  imagePaths.forEach((path, i) => {
    textureLoader.load(
      path,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        textures[i] = texture
        onLoadTexture()
      },
      undefined,
      () => {
        textures[i] = null
        onLoadTexture()
      },
    )
  })

  requestAnimationFrame(tick)
}

export default initHero
