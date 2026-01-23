class Uta {
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

  static INSTRUMENTS = [
    "hyoshigi",
    "chanpon",
    "surigane",
    "taiko",
    "kotsuzumi",
    "fue",
    "koto"
  ]

  constructor(id, tamanho, espaco) {
    this.id      = id
    this.hymn    = HYMNS[`hymn_${ this.id }`]
    this.tamanho = tamanho
    this.espaco  = espaco
    this.largura = 0
    this.regexs  = []
    this.phrase
    this.first = true

    for (let i in Uta.SEARCHES) { this.regexs.push(new RegExp(`^${ Uta.SEARCHES[i] }`)) }
  }
  
  // cria lista de link dos hinos
  get_links() {
    let html = ''
    for (let key in HYMNS) {
      let aux = key == 'hymn_' + this.id ? 'active' : ''
      html += `
        <a class="dropdown-item px-2 menu-hymn menu-params ${ aux }"
          href="javascript:conf.set_hymn('${ key.replace('hymn_', '') }')">
            ${ HYMNS[key].title }
        </a>
        <hr class="dropdown-divider m-0">`
    }
    return html
  }

  // primeiro span com 3 pontos
  get_first_span(i, j) {
    let html = ''
    if (this.first) {
      html = `<span class="first-span paragraph_${ i } line_${ j }"><span>.</span><span>.</span><span>.</span></span>`
      this.first = false
    }
    return html
  }

  // primeira sílaba
  get_first_syllable(i, j) {
    let html = ''
    let clas = `beat first-beat ${ this.first ? 'd-none' : '' }`
    let data = `data-paragraph="${ i }" data-line="${ j }" data-syllable="-1" data-part="1"`
    html = `
      <div class="syllable d-none d-md-block">
        <progress class="${ clas }" ${ data } value="0" max="5"></progress>
        ${ this.get_first_span(i, j) }
      </div>`
    return html
  }

  // texto da sílaba
  get_syllable_text() {
    let text = null
    for (let rg of this.regexs) {
      let m = this.phrase.match(rg)
      if (m) {
        text = m[0]
        this.phrase = this.phrase.replace(rg, '')
        break
      }
    }
    return text
  }

  get_narimono(line, index) {
    let html = ''
    for (let key of Uta.INSTRUMENTS) {
      if (line[key]) {
        let char = line[key].charAt(index).trim()
        let aux = `${ key == 'kotsuzumi' ? 'stretch' : '' } ${ key }`
        if (char.length > 0) aux = `${ aux } ${ key }_${ char }`
        html += `<div class="icone ${ aux } d-none"></div>`
      }
    }
    return html
  }

  get_syllable_part(text, l, i, j, p, q, v) {
    if (l.size < p + q) return ''
    
    if (text == '_')  text = ''
    if (text == 'xi') text = 'i'
    if (text == 'xo') text = 'o'
    let clas = `part part_${ (p == 1 && !v) || (p == 2 && v) ? '1' : '2' }`
    let data = `data-paragraph="${ i }"
      data-line="${ j }"
      data-syllable="${ q / 2 }"
      data-part="${ p }"`

    let html = `<span class="${ clas }">`
    if (l.size > p + q) {
      html += `<progress class="beat beat_${ p + q }" ${ data } value="0" max="5"></progress>`
    }
    html += `<div class="part_text">${ text }</div>`
    html += this.get_narimono(l, q + p - 1)
    html += '</span>'

    return html
  }

  get_line(line, i, j) {
    this.phrase = (line.phrase || '').replace(/ /g, '')
    let html = `<div class="line line_${ j } ${ line.pause ? 'pause' : '' }">`
    html += this.get_first_syllable(i, j)
    if (line.pause) this.first = true

    let id1 = 0
    let id2 = 0
    while (this.phrase.length > 0) {
      let text = this.get_syllable_text()
      if (!text) {
        console.log(this.phrase)
        return
      }
      html += `<div class="syllable syllable_${ id2 / 2 }">`
      html += this.get_syllable_part(text, line, i, j, 1, id2, line.inverse)
      text = ''
      if (line.halfs && line.meios.indexOf(id1 + 1) != -1) {
        text = this.get_syllable_text()
        id1 += 1
      }
      html += this.get_syllable_part(text, line, i, j, 2, id2, line.inverse)
      id1 += 1
      id2 += 2
      html += '</div>'
    }
    html += '</div>'
    return html
  }

  get_paragraph(paragraph, i, size) {
    let html = `<div class="paragraph paragraph_${ i }">`
    for (let j in paragraph) {
      let line = paragraph[j]
      html += this.get_line(line, i, j)

      // html += `<div class="line line_${ j } ${ line.parar ? 'parar' : '' }">`
  
      // let datas = `data-paragraph="${ i }"
      //   data-line="${ j }"
      //   data-syllable="${ -1}"
      //   data-part="${ 1 }"`

      // // criar sílaba inicial
      // html += `
      // <div class="syllable d-none d-md-block">
      //   <progress class="beat first-beat ${ this.first ? 'd-none' : '' }" ${ datas } value="0" max="5">
      //   </progress>`
      // if (this.first) {
      //   // sílaba inicial de três pontos do hino
      //   html += `
      //     <span class="first-span paragraph_${ i } line_${ j }">
      //       <span>.</span><span>.</span><span>.</span>
      //     </span>`
      //   this.first = false
      // }
      // html += '</div>'
      // if (line.parar) this.first = true

      // let aux = this.get_line(line, i, j)
      // if (j < paragraph.length - 1 || !line.parar) {
      //   let div = document.createElement('div')
      //   div.innerHTML = aux
      //   let e = div.querySelector('.syllable:last-child span:last-child progress')
      //   if (e) e.classList.remove('beat')
      //   html += div.innerHTML
      // } else {
      //   html += aux
      // }
      
      // if (line.mensagem) {
      //   // criar parágrafo de mensagem sepadora
      //   html += `
      //     </div><div class="line" style="margin-left: ${ this.tamanho * this.espaco * 2.5 }px;">
      //     <div class="border-bottom mb-4 px-1 mensagem">
      //       <p class="text-end fst-italic fw-light m-1">${line.mensagem}</p>
      //     </div>`
      // }
      // html += '</div>'
    }
    html += '</div>'
    return html
  }

  get_hymn_html() {
    this.first = true
    let html = `<h1>${ this.hymn.title }</h1>\n`
    for (let i in this.hymn.paragraphs) {
      let paragraph = this.hymn.paragraphs[i]
      let size = this.hymn.size
      html += this.get_paragraph(paragraph, i, size)
    }

    // // ajuste da largura da mensagem
    // let div = document.createElement('div')
    // div.innerHTML = html
    // div.querySelectorAll('.mensagem').forEach(e => { e.style.width = `${this.largura}px` })
    // html = div.innerHTML
  
    return html
  }

  get_syllable_part_old(syllable, classes, narimono) {
    let html    = ''
    if (syllable == '_')  syllable = ''
    if (syllable == 'xi') syllable = 'i'
    if (syllable == 'xo') syllable = 'o'
    let datas = `data-paragraph="${ classes[2][0] }"
      data-line="${ classes[2][1] }"
      data-syllable="${ classes[2][2] }"
      data-part="${ classes[2][3] }"`

    html += `<span class="part ${ classes[0].join(' ').trim() }">`
    html += `<progress class="${ classes[1].join(' ').trim() }" ${ datas } value="0" max="5">`
    html += `</progress><div class="part_text">${ syllable }</div>`
    html += narimono
    html += '</span>'

    return html
  }

  get_line_old(line, i, j) {
    this.phrase = (line.phrase || '').replace(/ /g, '')
    let html   = ''

    let id1 = 0
    let id2 = 0
    while (this.phrase.length > 0) {
      let syllable = this.get_syllable_text()
      if (!syllable) {
        console.log(this.phrase)
        return
      }
      html += `<div class="syllable syllable_${ id2 / 2 }">`
      
      let classes = [ 
        [
          [ `part_${ line.inverso ? '2' : '1' }`, line.fim && line.fim == id1 ? 'fim' : null ], 
          [ line.fim && line.fim == id1 ? null : `beat beat_${ id2 + 1 }` ], 
          [ i, j, id2 / 2, 1 ], 
        ], [
          [ `part_${ line.inverso ? '1' : '2' }`, line.fim && line.fim == id1 ? 'd-none' : null ], 
          [ `beat beat_${ id2 + 2 }` ], 
          [ i, j, id2 / 2, 2 ]
        ], 
      ]

      html += this.get_syllable_part(syllable, classes[0], this.get_narimono(line, id2))
      if (line.meios && line.meios.indexOf(id1 + 1) != -1) {
        syllable = this.get_syllable_text(this.phrase)
        html += this.get_syllable_part(syllable, classes[1], this.get_narimono(line, id2 + 1))
        id1 += 1
      } else {
        html += this.get_syllable_part('', classes[1], this.get_narimono(line, id2 + 1))
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

  get_hymn_html_old() {
    let primeiro = true
    let html = `<h1>${ this.hymn.title }</h1>\n`
    for (let i in this.hymn.paragraphs) {
      let paragraph = this.hymn.paragraphs[i]
      html += `<div class="paragraph paragraph_${ i }">`
      for (let j in paragraph) {
        let line = paragraph[j]
        html += `<div class="line line_${ j } ${ line.parar ? 'parar' : '' }">`
    
        let datas = `data-paragraph="${ i }"
          data-line="${ j }"
          data-syllable="${ -1}"
          data-part="${ 1 }"`

        // criar sílaba inicial
        html += `
        <div class="syllable d-none d-md-block">
          <progress class="beat first-beat ${ primeiro ? 'd-none' : '' }" ${ datas } value="0" max="5">
          </progress>`
        if (primeiro) {
          // sílaba inicial de três pontos do hino
          html += `
            <span class="first-span paragraph_${ i } line_${ j }">
              <span>.</span><span>.</span><span>.</span>
            </span>`
          primeiro = false
        }
        html += '</div>'
        if (line.parar) primeiro = true

        let aux = this.get_line(line, i, j)
        if (j < paragraph.length - 1 || !line.parar) {
          let div = document.createElement('div')
          div.innerHTML = aux
          let e = div.querySelector('.syllable:last-child span:last-child progress')
          if (e) e.classList.remove('beat')
          html += div.innerHTML
        } else {
          html += aux
        }
        
        if (line.mensagem) {
          // criar parágrafo de mensagem sepadora
          html += `
            </div><div class="line" style="margin-left: ${ this.tamanho * this.espaco * 2.5 }px;">
            <div class="border-bottom mb-4 px-1 mensagem">
              <p class="text-end fst-italic fw-light m-1">${line.mensagem}</p>
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
