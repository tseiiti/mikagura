class Config {
  constructor() {
    let aux = localStorage.getItem('control')
    aux = aux ? JSON.parse(aux) : {}
    this.control         = {}
    this.control.id = aux.id || '0'
    this.control.tamanho = aux.tamanho || 16
    this.control.espaco  = aux.espaco  || 1.4
    this.control.instrus = aux.instrus || {}
    this.control.bpm     = aux.bpm     || 60
    this.control.anima   = aux.anima
    this.control.qtd_s   = aux.qtd_s   || [ 21, 3, 3 ]

    this.bpm(this.control.bpm)
    this.anima(this.control.anima)
    this.quant(0, this.control.qtd_s[0])
    this.quant(1, this.control.qtd_s[1])
    this.quant(2, this.control.qtd_s[2])
    qs('.menu-instruments').innerHTML = this.get_instruments() + qs('.menu-instruments').innerHTML
    
    this.hino
    this.fill
    this.set_hymn()
  }

  set_hymn(id) {
    clearInterval(this.fill.interval)
    this.fill.track_icon(0)

    if (id != null) this.control.id = id
    this.hino = new Uta(this.control.id, this.control.tamanho, this.control.espaco)

    qs('.menu-hymns li').innerHTML = this.hino.get_links()
    qs('main').innerHTML = this.hino.get_hymn_html()
    qs('.fixed-bottom span.text-capitalize').innerHTML = ` ${ this.hino.hymn.title }`

    // if (this.control.id == 's') {
    //   let es = qsa('.mensagem p')
    //   es[0].innerText = `0 de ${ this.control.qtd_s[0] } vezes`
    //   es[1].innerText = `0 de 1 vez`
    //   es[2].innerText = `0 de ${ this.control.qtd_s[1] } vezes ( de 0 de ${ this.control.qtd_s[2] } )`
    // }

    for (let chave of Uta.INSTRUMENTS) {
      if (this.control.instrus[chave]) {
        qs(`input[name=${ chave }]`).checked = true
        this.instrument(qs(`input[name=${ chave }]`))
      }
    }
    this.tamanho(this.control.tamanho)
    this.espaco(this.control.espaco)

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    })

    this.fill = new Fill(this)
  }

  set(chave, valor) {
    this.control[chave] = valor
    localStorage.setItem('control', JSON.stringify(this.control)) 
  }

  get(chave) {
    return this.control[chave]
  }

  // altera propriedade css
  property(chave, valor) {
    let root = document.documentElement
    root.style.setProperty(`--${chave}`, valor)
  }

  // altera tamanho da fonte via css
  tamanho(aux) {
    if (aux > 2) {
      this.property('size-base', `${ aux }px`)
      this.set('tamanho', aux)
      qs('.font_size').innerHTML = aux // precisa de classe tamanho
    }
  }

  // altera largura da sílaba via css
  espaco(aux) {
    if (aux > 0.8) {
      this.property('size-width-multiply', aux.toFixed(2))
      this.set('espaco', aux)
      qs('.space_width').innerHTML = aux.toFixed(2) // precisa de classe space_width
    }
  }

  // define tempo de batidas por minuto
  bpm(aux) {
    if (aux > 0) {
      this.set('bpm', aux)
      qs('.bpm_time').value = aux // precisa de classe bpm
    }
  }

  // define animação
  anima(aux) {
    this.set('anima', aux)
    qs('.animation').checked = aux
    this.fill = new Fill(this)
  }

  // define quantidade de suwarizutome - 1a e 3a parte
  quant(i, aux) {
    if (aux > 0) {
      aux = parseInt(aux)
      let qtd_s = this.get('qtd_s')
      qtd_s[i] = aux
      this.set('qtd_s', qtd_s)
      qs(`.suwari_${i}`).value = aux // precisa de classes suwari_*
    }
  }

  // cria lista de checkbox de instrumentos
  get_instruments() {
    let html = ''
    for (let chave of Uta.INSTRUMENTS) {
      html += `
        <li class="dropdown-item form-check ps-4">
          <input type="checkbox" class="form-check-input instrument" name="${ chave }" 
            id="check_${ chave }" onchange="conf.instrument(this)">
          <label class="form-check-label" for="check_${ chave }">${ chave }</label>
        </li>`
    }
    return html
  }

  // alterna visualização de ícones de instrumentos
  instrument_icon(chave, aux) {
    qs(`input[name=${ chave }]`).checked = aux
    qsa(`.${ chave }`).forEach(e => {
      if (aux) {
        e.classList.remove('d-none')
      } else {
        e.classList.add('d-none')
      }
    })
    this.control.instrus[chave] = aux
    localStorage.setItem('control', JSON.stringify(this.control))
  }

  // execução unitária de instrument_icon
  instrument(c) {
    this.instrument_icon(c.name, c.checked)
    let count = 0
    qsa('.instrument').forEach(e => { if (e.checked) count += 1 }) // depende de .instrument
    qs('#chk_all').checked  = count == Uta.INSTRUMENTS.length // depende de #chk_all
    qs('#chk_none').checked = count == 0 // depende de #ch_nenhum
  }

  // execução de todos instrument_icon
  instrument_all() {
    let c = qs('[name="chk_all"]')
    qsa('.instrument').forEach(e => {
      e.checked = c.checked
      this.instrument_icon(e.name, e.checked)
    })
  }

}

class Fill {
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
    this.anima    = this.conf.get('anima')
  }

  cg(p) {
    return this.conf.get(p)
  }

  gs(i) {
    return this.cg('qtd_s')[i]
  }

  enfase_aux(e, f) {
    if (f) {
      e.classList.add('fw-bold')
    } else {
      e.classList.remove('fw-bold')
      // e.classList.add('fw-light')
    }
  }

  enfase(f) {
    if (!this.anima) return
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
    es[0].scrollIntoView({ behavior: "smooth", block: 'center', inline: "nearest" })
    
    if (this.anima) es[0].style.color = '#555'
    let i = 1
    this.interval = setInterval(function(fx) {
      if (i == 3) {
        clearInterval(fx.interval)
        fx.inicio = fx.atual
        fx.play()
        return
      }
      e = es[i]
      if (fx.anima) e.style.color = '#555'
      i += 1
    }, 1000 * 60 / this.cg('bpm'), this);
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
    if (this.qs_0 < this.gs(0) && e.dataset.paragraph == 0) {
      this.play_suwari_aux_1()
      this.qs_0 += 1
      qsa('.mensagem p')[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      return true
    }

    if (this.qs_1 < this.gs(1) && e.dataset.paragraph == 2) {
      this.play_suwari_aux_1()
      this.qs_1 += 1
      qsa('.mensagem p')[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
      return true
    }

    this.qs_3 = 0
    if (this.qs_2 < this.gs(2) && e.dataset.paragraph == 2) {
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
    lin.scrollIntoView({ behavior: "smooth", block: 'center', inline: "nearest" })
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
      .forEach(f => { if (this.anima) f.style.color = '#555' })

    if (this.cg('id') == 's') {
      let es = qsa('.mensagem p')
      es[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      es[1].innerText = `${ e.dataset.paragraph >= 1 ? 1 : 0 } de 1 vez`
      if (e.dataset.paragraph == 2)
        es[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
    }

    if (e.classList.contains('d-none')) this.atual += 1
    this.enfase(true)

    let delay = 100 * 60 / this.cg('bpm')
    this.interval = setInterval(function(fx) {
      let e = fx.beats[fx.atual]
      if (!e) {
        fx.track_icon(3)
        return
      }
      if (fx.anima) e.value = fx.valor

      fx.valor += 1
      if (fx.valor > 5) {
        fx.enfase(false)
        fx.valor = 1
        fx.atual += 1

        fx.play_aux()
      }
    }, delay, this);
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

var conf
document.addEventListener('DOMContentLoaded', function() {
  conf = new Config()
})
