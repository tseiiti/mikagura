class Play {
  constructor(conf) {
    this.conf     = conf
    this.interval = 0
    this.atual    = 0
    this.inicio   = 0
    this.valor    = 1
    this.tocando  = 0
    this.reinicio = 0
    this.qs_0     = 1
    this.qs_1     = 1
    this.qs_2     = 1
    this.qs_3     = 0
    this.beats   = qsa('progress.beat')
    this.t_len    = qsa('progress.beat:not(.d-none)').length
    this.animation    = this.conf.get('animation')
  }

  cg(p) {
    return this.conf.get(p)
  }

  enfase_aux(e, f) {
    if (f) {
      e.classList.add('fw-bold')
    } else {
      e.classList.remove('fw-bold')
    }
  }

  enfase(f) {
    if (!this.animation) return
    let e = this.beats[this.atual]
    if (!e) return
    e = e.parentElement.querySelector('.part_text')
    if (e) this.enfase_aux(e, f)
  }

  track_icon(aux) {
    this.tocando = aux

    qsa('.play').forEach(e => {
      if ([ 1, 2 ].includes(this.tocando)) {
        e.innerHTML = '<i class="fas fa-stop"></i>'
        e.title = 'parar'
      } else {
        e.innerHTML = '<i class="fas fa-play"></i>'
        e.title = 'tocar'
        clearInterval(this.interval)
      }
    })

    if (this.atual >= this.t_len) {
      this.reinicio = 1
    }

  }

  start() {
    if (this.qs_3 == 1) {
      this.play_suwari_aux_1()
      this.play_suwari_aux_2()
    }
    this.track_icon(1)
    let e = this.beats[this.atual]
    let es = qsa(`.first-span.paragraph_${e.dataset.paragraph}.line_${e.dataset.line} span`)
    es[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    
    if (this.animation) es[0].style.color = '#555'
    let i = 1
    this.interval = setInterval(function(fx) {
      if (i == 3) {
        clearInterval(fx.interval)
        fx.inicio = fx.atual
        fx.play()
        return
      }
      e = es[i]
      if (fx.animation) e.style.color = '#555'
      i += 1
    }, 1000 * 60 / this.cg('bpm_time'), this)
  }

  play_suwari_aux_1() {
    for (let i = this.inicio; i < this.atual; i++) {
      this.beats[i].value = 0
    }
    this.atual = this.inicio
    let e = this.beats[this.atual]
    e.classList.remove('d-none')
    e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
    e.classList.add('d-none')
  }

  play_suwari_aux_2() {
    let e = this.beats[this.atual]
    e.classList.add('d-none')
    e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
    e.classList.remove('d-none')
    e.querySelectorAll('span').forEach(f => { f.style.color = '#ccc' })
  }

  play_suwari_aux_3() {
    let e = this.beats[this.inicio]
    e.classList.add('d-none')
    e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
    e.classList.remove('d-none')
  }

  play_suwari() {
    let e = this.beats[this.atual]
    if (this.qs_0 < this.cg('suwari_0') && e.dataset.paragraph == 0) {
      this.play_suwari_aux_1()
      this.qs_0 += 1
      qsa('.mensagem p')[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      return true
    }

    if (this.qs_1 < this.cg('suwari_1') && e.dataset.paragraph == 2) {
      this.play_suwari_aux_1()
      this.qs_1 += 1
      qsa('.mensagem p')[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
      return true
    }

    this.qs_3 = 0
    if (this.qs_2 < this.cg('suwari_2') && e.dataset.paragraph == 2) {
      this.qs_1 = 1
      this.qs_2 += 1
      this.qs_3 = 1
    }
    
    qsa('.mensagem p')[1].innerText = `${ e.dataset.paragraph >= 1 ? 1 : 0 } de 1 vez`
    this.play_suwari_aux_3()
    return false
  }

  play_aux() {
    let e = this.beats[this.atual]
    if (!e) return
    let lin = qs(`.paragraph_${e.dataset.paragraph} .line_${e.dataset.line}`)
    lin.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    let es = lin.querySelectorAll('.beat')
    if (es[es.length - 1] == e) {
      this.enfase(false)
      // this.enfase_aux(qs('.paragraph_0 .line_0 .syllable:last-child .part:last-child .part_text'), false)

      if (lin.classList.contains('parar')) {
        if (this.cg('id') == 's' && this.play_suwari()) return
        this.track_icon(0)
        this.atual += 1
      }
    }
    this.enfase(true)
  }

  play() {
    this.track_icon(2)

    let e = this.beats[this.atual]
    qsa(`.first-span.paragraph_${e.dataset.paragraph}.line_${e.dataset.line} span`)
      .forEach(f => { if (this.animation) f.style.color = '#555' })

    if (this.cg('id') == 's') {
      let es = qsa('.mensagem p')
      es[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      es[1].innerText = `${ e.dataset.paragraph >= 1 ? 1 : 0 } de 1 vez`
      if (e.dataset.paragraph == 2)
        es[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
    }

    if (e.classList.contains('d-none')) this.atual += 1
    this.enfase(true)

    let delay = 100 * 60 / this.cg('bpm_time')
    this.interval = setInterval(function(fx) {
      let e = fx.beats[fx.atual]
      if (!e) {
        fx.track_icon(3)
        return
      }
      if (fx.animation) e.value = fx.valor

      fx.valor += 1
      if (fx.valor > 5) {
        fx.enfase(false)
        fx.valor = 1
        fx.atual += 1

        fx.play_aux()
      }
    }, delay, this)
  }

  reset() {
    conf.set_hymn()
  }

  track() {
    if (this.reinicio == 1 && this.qs_3 == 0) {
      this.reset()
      return
    }
    if (this.tocando == 0) {
      this.start()
    } else if (this.tocando == 1 || this.tocando == 2) {
      this.track_icon(3)
    } else {
      this.play()
    }
  }

  previous() {
    let aux = this.cg('id')
    if (aux != 's') {
      conf.set_hymn(aux == '0' ? 's' : parseInt(aux) - 1)
    }
  }

  next() {
    let aux = this.cg('id')
    if (aux != '12') {
      conf.set_hymn(aux == 's' ? 0 : parseInt(aux) + 1)
    }
  }
}
