class Config {
  constructor() {
    let aux = JSON.parse(localStorage.getItem('control') || '{}')
    this.control = {}
    this.control.hymn_id = aux.hymn_id || '0'
    this.control.font_size = aux.font_size || 16
    this.control.space_width = aux.space_width  || 1.3
    this.control.bpm_time = aux.bpm_time || 60
    this.control.suwari_0 = aux.suwari_0 || 21
    this.control.suwari_1 = aux.suwari_1 || 3
    this.control.suwari_2 = aux.suwari_2 || 3
    this.control.scroll = !(aux.scroll == false)
    this.control.animation = !(aux.animation == false)
    this.control.instruments = aux.instruments || {}
    this.fill = new Fill(this)
    this.hymn

    qs('.bpm_time').value = this.control.bpm_time
    qs('.suwari_0').value = this.control.suwari_0
    qs('.suwari_1').value = this.control.suwari_1
    qs('.suwari_2').value = this.control.suwari_2
    qs('.scroll').checked = this.control.scroll
    qs('.animation').checked = this.control.animation
    qs('.menu-instruments').innerHTML = this.get_instruments() + qs('.menu-instruments').innerHTML
    
    this.set_hymn()
  }

  set_hymn(hymn_id) {
    clearInterval(this.fill.interval)
    this.fill.track_icon(0)

    if (hymn_id != null) this.control.hymn_id = hymn_id
    this.hymn = new Uta(this.control.hymn_id, this.control.font_size, this.control.space_width)

    qs('.menu-hymns li').innerHTML = this.get_links()
    qs('main').innerHTML = this.hymn.get_hymn_html()
    qs('.fixed-bottom span.text-capitalize').innerHTML = ` ${ this.hymn.hymn.title }`

    if (this.control.hymn_id == 's') {
      let es = qsa('.message p')
      es[0].innerText = `0 de ${ this.control.suwari_0 } vezes`
      es[1].innerText = `0 de 1 vez`
      es[2].innerText = `0 de ${ this.control.suwari_1 } vezes ( de 0 de ${ this.control.suwari_2 } )`
    }

    for (let key of Uta.INSTRUMENTS) {
      if (this.control.instruments[key]) {
        qs(`input[name=${ key }]`).checked = true
        this.instrument(qs(`input[name=${ key }]`))
      }
    }
    
    this.set('font_size', this.control.font_size)
    this.set('space_width', this.control.space_width)
    
    if (this.control.scroll)
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })

    this.fill = new Fill(this)
  }

  set(key, val) {
    this.control[key] = val
    localStorage.setItem('control', JSON.stringify(this.control)) 

    if ([ 'font_size', 'space_width' ].includes(key)) {
      if (key == 'font_size') this.property('size-base', `${ val }px`)
      if (key == 'space_width') {
        this.property('size-width-multiply', val)
        val = val.toFixed(2)
      }
      qs(`.${ key }`).innerText = val
    }
  }

  get(key) {
    return this.control[key]
  }

  // ajuste + e -
  shift(e) {
    this.set(e.name, this.get(e.name) + Number(e.dataset.val))
  }

  // ajuste
  change(e) {
    let val = Number(e.value)
    if (val > 0) this.set(e.name, val)
  }

  // ajuste radio button
  toggle(e) {
    this.set(e.name, e.checked)
  }

  // altera propriedade css
  property(key, val) {
    let root = document.documentElement
    root.style.setProperty(`--${key}`, val)
  }

  // alterna visualização de ícones de instrumentos
  instrument_icon(key, aux) {
    qs(`input[name=${ key }]`).checked = aux
    qsa(`.${ key }`).forEach(e => {
      if (aux) {
        e.classList.remove('d-none')
      } else {
        e.classList.add('d-none')
      }
    })
    this.control.instruments[key] = aux
    localStorage.setItem('control', JSON.stringify(this.control))
  }

  // execução unitária de instrument_icon
  instrument(c) {
    this.instrument_icon(c.name, c.checked)
    let count = 0
    qsa('.instrument').forEach(e => { if (e.checked) count += 1 })
    qs('#chk_all').checked  = count == Uta.INSTRUMENTS.length
    qs('#chk_none').checked = count == 0
  }

  // execução de todos instrument_icon
  instrument_all() {
    let c = qs('[name="chk_all"]')
    qsa('.instrument').forEach(e => {
      e.checked = c.checked
      this.instrument_icon(e.name, e.checked)
    })
  }
  
  // cria lista de link dos hinos
  get_links() {
    let html = ''
    for (let key in HYMNS) {
      let aux = key == 'hymn_' + this.hymn_id ? 'active' : ''
      html += `
        <a class="dropdown-item px-2 menu-hymn menu-params ${ aux }"
          href="javascript:conf.set_hymn('${ key.replace('hymn_', '') }')">
            ${ HYMNS[key].title }
        </a>
        <hr class="dropdown-divider m-0">`
    }
    return html
  }

  // cria lista de checkbox de instrumentos
  get_instruments() {
    let html = ''
    for (let key of Uta.INSTRUMENTS) {
      html += `
        <li class="dropdown-item form-check ps-4">
          <input type="checkbox" class="form-check-input instrument" name="${ key }" 
            id="check_${ key }" onchange="conf.instrument(this)">
          <label class="form-check-label" for="check_${ key }">${ key }</label>
        </li>`
    }
    return html
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
    this.animation    = this.conf.get('animation')
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

var conf
document.addEventListener('DOMContentLoaded', function() {
  conf = new Config()
})
