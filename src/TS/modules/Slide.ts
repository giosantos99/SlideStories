import Timeout from './Timeout'

class Slide {
  container
  slides
  controls
  time
  index: number
  slide: Element
  timeout: Timeout | null
  pausedTimeout: Timeout | null
  paused: boolean
  thumbItems: HTMLElement[] | null
  thumb: HTMLElement | null

  constructor (container: Element, slides: Element[], controls: Element, time: number = 5000) {

    this.container = container
    this.slides = slides
    this.controls = controls
    this.time = time

    this.index = localStorage.getItem('activeSlide')
      ? Number(localStorage.getItem('activeSlide'))
      : 0

    this.slide = this.slides[0]
    this.paused = false
    this.timeout = null
    this.pausedTimeout = null
    this.thumbItems = null
    this.thumb = null

    this.init()
  }

  hide (el: Element) {
    el.classList.remove('active')

    if (el instanceof HTMLVideoElement) {
      el.pause()
      el.currentTime = 0
    }
  }

  show (index: number) {
    this.index = index
    this.slide = this.slides[this.index]

    localStorage.setItem('activeSlide', String(this.index))

    if (this.thumbItems) {
      this.thumb = this.thumbItems[this.index]

      this.thumbItems.forEach(thumb =>
        thumb.classList.contains('active') &&
        thumb.classList.remove('active')
      )

      this.thumb.classList.add('active')
    }

    this.slides.forEach(item =>
      item.classList.contains('active') &&
      this.hide(item)
    )

    this.slides[index].classList.add('active')

    this.slide instanceof HTMLVideoElement
      ? this.autoVideo(this.slide)
      : this.auto(this.time)
  }

  autoVideo (video: HTMLVideoElement) {
    video.muted = true
    video.play()

    let firstPlay = true

    video.addEventListener('playing', () => {

      firstPlay && this.auto(video.duration * 1000)

      firstPlay = false
    })
  }

  auto (time: number) {
    this.timeout?.clear()

    this.timeout = new Timeout(() => this.next(), time)

    if (this.thumb) this.thumb.style.animationDuration = `${time}ms`
  }

  prev () {
    if (this.paused) return

    const prev = !this.index
      ? this.slides.length - 1
      : this.index - 1

    this.show(prev)
  }

  next () {
    if (this.paused) return

    const next = this.slides.length - 1 === this.index
      ? 0
      : this.index + 1

    this.show(next)
  }

  pause () {
    document.body.classList.add('paused')

    this.pausedTimeout = new Timeout(() => {
      this.timeout?.pause()

      this.paused = true

      this.thumb?.classList.add('paused')

      this.slide instanceof HTMLVideoElement && this.slide.pause()
    },300)
  }

  continue () {
    document.body.classList.remove('paused')

    this.pausedTimeout?.clear()

    if (this.paused) {
      this.paused = false

      this.auto(this.time)
      this.timeout?.continue()

      this.thumb?.classList.remove('paused')

      this.slide instanceof HTMLVideoElement && this.slide.play()
    }
  }

  private addControls () {
    const prevButton = document.createElement('button')
    const nextButton = document.createElement('button')

    prevButton.innerText = 'Slide anterior'
    nextButton.innerText = 'Próximo slide'

    this.controls.appendChild(prevButton)
    this.controls.appendChild(nextButton)

    this.controls.addEventListener('pointerdown', () => this.pause())

    document.addEventListener('pointerup', () => this.continue())
    document.addEventListener('touchend', () => this.continue())

    prevButton.addEventListener('pointerup', () => this.prev())
    nextButton.addEventListener('pointerup', () => this.next())
  }

  private addThumbItems () {
    const thumbContainer = document.createElement('div')

    thumbContainer.id = 'slide-thumb'

    this.slides.forEach(() =>
      thumbContainer.innerHTML+= `<span><span class="thumb-item"></span></span>`
    )

    this.controls.appendChild(thumbContainer)
    this.thumbItems = Array.from(this.container.querySelectorAll('.thumb-item'))
  }

  private init () {
    this.addControls()
    this.addThumbItems()
    this.show(this.index)
  }

}

export default Slide
