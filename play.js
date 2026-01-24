class Play {
  constructor(conf) {
    this.conf   = conf
    this.id     = 0 // id do interval
    this.cur    = 0 // id de beat atual
    this.ini   = 0 // id de beat inicial
    this.valor    = 1
    this.tocando  = 0
    this.flag = 0 // flag para reinicio
    this.qs_0     = 1
    this.qs_1     = 1
    this.qs_2     = 1
    // this.qs_3     = 0
    this.fsw   = false // flag suwari término
    this.beats   = qsa('progress.beat')
    this.blen    = qsa('progress.beat:not(.d-none)').length
    this.animation    = this.conf.get('animation')

    this.b // beat atual
    this.p // parágrafo do beat atual
    this.l // linha do beat atual
  }

  // get config value
  cg(p) {
    return this.conf.get(p)
  }

  // define beat atual
  bd() {
    this.b = this.beats[this.cur];         // beat atual
    if (this.b) {
      this.p = this.b.dataset.paragraph; // parágrafo do beat atual
      this.l = this.b.dataset.line;      // linha do beat atual
    }
  }

  // avança um beat
  bp() {
    this.cur += 1;
    this.bd();
  }

  // controle geral de execução
  track() {
    if (this.cur >= this.blen && !this.b && !this.fsw) {
      this.get_html(); // reset
      return false;
    }

    if (this.sts == 0) {
      this.start();
    } else if (this.sts == 1 || this.sts == 2) {
      this.track_icon(3);
    } else {
      this.play();
    }
  }

  // 3 tempos iniciais
  start() {
    this.bd();
    if (this.fsw) {
      this.play_suwari_restore();
      this.play_suwari_start();
    }
    this.track_icon(1);

    // scroll na linha
    let es = qsa(`.first-span.paragraph_${ this.p }.line_${ this.l } span`);
    if (this.cg('scroll'))
      es[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    if (this.cg('animation')) es[0].style.color = '#555';

    let i = 0;
    clearInterval(this.id);
    this.id = setInterval(function(fx) {
      i += 1;
      if (i >= 3) {
        clearInterval(this.id);
        this.ini = this.cur;
        fx.play();
        return false;
      }
      let es = qsa(`.first-span.paragraph_${ this.p }.line_${ this.l } span`);
      if (this.cg('animation')) es[i].style.color = '#555';
    }, 1000 * 60 / this.cg('bpm_time'), this);
  }

  // tocar
  play() {
    this.track_icon(2);
    this.bd();

    // marca 3 pontos iniciais
    if (this.cg('animation')) {
      qsa(`.first-span.paragraph_${ this.p }.line_${ this.l } span`)
      .forEach(f => { f.style.color = '#555'; });
    }

    // pula ocultos iniciais do parágrafo
    if (this.b.classList.contains('d-none')) this.bp();

    this.suwari_message();
    
    let i = 0;
    this.emphasis(true);
    clearInterval(this.id);
    this.id = setInterval(function(fx) {
      i += 1;
      if (this.cg('animation')) this.b.value = i;

      if (i == 5) {
        i = 0;
        fx.emphasis(false)
        fx.play_aux();
      }
    }, 100 * 60 / this.cg('bpm_time'), this);
  }

  // execução de cada beat
  play_aux() {
    let lin = qs(`.paragraph_${ this.p } .line_${ this.l }`);
    if (this.cg('scroll'))
      lin.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    let es = lin.querySelectorAll('.beat');
    if (es[es.length - 1] == this.b) {
      // pausa para início de 3 tempos
      if (lin.classList.contains('pause')) {
        if (this.play_suwari()) return;
        this.track_icon(0);
      }
    }

    // término
    this.bp();
    if (!this.b) {
      this.track_icon(3);
      return;
    }
    this.emphasis(true);
  }

  // mensagens do suwari
  suwari_message() {
    if (this.cg('hymn_id') == 'hymn_st') {
      if (this.qs_0 == 0 && this.cur > 0) this.qs_0 = 1;
      if (this.qs_1 == 0 && this.p > 1) this.qs_1 = this.qs_2 = 1;

      let es = qsa('.message p');
      es[0].innerText = `${ this.qs_0 } de ${ this.cg('suwari_0') } vezes`;
      es[1].innerText = `${ this.p >= 1 ? 1 : 0 } de 1 vez`;
      es[2].innerText = `${ this.qs_1 } de ${ this.cg('suwari_1') } vezes (de ${ this.qs_2 } de ${ this.cg('suwari_2') })`;
    }
  }

  // parada suwari
  play_suwari() {
    if (this.cg('hymn_id') != 'hymn_st') return false;

    let boolean = false;
    if (this.qs_0 < this.cg('suwari_0') && this.p == 0) {
      this.play_suwari_restore();
      this.qs_0 += 1;
      boolean = true;
    } else if (this.qs_1 < this.cg('suwari_1') && this.p == 2) {
      this.play_suwari_restore();
      this.qs_1 += 1;
      boolean = true;
    } else {
      this.fsw = false;
      if (this.qs_2 < this.cg('suwari_2') && this.p == 2) {
        this.qs_1  = 1;
        this.qs_2 += 1;
        this.cur  -= 1;
        this.fsw   = true;
      }
      this.play_suwari_final();
    }
    this.suwari_message();
    return boolean;
  }

  // restaura value do parágrafo e troca 3 pontos por beat
  play_suwari_restore() {
    for (let i = this.ini; i <= this.cur; i++) {
      this.beat[i].value = 0;
    }
    this.cur = this.ini;
    this.bd();
    this.b.classList.remove('d-none');
    let e = qs(`.first-span.paragraph_${ this.p }.line_${ this.l }`);
    e.classList.add('d-none');
  }

  // volta 3 pontos do parágrafo
  play_suwari_start() {
    this.b.classList.add('d-none');
    let e = qs(`.first-span.paragraph_${ this.p }.line_${ this.l }`);
    e.classList.remove('d-none');
    e.querySelectorAll('span').forEach(f => { f.style.color = '#ccc' });
  }

  // volta 3 pontos inicial terminado
  play_suwari_final() {
    let e = this.beat[this.ini];
    e.classList.add('d-none');
    e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`);
    e.classList.remove('d-none');
  }

  emphasis(f) {
    if (!this.cg('animation')) return;
    let e = this.b;
    if (!e) return;
    e = e.parentElement.querySelector('.part_text');
    if (e) {
      if (f) e.classList.add('fw-bold');
      else e.classList.remove('fw-bold');
    }
  }

  // status e ícone
  track_icon(sts) {
    // 0: inicio, 1: iniciando (3 tempos), 2: tocando, 3: parado
    this.sts = sts;

    qsa('.play').forEach(e => {
      if ([ 1, 2 ].includes(this.sts)) {
        e.innerHTML = '<i class="bi bi-stop-fill"></i>';
        e.title = 'parar';
      } else {
        e.innerHTML = '<i class="bi bi-play-fill"></i>';
        e.title = 'tocar';
        clearInterval(this.id);
      }
    });
  }





  // enfase_aux(e, f) {
  //   if (f) {
  //     e.classList.add('fw-bold')
  //   } else {
  //     e.classList.remove('fw-bold')
  //   }
  // }

  // enfase(f) {
  //   if (!this.animation) return
  //   let e = this.beats[this.cur]
  //   if (!e) return
  //   e = e.parentElement.querySelector('.part_text')
  //   if (e) this.enfase_aux(e, f)
  // }

  // track_icon(aux) {
  //   this.tocando = aux

  //   qsa('.play').forEach(e => {
  //     if ([ 1, 2 ].includes(this.tocando)) {
  //       e.innerHTML = '<i class="fas fa-stop"></i>'
  //       e.title = 'parar'
  //     } else {
  //       e.innerHTML = '<i class="fas fa-play"></i>'
  //       e.title = 'tocar'
  //       clearInterval(this.id)
  //     }
  //   })

  //   if (this.cur >= this.blen) {
  //     this.flag = 1
  //   }

  // }

  // start() {
  //   if (this.qs_3 == 1) {
  //     this.play_suwari_aux_1()
  //     this.play_suwari_aux_2()
  //   }
  //   this.track_icon(1)
  //   let e = this.beats[this.cur]
  //   let es = qsa(`.first-span.paragraph_${e.dataset.paragraph}.line_${e.dataset.line} span`)
  //   es[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    
  //   if (this.animation) es[0].style.color = '#555'
  //   let i = 1
  //   this.id = setInterval(function(fx) {
  //     if (i == 3) {
  //       clearInterval(fx.id)
  //       fx.inicio = fx.cur
  //       fx.play()
  //       return
  //     }
  //     e = es[i]
  //     if (fx.animation) e.style.color = '#555'
  //     i += 1
  //   }, 1000 * 60 / this.cg('bpm_time'), this)
  // }

  // play_suwari_aux_1() {
  //   for (let i = this.ini; i < this.cur; i++) {
  //     this.beats[i].value = 0
  //   }
  //   this.cur = this.ini
  //   let e = this.beats[this.cur]
  //   e.classList.remove('d-none')
  //   e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
  //   e.classList.add('d-none')
  // }

  // play_suwari_aux_2() {
  //   let e = this.beats[this.cur]
  //   e.classList.add('d-none')
  //   e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
  //   e.classList.remove('d-none')
  //   e.querySelectorAll('span').forEach(f => { f.style.color = '#ccc' })
  // }

  // play_suwari_aux_3() {
  //   let e = this.beats[this.ini]
  //   e.classList.add('d-none')
  //   e = qs(`.first-span.paragraph_${ e.dataset.paragraph }.line_${ e.dataset.line }`)
  //   e.classList.remove('d-none')
  // }

  // play_suwari() {
  //   let e = this.beats[this.cur]
  //   if (this.qs_0 < this.cg('suwari_0') && e.dataset.paragraph == 0) {
  //     this.play_suwari_aux_1()
  //     this.qs_0 += 1
  //     qsa('.mensagem p')[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
  //     return true
  //   }

  //   if (this.qs_1 < this.cg('suwari_1') && e.dataset.paragraph == 2) {
  //     this.play_suwari_aux_1()
  //     this.qs_1 += 1
  //     qsa('.mensagem p')[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
  //     return true
  //   }

  //   this.qs_3 = 0
  //   if (this.qs_2 < this.cg('suwari_2') && e.dataset.paragraph == 2) {
  //     this.qs_1 = 1
  //     this.qs_2 += 1
  //     this.qs_3 = 1
  //   }
    
  //   qsa('.mensagem p')[1].innerText = `${ e.dataset.paragraph >= 1 ? 1 : 0 } de 1 vez`
  //   this.play_suwari_aux_3()
  //   return false
  // }

  // play_aux() {
  //   let e = this.beats[this.cur]
  //   if (!e) return
  //   let lin = qs(`.paragraph_${e.dataset.paragraph} .line_${e.dataset.line}`)
  //   lin.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  //   let es = lin.querySelectorAll('.beat')
  //   if (es[es.length - 1] == e) {
  //     this.enfase(false)
  //     // this.enfase_aux(qs('.paragraph_0 .line_0 .syllable:last-child .part:last-child .part_text'), false)

  //     if (lin.classList.contains('parar')) {
  //       if (this.cg('id') == 's' && this.play_suwari()) return
  //       this.track_icon(0)
  //       this.cur += 1
  //     }
  //   }
  //   this.enfase(true)
  // }

  // play() {
  //   this.track_icon(2)

  //   let e = this.beats[this.cur]
  //   qsa(`.first-span.paragraph_${e.dataset.paragraph}.line_${e.dataset.line} span`)
  //     .forEach(f => { if (this.animation) f.style.color = '#555' })

  //   if (this.cg('id') == 's') {
  //     let es = qsa('.mensagem p')
  //     es[0].innerText = `${ this.qs_0 } de ${ this.cg('qtd_s')[0] } vezes`
  //     es[1].innerText = `${ e.dataset.paragraph >= 1 ? 1 : 0 } de 1 vez`
  //     if (e.dataset.paragraph == 2)
  //       es[2].innerText = `${ this.qs_1 } de ${ this.cg('qtd_s')[1] } vezes (de ${ this.qs_2 } de ${ this.cg('qtd_s')[2] })`
  //   }

  //   if (e.classList.contains('d-none')) this.cur += 1
  //   this.enfase(true)

  //   let delay = 100 * 60 / this.cg('bpm_time')
  //   this.id = setInterval(function(fx) {
  //     let e = fx.beats[fx.cur]
  //     if (!e) {
  //       fx.track_icon(3)
  //       return
  //     }
  //     if (fx.animation) e.value = fx.valor

  //     fx.valor += 1
  //     if (fx.valor > 5) {
  //       fx.enfase(false)
  //       fx.valor = 1
  //       fx.cur += 1

  //       fx.play_aux()
  //     }
  //   }, delay, this)
  // }

  // reset() {
  //   conf.set_hymn()
  // }

  // track() {
  //   if (this.flag == 1 && this.qs_3 == 0) {
  //     this.reset()
  //     return
  //   }
  //   if (this.tocando == 0) {
  //     this.start()
  //   } else if (this.tocando == 1 || this.tocando == 2) {
  //     this.track_icon(3)
  //   } else {
  //     this.play()
  //   }
  // }

  // previous() {
  //   let aux = this.cg('id')
  //   if (aux != 's') {
  //     conf.set_hymn(aux == '0' ? 's' : parseInt(aux) - 1)
  //   }
  // }

  // next() {
  //   let aux = this.cg('id')
  //   if (aux != '12') {
  //     conf.set_hymn(aux == 's' ? 0 : parseInt(aux) + 1)
  //   }
  // }
}
