class Config {
  constructor() {
    let aux = JSON.parse(localStorage.getItem('control') ?? '{}')
    this.control = {}
    this.control.hymn_id = aux.hymn_id ?? 'hymn_00'
    this.control.mode = aux.mode ?? 1 // 1: instrumentos, 2: idiomas
    this.control.font_size = aux.font_size ?? 16
    this.control.space_width = aux.space_width  ?? 1.3
    this.control.bpm_time = aux.bpm_time ?? 60
    this.control.suwari_0 = aux.suwari_0 ?? 21
    this.control.suwari_1 = aux.suwari_1 ?? 3
    this.control.suwari_2 = aux.suwari_2 ?? 3
    this.control.scroll = aux.scroll ?? true
    this.control.animation = aux.animation ?? true
    this.control.instruments = aux.instruments ?? { 'fue': true }
    this.control.languages = aux.languages ?? { 'japanese': true}
    this.fill = new Fill(this)
    this.link = new Link()
    this.hymn
    this.#set_init()
    this.set_hymn()
  }

  set_hymn(hymn_id) {
    // para animação
    clearInterval(this.fill.interval)
    this.fill.track_icon(0)

    // carrega html do hino
    if (hymn_id != null) this.control.hymn_id = hymn_id
    localStorage.setItem('control', JSON.stringify(this.control))

    this.hymn = new Uta(
      this.control.hymn_id,
      this.control.mode,
      this.control.font_size,
      this.control.space_width,
      this.control.languages,
    )
    qs('main').innerHTML = this.hymn.get_hymn_html()

    // carrega html dos menus
    qs('.menu-hymns li').innerHTML = this.link.get_links()
    if (this.control.scroll)
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    qsa('.menu-hymn').forEach(e => {
      e.classList.remove('active')
    })
    qs(`.menu-hymn-${ this.control.hymn_id }`).classList.add('active')

    if (this.control.mode == 2) {
      // atualiza html modo 2 (idiomas)
      qs('#chk_inst i').classList.remove('bi-white')
      qs('#chk_lang i').classList.add('bi-white')

      qs('#video_modal').addEventListener('hidden.bs.modal', event => {
        qs('video').pause()
      })
    } else {
      // atualiza html modo 1 (instrumentos)
      this.fill = new Fill(this)
      qs('.fixed-bottom span.text-capitalize').innerHTML = ` ${ this.hymn.title }`

      for (let key of Uta.INSTRUMENTS) {
        if (this.control.instruments[key]) {
          this.#instrument_icon(key, true)
        }
      }
      this.#set('space_width', this.control.space_width)
      this.fill.suwari_message()

      qs('#chk_inst i').classList.add('bi-white')
      qs('#chk_lang i').classList.remove('bi-white')
    }
  }

  // ajuste + e -
  shift(e) {
    this.#set(e.name, this.#get(e.name) + Number(e.dataset.val))
  }

  // ajuste
  change(e) {
    if (Number(e.value) > 0)
      this.#set(e.name, Number(e.value))
  }

  // ajuste check button
  toggle(e) {
    this.#set(e.name, e.checked)
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

  // execução unitária de instrument icon
  instrument(e) {
    this.#instrument_icon(e.name, e.checked)
    this.control.instruments[e.name] = e.checked
    localStorage.setItem('control', JSON.stringify(this.control))

    // let count = 0
    // qsa('.instrument').forEach(f => { if (f.checked) count += 1 })
    // qs('#chk_all').checked  = count == Uta.INSTRUMENTS.length
    // qs('#chk_none').checked = count == 0
  }

  // execução de todos instrument icon
  instrument_all() {
    let c = qs('[name="chk_all"]')
    qsa('.instrument').forEach(e => {
      e.checked = c.checked
      this.#instrument_icon(e.name, e.checked)
      this.control.instruments[e.name] = e.checked
    })
    localStorage.setItem('control', JSON.stringify(this.control))
  }

  language(e) {
    this.control.languages[e.name] = e.checked
    localStorage.setItem('control', JSON.stringify(this.control))

    // if (qs('#chk_lang').checked)
    //   this.set_hymn()
  }

  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  // define configurações iniciais
  #set_init() {
    qs('.bpm_time').value = this.control.bpm_time
    qs('.suwari_0').value = this.control.suwari_0
    qs('.suwari_1').value = this.control.suwari_1
    qs('.suwari_2').value = this.control.suwari_2
    qs('.scroll').checked = this.control.scroll
    qs('.animation').checked = this.control.animation
    qs('.menu-instruments').innerHTML = this.link.get_instruments() + qs('.menu-instruments').innerHTML
    qs('.menu-languages').innerHTML = this.link.get_languages() + qs('.menu-languages').innerHTML

    // let count = 0
    for (let key of Uta.INSTRUMENTS) {
      if (this.control.instruments[key]) {
        qs(`input.instrument[name=${ key }]`).checked = true
        // count += 1
      }
    }
    // qs('#chk_all').checked  = count == Uta.INSTRUMENTS.length
    // qs('#chk_none').checked = count == 0

    for (let key of Uta.LANGUAGES) {
      if (this.control.languages[key]) {
        qs(`input.language[name=${ key }]`).checked = true
      }
    }

    this.#set('font_size', this.control.font_size)
    // if (this.control.mode == 2) qs('#chk_lang').checked = true
    // else qs('#chk_inst').checked = true
  }

  // alterna visualização de ícones de instrumentos
  #instrument_icon(key, val) {
    qs(`input[name=${ key }]`).checked = val
    qsa(`.${ key }`).forEach(e => {
      if (val) {
        e.classList.remove('d-none')
      } else {
        e.classList.add('d-none')
      }
    })
  }

  // altera propriedade css
  #property(key, val) {
    let root = document.documentElement
    root.style.setProperty(`--${key}`, val)
  }

  // define valor de configuração
  #set(key, val) {
    if (val <= 0) return

    this.control[key] = val
    localStorage.setItem('control', JSON.stringify(this.control))

    if (key == 'mode') this.set_hymn()
    if (key == 'font_size')
      this.#property('size-base', `${ val }px`)
    if (key == 'space_width') {
      this.#property('size-width-multiply', val.toFixed(2))
      val = val.toFixed(2)
    }
    if ([ 'font_size', 'space_width' ].includes(key))
      qs(`.${ key }`).innerText = val
  }

  // retorna valor de configuração
  #get(key) {
    return this.control[key]
  }
}

// a classe Config e Link depende da variável config
var config
document.addEventListener('DOMContentLoaded', function() {
  config = new Config()
})
