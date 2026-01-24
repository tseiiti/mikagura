class Link {
  // cria lista de link dos hinos
  get_links(hymn_id) {
    let html = ''
    for (let key in Uta.HYMNS) {
      let aux = key == hymn_id ? 'active' : ''
      html += `
        <a class="dropdown-item px-2 menu-hymn menu-params ${ aux }"
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
        <li class="dropdown-item form-check ps-4">
          <input type="checkbox" class="form-check-input instrument" name="${ key }" 
            id="check_${ key }" onchange="config.instrument(this)">
          <label class="form-check-label" for="check_${ key }">${ key }</label>
        </li>`
    }
    return html
  }
}
