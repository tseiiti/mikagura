class Config {
  constructor() {
    let aux = JSON.parse(localStorage.getItem('control') || '{}')
    this.control = {}
    this.control.hymn_id = aux.hymn_id || 'hymn_00'
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
    this.link = new Link()
    this.hymn

    qs('.bpm_time').value = this.control.bpm_time
    qs('.suwari_0').value = this.control.suwari_0
    qs('.suwari_1').value = this.control.suwari_1
    qs('.suwari_2').value = this.control.suwari_2
    qs('.scroll').checked = this.control.scroll
    qs('.animation').checked = this.control.animation
    qs('.menu-instruments').innerHTML = this.link.get_instruments() + qs('.menu-instruments').innerHTML
    
    this.set_hymn()
  }

  set_hymn(hymn_id) {
    clearInterval(this.fill.interval)
    this.fill.track_icon(0)

    if (hymn_id != null) this.control.hymn_id = hymn_id
    this.hymn = new Uta(this.control.hymn_id, this.control.font_size, this.control.space_width)

    qs('.menu-hymns li').innerHTML = this.link.get_links(this.control.hymn_id)
    qs('main').innerHTML = this.hymn.get_hymn_html()
    qs('.fixed-bottom span.text-capitalize').innerHTML = ` ${ this.hymn.hymn.title }`

    qs('#chk_none').checked = true
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
    this.fill.suwari_message()
  }

  // define valor de configuração
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

  // retorna valor de configuração
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

  reset() {
    this.set_hymn()
  }

  play() {
    this.fill.play()
  }

  previous() {
    let aux = this.control.hymn_id.substr(5)
    if (aux != 'st') {
      aux = aux == '00' ? 'st' : String(parseInt(aux) - 1).padStart(2, '0')
      this.set_hymn('hymn_' + aux)
    }
  }

  next() {
    let aux = this.control.hymn_id.substr(5)
    if (aux != '12') {
      aux = aux == 'st' ? '00' : String(parseInt(aux) + 1).padStart(2, '0')
      this.set_hymn('hymn_' + aux)
    }
  }
}

// config depende da variável config
var config

document.addEventListener('DOMContentLoaded', function() {
  config = new Config()
})
