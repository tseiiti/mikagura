import { HYMN_ST, HYMN_00, HYMN_01, HYMN_02, HYMN_03, HYMN_04, HYMN_05, HYMN_06, HYMN_07, HYMN_08, HYMN_09, HYMN_10, HYMN_11, HYMN_12, } from "./hymn.js";

export class Uta {
  static HYMNS = {
    hymn_st: HYMN_ST,
    hymn_00: HYMN_00,
    hymn_01: HYMN_01,
    hymn_02: HYMN_02,
    hymn_03: HYMN_03,
    hymn_04: HYMN_04,
    hymn_05: HYMN_05,
    hymn_06: HYMN_06,
    hymn_07: HYMN_07,
    hymn_08: HYMN_08,
    hymn_09: HYMN_09,
    hymn_10: HYMN_10,
    hymn_11: HYMN_11,
    hymn_12: HYMN_12,
  }

  static SEARCHES = [
    'kokonotsu,', 'tsu,', 'xkan', 'xten',
    'jyo', 'jyu', 'nya', 'ryo', 'shi', 'sho', 'tsu', 'tya', 'tyo',
    '\\(a\\)', '\\(o\\)', '\\(e\\)', '\\(i\\)', '\\(u\\)', '\\(n\\)', 'do,', 'de,', 'ni,',
    'ba', 'bi', 'bo', 'bu', 'da', 'de', 'do', 'fu', 'ga', 'gi', 'go', 'gu', 'ha',
    'hi', 'ho', 'ji', 'ka', 'ke', 'ki', 'ko', 'ku', 'ma', 'me', 'mi',
    'mo', 'mu', 'na', 'ne', 'ni', 'no', 'nu', 'pa', 'ra', 're', 'ri', 'ro', 'ru',
    'sa', 'se', 'so', 'su', 'ta', 'te', 'ti', 'to', 'wa', 'wo', 'xi', 'xn', 'xo',
    'ya', 'yo', 'yu', 'za', 'zo', 'zu',
    'a', 'e', 'i', 'n', 'o', 'u', '_',
  ]

  static INSTRUMENTS = [
    'hyoshigi',
    'chanpon',
    'surigane',
    'taiko',
    'kotsuzumi',
    'fue',
    'koto',
  ]

  static LANGUAGES = [
    'japanese',
    'portuguese',
    'romaji',
    'spanish',
    'english',
    'french',
    'chinese',
    'korean',
  ]

  constructor(hymn_id, mode, font_size, space_width, languages) {
    this.hymn_id     = hymn_id
    this.hymn        = Uta.HYMNS[this.hymn_id]
    this.title       = this.hymn.title
    this.mode        = mode
    this.languages   = languages
    this.font_size   = font_size
    this.space_width = space_width
    this.regexs      = []
    this.phrase
    this.first

    for (let i in Uta.SEARCHES) { this.regexs.push(new RegExp(`^${ Uta.SEARCHES[i] }`)) }
  }

  get_hymn_html() {
    this.first = true
    let html = `<h1>${ this.title }</h1>\n`

    if (this.mode == 2)
      html += this.#get_stanzas()
    else
      html += this.#get_paragraphs()

    return html
  }

  /////////////////////////////////////////////////////////////////////////////
  // Private Methods
  /////////////////////////////////////////////////////////////////////////////

  // html dos idiomas das canções
  #get_stanzas() {
    let html = ''

    if (this.hymn_id != 'hymn_st')
      html += this.#get_audio(this.hymn_id, this.hymn.links)

    let first = true
    html += '<div class="row">'
    for (let key of Uta.LANGUAGES) {
      if (this.languages[key]) {
        html += `<div class="col-md-6 poem mt-4">`
        html += `<h4>${ this.hymn[key] } (${ key })</h4>`
        for (let i in this.hymn.paragraphs) {
          let stanza = this.hymn.paragraphs[i]

          if (this.hymn_id == 'hymn_st' && first)
            html += this.#get_audio(`hymn_s${i}`, stanza[0].links)

          html += this.#get_stanza(stanza, i, key)
        }
        html += '</div>'
        first = false
      }
    }
    html += '</div>'
    return html
  }

  #get_stanza(stanza, i, key) {
    let html = `<div class="stanza stanza_${ i } mb-3">`
    for (let j in stanza) {
      let verse = stanza[j]
      html += `
      <p class="verse verse_${ j } mb-1">
        ${ verse[key] }
      </p>`
    }
    html += '</div>'
    return html
  }

  // html para notas musicais
  #get_paragraphs() {
    let html = ''
    for (let i in this.hymn.paragraphs) {
      let paragraph = this.hymn.paragraphs[i]
      let size = this.hymn.size
      html += this.#get_paragraph(paragraph, i, size)
    }
    return html
  }

  // parágrafo
  #get_paragraph(paragraph, i, size) {
    let html = `<div class="paragraph paragraph_${ i }">`
    for (let j in paragraph) {
      let line = paragraph[j]
      html += this.#get_line(line, i, j)

      if (line.message) {
        // parágrafo de mensagem sepadora
        html += `
          <div class="line" style="margin-left: calc(var(--size) * 2.3)">
            <div class="border-bottom mb-4 px-1 message" style="width: calc(var(--size) * ${ size })">
              <p class="text-end fst-italic fw-light m-1">${ line.message }</p>
            </div>
          </div>`
      }
    }
    html += '</div>'
    return html
  }

  // linha
  #get_line(line, i, j) {
    this.phrase = (line.phrase || '').replace(/ /g, '')
    let html = `<div class="line line_${ j } ${ line.pause ? 'pause' : '' }">`
    html += this.#get_first_syllable(i, j)
    if (line.pause) this.first = true

    let i1 = 0
    let i2 = 0
    while (this.phrase.length > 0) {
      let text = this.#get_syllable_text()
      if (!text) {
        console.log(this.phrase)
        return
      }
      html += `<div class="syllable syllable_${ i2 / 2 }">`
      html += this.#get_syllable_part(text, line, i, j, 1, i2, i1, line.inverse)
      text = ''
      if (line.halfs && line.halfs.indexOf(i1 + 1) != -1) {
        text = this.#get_syllable_text()
        i1 += 1
      }
      html += this.#get_syllable_part(text, line, i, j, 2, i2, i1, line.inverse)
      i1 += 1
      i2 += 2
      html += '</div>'
    }
    html += '</div>'
    return html
  }

  // sílaba - 2 partes da nota
  #get_syllable_part(text, l, i, j, p, q, r, v) {
    if (l.size < p + q) return ''

         if (text == 'xkan') text = 'kan'
    else if (text == 'xten') text = 'ten'
    else if (text == 'xi')   text = 'i'
    else if (text == 'xn')   text = 'n'
    else if (text == 'xo')   text = 'o'
    else if (text == '_')    text = ''

    let b = l.bolds && l.bolds.indexOf(r) != -1 ? 'fw-medium' : '' // fw-semibold

    let clas = `part part_${ (p == 1 && !v) || (p == 2 && v) ? '1' : '2' }`
    let data = `data-paragraph="${ i }"
      data-line="${ j }"
      data-syllable="${ q / 2 }"
      data-part="${ p }"`

    let html = `<span class="${ clas }">`
    if (l.size > p + q) {
      html += `<progress class="beat beat_${ p + q }" ${ data } value="0" max="5"></progress>`
    }
    html += `<div class="part_text ${ b }">${ text }</div>`
    html += this.#get_narimono(l, q + p - 1)
    html += '</span>'

    return html
  }

  // ícones instrumentos
  #get_narimono(line, index) {
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

  // texto da sílaba
  #get_syllable_text() {
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

  // primeiro span com 3 pontos
  #get_first_span(i, j) {
    let html = ''
    if (this.first) {
      html = `<span class="first-span paragraph_${ i } line_${ j }"><span>.</span><span>.</span><span>.</span></span>`
      this.first = false
    }
    return html
  }

  // primeira sílaba
  #get_first_syllable(i, j) {
    let html = ''
    let clas = `beat first-beat ${ this.first ? 'd-none' : '' }`
    let data = `data-paragraph="${ i }" data-line="${ j }" data-syllable="-1" data-part="1"`
    html = `
      <div class="syllable d-none d-md-block">
        <progress class="${ clas }" ${ data } value="0" max="5"></progress>
        ${ this.#get_first_span(i, j) }
      </div>`
    return html
  }

  // audio
  #get_audio(id, links) {
    let html = `
      <audio controls preload="metadata" class="me-3">
        <source src="audio/${ id }.mp3" type="audio/mpeg">
      </audio>`

    html += `
      <button type="button" class="btn p-0 border-0 me-3" data-bs-toggle="modal" 
          data-bs-target="#video_modal_${ id }_1" title="demonstração da dança otefuri">
        <i class="bi bi-youtube"></i>
      </button>
      <div class="modal fade" id="video_modal_${ id }_1" aria-labelledby="label_modal_${ id }_1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <div class="ratio ratio-16x9">
              <iframe id="yt_${ id }_1" type="text/html" 
                src="https://www.youtube.com/embed/${ links[0].link }?start=${ links[0].start }&end=${ links[0].end }&autoplay=1" 
                frameborder="0"></iframe>
            </div>
          </div>
        </div>
      </div>`
    
    html += `
      <button type="button" class="btn p-0 border-0" data-bs-toggle="modal" 
          data-bs-target="#video_modal_${ id }_2" title="canto com acompanhamento do texto">
        <i class="bi bi-collection-play-fill"></i>
      </button>
      <div class="modal fade" id="video_modal_${ id }_2" aria-labelledby="label_modal_${ id }_1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content">
            <video controls preload="metadata" height="auto" width="100%">
              <source src="video/${ id }.mp4" type="video/mp4">
            </video>
          </div>
        </div>
      </div>`
    return html
  }
}
