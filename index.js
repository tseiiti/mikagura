class Hino {
  static SEARCHES = [
    '_', 'kokonotsu,', 'ttsu,', 'ttsu', 'tsu,', 
    'cha', 'chi', 'cho', 'kka', 'kki', 'kko', 'nya', 'ppa', 'ryō', 'shi', 'sho', 'shō', 'sse', 'tsu', 
    '\\(a\\)', '\\(o\\)', '\\(e\\)', '\\(i\\)', '\\(u\\)', '\\(n\\)', 
    'do,', 'de,', 'ni,', 
    'ba', 'bi', 'bo', 'bu', 'da', 'de', 'do', 'dō', 'fu', 'fū', 'ga', 'gi', 'go', 'gu', 'ha', 
    'hi', 'ho', 'hō', 'ji', 'jo', 'jū', 'ka', 'ke', 'ki', 'ko', 'kō', 'ku', 'ma', 'me', 'mi', 
    'mo', 'mu', 'na', 'ne', 'nē', 'ni', 'no', 'nō', 'nu', 'ra', 're', 'ri', 'ro', 'rō', 'ru', 
    'sa', 'se', 'so', 'sō', 'su', 'ta', 'te', 'to', 'tō', 'wa', 'wō', 'xi', 'xo', 'ya', 'yo', 
    'yō', 'yu', 'yū', 'za', 'zo', 'zu', 
    'ō', 'i', 'o', 'n', 'e', 'u', 'a', 
  ]

  constructor(id, tamanho, espaco) {
    this.id = id
    this.dado    = HYMNS[`hino_${ this.id }`]
    this.tamanho = tamanho
    this.espaco  = espaco
    this.largura = 0
    this.regexs  = []
    this.texto

    for (let i in Hino.SEARCHES) { this.regexs.push(new RegExp(`^${ Hino.SEARCHES[i] }`)) }
  }
  
  // cria lista de link dos hinos
  get_links() {
    let html = ''
    for (let chave in HYMNS) {
      let aux = chave == 'hino_' + this.id ? 'active' : ''
      html += `
        <a class="dropdown-item px-2 menu-hymn menu-params ${ aux }"
          href="javascript:conf.set_hymn('${ chave.replace('hino_', '') }')">
            ${ HYMNS[chave].titulo }
        </a>
        <hr class="dropdown-divider m-0">`
    }
    return html
  }

  get_syllable_text() {
    let silaba = null
    for (let rg of this.regexs) {
      let m = this.texto.match(rg)
      if (m) {
        silaba = m[0]
        this.texto = this.texto.replace(rg, '')
        break
      }
    }
    return silaba
  }

  get_narimono(linha, indice) {
    let html = ''
    for (let chave of INSTRUMENTS) {
      if (linha[chave]) {
        let char = linha[chave].charAt(indice).trim()
        let aux = `${ chave == 'kotsuzumi' ? 'estica ' : '' }${ chave } `
        if (char.length > 0) {
          html += `<div class="icone ${ aux }${ chave }_${ char } d-none"></div>`
        } else {
          html += `<div class="icone ${ aux }d-none"></div>`
        }
      }
    }
    return html
  }

  get_syllable_part(silaba, classes, narimono) {
    let html    = ''
    if (silaba == '_')  silaba = ''
    if (silaba == 'xi') silaba = 'i'
    if (silaba == 'xo') silaba = 'o'
    let datas = `data-paragrafo="${ classes[2][0] }"
      data-linha="${ classes[2][1] }"
      data-silaba="${ classes[2][2] }"
      data-part="${ classes[2][3] }"`

    html += `<span class="part ${ classes[0].join(' ').trim() }">`
    html += `<progress class="${ classes[1].join(' ').trim() }" ${ datas } value="0" max="5">`
    html += `</progress><div class="texto">${ silaba }</div>`
    html += narimono
    html += '</span>'

    return html
  }

  get_line(linha, i, j) {
    this.texto = (linha.texto || '').replace(/ /g, '')
    let html   = ''

    let id1 = 0
    let id2 = 0
    while (this.texto.length > 0) {
      let silaba = this.get_syllable_text()
      if (!silaba) {
        console.log(this.texto)
        return
      }
      html += `<div class="silaba silaba_${ id2 / 2 }">`
      
      let classes = [ 
        [
          [ `part_${ linha.inverso ? '2' : '1' }`, linha.fim && linha.fim == id1 ? 'fim' : null ], 
          [ linha.fim && linha.fim == id1 ? null : `tempo tempo_${ id2 + 1 }` ], 
          [ i, j, id2 / 2, 1 ], 
        ], [
          [ `part_${ linha.inverso ? '1' : '2' }`, linha.fim && linha.fim == id1 ? 'd-none' : null ], 
          [ `tempo tempo_${ id2 + 2 }` ], 
          [ i, j, id2 / 2, 2 ]
        ], 
      ]

      html += this.get_syllable_part(silaba, classes[0], this.get_narimono(linha, id2))
      if (linha.meios && linha.meios.indexOf(id1 + 1) != -1) {
        silaba = this.get_syllable_text(this.texto)
        html += this.get_syllable_part(silaba, classes[1], this.get_narimono(linha, id2 + 1))
        id1 += 1
      } else {
        html += this.get_syllable_part('', classes[1], this.get_narimono(linha, id2 + 1))
      }
      id1 += 1
      id2 += 2
      html += '</div>'
    }

    let aux = id2 * this.tamanho * this.espaco
    if (j > 0) aux = (id2 + 3) * this.tamanho * this.espaco
    if (aux > this.largura) this.largura = aux
    
    return html
  }

  get_hymn_html() {
    let primeiro = true
    let html = `<h1>${ this.dado.titulo }</h1>\n`
    for (let i in this.dado.paragrafos) {
      let paragrafo = this.dado.paragrafos[i]
      html += `<div class="paragrafo paragrafo_${ i }">`
      for (let j in paragrafo) {
        let linha = paragrafo[j]
        html += `<div class="linha linha_${ j } ${ linha.parar ? 'parar' : '' }">`
    
        let datas = `data-paragrafo="${ i }"
          data-linha="${ j }"
          data-silaba="${ -1}"
          data-part="${ 1 }"`

        // criar sílaba inicial
        html += `
        <div class="silaba d-none d-md-block">
          <progress class="tempo primeiro_tempo ${ primeiro ? 'd-none' : '' }" ${ datas } value="0" max="5">
          </progress>`
        if (primeiro) {
          // sílaba inicial de três pontos do hino
          html += `
            <span class="primeiro_span paragrafo_${ i } linha_${ j }">
              <span>.</span><span>.</span><span>.</span>
            </span>`
          primeiro = false
        }
        html += '</div>'
        if (linha.parar) primeiro = true

        let aux = this.get_line(linha, i, j)
        if (j < paragrafo.length - 1 || !linha.parar) {
          let div = document.createElement('div')
          div.innerHTML = aux
          let e = div.querySelector('.silaba:last-child span:last-child progress')
          if (e) e.classList.remove('tempo')
          html += div.innerHTML
        } else {
          html += aux
        }
        
        if (linha.mensagem) {
          // criar parágrafo de mensagem sepadora
          html += `
            </div><div class="linha" style="margin-left: ${ this.tamanho * this.espaco * 2.5 }px;">
            <div class="border-bottom mb-4 px-1 mensagem">
              <p class="text-end fst-italic fw-light m-1">${linha.mensagem}</p>
            </div>`
        }
        html += '</div>'
      }
      html += '</div>'
    }

    // ajuste da largura da mensagem
    let div = document.createElement('div')
    div.innerHTML = html
    div.querySelectorAll('.mensagem').forEach(e => { e.style.width = `${this.largura}px` })
    html = div.innerHTML
  
    return html
  }
}

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
    this.hino = new Hino(this.control.id, this.control.tamanho, this.control.espaco)

    qs('.menu-hymns li').innerHTML = this.hino.get_links()
    qs('main').innerHTML = this.hino.get_hymn_html()
    qs('.fixed-bottom span.text-capitalize').innerHTML = ` ${ this.hino.dado.titulo }`

    if (this.control.id == 's') {
      let es = qsa('.mensagem p')
      es[0].innerText = `0 de ${ this.control.qtd_s[0] } vezes`
      es[1].innerText = `0 de 1 vez`
      es[2].innerText = `0 de ${ this.control.qtd_s[1] } vezes ( de 0 de ${ this.control.qtd_s[2] } )`
    }

    for (let chave of INSTRUMENTS) {
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
      qs('.tamanho').innerHTML = `${ aux }px` // precisa de classe tamanho
    }
  }

  // altera largura da sílaba via css
  espaco(aux) {
    if (aux > 0.8) {
      this.property('size-width-multiply', aux.toFixed(2))
      this.set('espaco', aux)
      qs('.espaco').innerHTML = `${ aux.toFixed(2) }x` // precisa de classe espaco
    }
  }

  // define tempo de batidas por minuto
  bpm(aux) {
    if (aux > 0) {
      this.set('bpm', aux)
      qs('.bpm').value = aux // precisa de classe bpm
    }
  }

  // define animação
  anima(aux) {
    this.set('anima', aux)
    qs('.anima').checked = aux
    this.fill = new Fill(this)
  }

  // define quantidade de suwarizutome - 1a e 3a parte
  quant(i, aux) {
    if (aux > 0) {
      aux = parseInt(aux)
      let qtd_s = this.get('qtd_s')
      qtd_s[i] = aux
      this.set('qtd_s', qtd_s)
      qs(`.qs_${i}`).value = aux // precisa de classes qs_*
    }
  }

  // cria lista de checkbox de instrumentos
  get_instruments() {
    let html = ''
    for (let chave of INSTRUMENTS) {
      html += `
        <div class="form-check mx-1 my-1">
          <input type="checkbox" class="form-check-input instrumento" name="${ chave }" 
            id="check_${ chave }" onchange="conf.instrument(this)">
          <label class="form-check-label" for="check_${ chave }">${ chave }</label>
        </div>`
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
    qsa('.instrumento').forEach(e => { if (e.checked) count += 1 }) // depende de .instrumento
    qs('#chk_all').checked  = count == INSTRUMENTS.length // depende de #chk_all
    qs('#chk_none').checked = count == 0 // depende de #ch_nenhum
  }

  // execução de todos instrument_icon
  instrument_all() {
    let c = qs('[name="chk_all"]')
    qsa('.instrumento').forEach(e => {
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
    this.tempos   = qsa('progress.tempo')
    this.t_len    = qsa('progress.tempo:not(.d-none)').length
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
    let e = this.tempos[this.atual]
    if (!e) return
    e = e.parentElement.querySelector('.texto')
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
    let e = this.tempos[this.atual]
    let es = qsa(`.primeiro_span.paragrafo_${e.dataset.paragrafo}.linha_${e.dataset.linha} span`)
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
      this.tempos[i].value = 0
    }
    this.atual = this.inicio
    let e = this.tempos[this.atual]
    e.classList.remove('d-none')
    e = qs(`.primeiro_span.paragrafo_${ e.dataset.paragrafo }.linha_${ e.dataset.linha }`)
    e.classList.add('d-none')
  }

  play_suwari_aux_2() {
    let e = this.tempos[this.atual]
    e.classList.add('d-none')
    e = qs(`.primeiro_span.paragrafo_${ e.dataset.paragrafo }.linha_${ e.dataset.linha }`)
    e.classList.remove('d-none')
    e.querySelectorAll('span').forEach(f => { f.style.color = '#ccc' })
  }

  play_suwari_aux_3() {
    let e = this.tempos[this.inicio]
    e.classList.add('d-none')
    e = qs(`.primeiro_span.paragrafo_${ e.dataset.paragrafo }.linha_${ e.dataset.linha }`)
    e.classList.remove('d-none')
  }

  play_suwari() {
    let e = this.tempos[this.atual]
    if (this.qs_0 < this.gs(0) && e.dataset.paragrafo == 0) {
      this.play_suwari_aux_1()
      this.qs_0 += 1
      qsa('.mensagem p')[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      return true
    }

    if (this.qs_1 < this.gs(1) && e.dataset.paragrafo == 2) {
      this.play_suwari_aux_1()
      this.qs_1 += 1
      qsa('.mensagem p')[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
      return true
    }

    this.qs_3 = 0
    if (this.qs_2 < this.gs(2) && e.dataset.paragrafo == 2) {
      this.qs_1 = 1
      this.qs_2 += 1
      this.qs_3 = 1
    }
    
    qsa('.mensagem p')[1].innerText = `${ e.dataset.paragrafo >= 1 ? 1 : 0 } de 1 vez`
    this.play_suwari_aux_3()
    return false
  }

  play_aux() {
    let e = this.tempos[this.atual]
    if (!e) return
    let lin = qs(`.paragrafo_${e.dataset.paragrafo} .linha_${e.dataset.linha}`)
    lin.scrollIntoView({ behavior: "smooth", block: 'center', inline: "nearest" })
    let es = lin.querySelectorAll('.tempo')
    if (es[es.length - 1] == e) {
      this.enfase(false)
      // this.enfase_aux(qs('.paragrafo_0 .linha_0 .silaba:last-child .part:last-child .texto'), false)

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

    let e = this.tempos[this.atual]
    qsa(`.primeiro_span.paragrafo_${e.dataset.paragrafo}.linha_${e.dataset.linha} span`)
      .forEach(f => { if (this.anima) f.style.color = '#555' })

    if (this.cg('id') == 's') {
      let es = qsa('.mensagem p')
      es[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
      es[1].innerText = `${ e.dataset.paragrafo >= 1 ? 1 : 0 } de 1 vez`
      if (e.dataset.paragrafo == 2)
        es[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
    }

    if (e.classList.contains('d-none')) this.atual += 1
    this.enfase(true)

    let delay = 100 * 60 / this.cg('bpm')
    this.interval = setInterval(function(fx) {
      let e = fx.tempos[fx.atual]
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
