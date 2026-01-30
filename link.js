class Link {
  // cria lista de link dos hinos
  get_links() {
    let html = ''
    for (let key in Uta.HYMNS) {
      html += `
        <a class="dropdown-item px-2 menu-hymn menu-hymn-${ key }"
          href="javascript:config.set_hymn('${ key }')">
            ${ Uta.HYMNS[key].title }
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
        <li class="dropdown-item form-check ">
          <input type="checkbox" class="form-check-input instrument" name="${ key }"
            id="chk_${ key }" onchange="config.instrument(this)">
          <label class="form-check-label" for="chk_${ key }">${ key }</label>
        </li>`
    }
    return html
  }

  // cria lista de checkbox de idiomas
  get_languages() {
    let html = ''
    for (let key of Uta.LANGUAGES) {
      html += `
        <li class="dropdown-item form-check ">
          <input type="checkbox" class="form-check-input language" name="${ key }"
            id="chk_${ key }" onchange="config.language(this)">
          <label class="form-check-label" for="chk_${ key }">${ key }</label>
        </li>`
    }
    return html
  }
}
