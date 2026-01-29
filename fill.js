class Fill {
  constructor(conf) {
    this.conf = conf
    this.id   = 0 // id do interval
    this.cur  = 0 // id de beat atual
    this.ini  = 0 // id de beat inicial
    this.i    = 0 // status
    this.sts  = 0 // status
    this.qs_0 = 0
    this.qs_1 = 0
    this.qs_2 = 0
    this.fsw  = false // flag suwari término
    this.beat = qsa('progress.beat')
    this.blen = qsa('progress.beat:not(.d-none)').length

    this.b // beat atual
    this.p // parágrafo do beat atual
    this.l // linha do beat atual
  }

  // controle geral de execução
  play() {
    if (this.cur >= this.blen && !this.b && !this.fsw) {
      this.conf.set_hymn() // reset
      return false
    }

    if (this.sts == 0) {
      this.#track_start()
    } else if (this.sts == 1) {
      this.#play_suwari_restart()
      this.track_icon(0)
    } else if (this.sts == 2) {
      this.track_icon(3)
    } else {
      this.#track()
    }
  }

  // mensagens do suwari
  suwari_message() {
    if (this.#cg('hymn_id') == 'hymn_st') {
      if (this.qs_0 == 0 && this.cur > 0) this.qs_0 = 1
      if (this.qs_1 == 0 && this.p > 1) this.qs_1 = this.qs_2 = 1

      let es = qsa('.message p')
      es[0].innerText = `${ this.qs_0 } de ${ this.#cg('suwari_0') } vezes`
      // es[1].innerText = `${ this.p >= 1 ? 1 : 0 } de 1 vez`
      es[2].innerText = `${ this.qs_1 } de ${ this.#cg('suwari_1') } vezes (de ${ this.qs_2 } de ${ this.#cg('suwari_2') })`
    }
  }

  // status e ícone
  track_icon(sts) {
    // 0: inicio, 1: iniciando (3 tempos), 2: tocando, 3: parado
    this.sts = sts

    qsa('.play').forEach(e => {
      if ([ 1, 2 ].includes(this.sts)) {
        e.innerHTML = '<i class="bi bi-stop-circle"></i>'
        e.title = 'parar a animação'
      } else {
        e.innerHTML = '<i class="bi bi-play-circle"></i>'
        e.title = 'iniciar a animação da faixa de marcação'
        clearInterval(this.id)
      }
    })
    qs('.fixed-bottom .play .bi').classList.add('bi-lg')
  }
  
  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  // 3 tempos iniciais
  #track_start() {
    this.#bd()
    if (this.fsw) {
      this.#play_suwari_loop()
      this.#play_suwari_restart()
    }
    this.track_icon(1)

    // scroll na linha
    let es = qsa(`.first-span.paragraph_${ this.p }.line_${ this.l } span`)
    if (this.#cg('scroll'))
      es[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    if (this.#cg('animation')) es[0].style.color = '#555'

    let i = 0
    clearInterval(this.id)
    this.id = setInterval(function(fx) {
      i += 1
      if (i >= 3) {
        clearInterval(fx.id)
        fx.ini = fx.cur
        fx.i = 0
        fx.#track()
        return
      }
      if (fx.#cg('animation')) es[i].style.color = '#555'
    }, 1000 * 60 / this.#cg('bpm_time'), this)
  }

  // tocar
  #track() {
    this.track_icon(2)
    this.#bd()

    // marca 3 pontos iniciais
    if (this.#cg('animation')) {
      qsa(`.first-span.paragraph_${ this.p }.line_${ this.l } span`)
      .forEach(f => { f.style.color = '#555' })
    }

    // pula ocultos iniciais do parágrafo
    if (this.b.classList.contains('d-none')) this.#bp()

    this.suwari_message()
    
    this.#emphasis(true)
    clearInterval(this.id)
    this.id = setInterval(function(fx) {
      fx.i += 1
      if (fx.#cg('animation')) fx.b.value = fx.i

      if (fx.i >= 5) {
        fx.i = 0
        fx.#emphasis(false)
        fx.#track_aux()
      }
    }, 100 * 60 / this.#cg('bpm_time'), this)
  }

  // execução de cada beat
  #track_aux() {
    let lin = qs(`.paragraph_${ this.p } .line_${ this.l }`)
    if (this.#cg('scroll'))
      lin.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    let es = lin.querySelectorAll('.beat')
    if (es[es.length - 1] == this.b) {
      // pausa para início de 3 tempos
      if (lin.classList.contains('pause')) {
        if (this.#play_suwari()) return
        this.track_icon(0)
      }
    }

    // término
    this.#bp()
    if (!this.b) {
      this.track_icon(3)
      return
    }
    this.#emphasis(true)
  }

  // parada suwari
  #play_suwari() {
    if (this.#cg('hymn_id') != 'hymn_st') return false

    let boolean = false
    if (this.qs_0 < this.#cg('suwari_0') && this.p == 0) {
      this.#play_suwari_loop()
      this.qs_0 += 1
      boolean = true
    } else if (this.qs_1 < this.#cg('suwari_1') && this.p == 2) {
      this.#play_suwari_loop()
      this.qs_1 += 1
      boolean = true
    } else {
      this.fsw = false
      if (this.qs_2 < this.#cg('suwari_2') && this.p == 2) {
        this.qs_1  = 1
        this.qs_2 += 1
        this.cur  -= 1
        this.fsw   = true
      }
      this.#play_suwari_final()
    }
    this.suwari_message()
    return boolean
  }

  // volta 3 pontos do parágrafo
  #play_suwari_restart() {
    this.b.classList.add('d-none')
    let e = qs(`.first-span.paragraph_${ this.p }.line_${ this.l }`)
    e.classList.remove('d-none')
    e.querySelectorAll('span').forEach(f => { f.style.color = '#ccc' })
  }

  // volta 3 pontos inicial terminado
  #play_suwari_final() {
    let e = this.beat[this.ini]
    e.classList.add('d-none')
    e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
    e.classList.remove('d-none')
  }

  // zera value do parágrafo e troca 3 pontos por beat
  #play_suwari_loop() {
    for (let i = this.ini; i <= this.cur; i++) {
      this.beat[i].value = 0
    }
    this.cur = this.ini
    this.#bd()
    this.b.classList.remove('d-none')
    let e = qs(`.first-span.paragraph_${ this.p }.line_${ this.l }`)
    e.classList.add('d-none')
  }

  // alterna negrito da sílaba atual
  #emphasis(f) {
    if (!this.#cg('animation')) return
    let e = this.b
    if (!e) return
    e = e.parentElement.querySelector('.part_text')
    if (e) {
      if (f) e.classList.add('fw-bold')
      else e.classList.remove('fw-bold')
    }
  }

  // get config value
  #cg(key) {
    return this.conf.control[key]
  }

  // define beat atual
  #bd() {
    this.b = this.beat[this.cur]        // beat atual
    if (this.b) {
      this.p = this.b.dataset.paragraph // parágrafo do beat atual
      this.l = this.b.dataset.line      // linha do beat atual
    }
  }

  // avança um beat
  #bp() {
    this.cur += 1
    this.#bd()
  }
}
