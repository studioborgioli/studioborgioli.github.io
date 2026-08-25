/* Studio Borgioli — comportamenti del sito.
   Due sole cose: la comparsa delle sezioni allo scroll e il modulo di contatto.
   Nessuna libreria, nessuna chiamata di rete, nessun tracciamento. */

(function () {
  'use strict';

  /* --------------------------------------------------- comparsa allo scroll */
  var ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var daRivelare = document.querySelectorAll('.reveal');

  if (ridotto || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(daRivelare, function (el) { el.classList.add('visibile'); });
  } else {
    var osservatore = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) {
          v.target.classList.add('visibile');
          osservatore.unobserve(v.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    Array.prototype.forEach.call(daRivelare, function (el) { osservatore.observe(el); });
  }


  /* ----------------------------------------------------- schermata d'ingresso
     Si apre con il solo marchio. Il filetto sotto il nome si carica girando la
     rotella (o scorrendo, sul telefono); a pieno carico la schermata si
     dissolve e il sito resta libero. Si può saltare col bottone, con Invio,
     con Esc o con un clic: nessuno resta chiuso fuori. */
  var intro = document.getElementById('intro');

  function avviaDisegno() {
    document.body.classList.add('disegna');
  }

  /* Solo computer con mouse: niente soglia su telefoni e tavolette, dove
     il gesto dello scorrimento è quello con cui si legge il sito. */
  var daComputer = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 900;

  /* Quando il sito è aperto dall'icona sulla schermata del telefono si comporta
     come un'applicazione, e un'applicazione un avvio col marchio ce l'ha.
     Lì la soglia non si scorre — non c'è rotella e lo scorrimento serve a
     leggere: il filetto si carica da sé in un attimo e poi si apre. */
  var daApp = window.matchMedia('(display-mode: standalone)').matches ||
              window.matchMedia('(display-mode: fullscreen)').matches ||
              window.navigator.standalone === true;

  /* La soglia d'ingresso è un saluto, non un pedaggio: chi l'ha già vista
     entra diretto per un mese. Si segna una data sola nella memoria del
     browser di chi visita — nessun dato personale, niente che arrivi a noi.
     Se la memoria non è disponibile (navigazione in incognito, impostazioni
     restrittive) la schermata si comporta come prima. */
  var CHIAVE_INTRO = 'sb-ingresso-visto';
  var GIORNI_INTRO = 30;

  function giaVista() {
    try {
      var quando = parseInt(window.localStorage.getItem(CHIAVE_INTRO), 10);
      if (!quando) return false;
      return (Date.now() - quando) < GIORNI_INTRO * 24 * 60 * 60 * 1000;
    } catch (e) { return false; }
  }

  function segnaVista() {
    try { window.localStorage.setItem(CHIAVE_INTRO, String(Date.now())); } catch (e) {}
  }

  if (!intro) {
    avviaDisegno();
  } else if (ridotto || (!daComputer && !daApp) || (!daApp && giaVista())) {
    intro.parentNode.removeChild(intro);
    avviaDisegno();
  } else {
    var riempi = document.getElementById('introRiempi');
    var pista = document.getElementById('introPista');
    var nota = document.getElementById('introNota');
    var salta = document.getElementById('introSalta');
    var carica = 0;              /* da 0 a 1 */
    var SOGLIA = 900;            /* quanto scorrimento serve per entrare */
    var chiusa = false;

    intro.hidden = false;
    document.documentElement.classList.add('intro--bloccato');
    document.body.classList.add('intro--bloccato');

    function aggiorna() {
      var pc = Math.round(carica * 100);
      riempi.style.width = pc + '%';
      pista.setAttribute('aria-valuenow', String(pc));
      if (pc > 55 && nota && !daApp) nota.textContent = 'Ancora un poco';
      if (carica >= 1) entra();
    }

    function spingi(quanto) {
      if (chiusa) return;
      carica = Math.min(1, Math.max(0, carica + quanto / SOGLIA));
      aggiorna();
    }

    function entra() {
      if (chiusa) return;
      chiusa = true;
      riempi.style.width = '100%';
      segnaVista();
      intro.classList.add('intro--via');
      document.documentElement.classList.remove('intro--bloccato');
      document.body.classList.remove('intro--bloccato');
      avviaDisegno();
      window.setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
        var titolo = document.querySelector('.hero__title');
        if (titolo) { titolo.setAttribute('tabindex', '-1'); titolo.focus({ preventScroll: true }); }
      }, 700);
    }

    window.addEventListener('wheel', function (ev) {
      if (chiusa) return;
      ev.preventDefault();
      spingi(Math.abs(ev.deltaY) || 40);
    }, { passive: false });

    window.addEventListener('keydown', function (ev) {
      if (chiusa) return;
      if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') { entra(); return; }
      if (ev.key === 'ArrowDown' || ev.key === 'PageDown') { ev.preventDefault(); spingi(160); }
    });

    salta.addEventListener('click', entra);
    intro.addEventListener('click', function (ev) { if (ev.target === intro) entra(); });

    if (daApp) {
      /* avvio dell'applicazione: nessun gesto richiesto, un tocco basta a saltare */
      intro.classList.add('intro--app');
      if (nota) nota.textContent = 'Studio Borgioli';
      if (salta) salta.hidden = true;
      intro.addEventListener('click', entra);
      /* il filetto si carica da sé: la larghezza cambia una volta sola e ci
         pensa la transizione del CSS, poi si apre */
      window.setTimeout(function () {
        if (chiusa) return;
        riempi.style.width = '100%';
        pista.setAttribute('aria-valuenow', '100');
      }, 80);
      window.setTimeout(entra, 1700);
    } else {
      /* rete di sicurezza: dopo dodici secondi si entra comunque */
      window.setTimeout(entra, 12000);
    }
  }

  /* ------------------------------------------- ricerca fra le domande
     Filtra le domande mentre si scrive; con la casella vuota torna tutto. */
  var cerca = document.getElementById('cerca-domande');
  if (cerca) {
    var voci = Array.prototype.slice.call(document.querySelectorAll('.faq details'));
    var titoli = Array.prototype.slice.call(document.querySelectorAll('.section-title'))
      .filter(function (t) { return t.nextElementSibling && t.nextElementSibling.classList &&
                                    t.nextElementSibling.classList.contains('faq'); });
    var esito = document.getElementById('esito-ricerca');
    cerca.addEventListener('input', function () {
      var q = cerca.value.trim().toLowerCase();
      var trovate = 0;
      voci.forEach(function (v) {
        var testo = v.textContent.toLowerCase();
        var visibile = !q || testo.indexOf(q) !== -1;
        v.style.display = visibile ? '' : 'none';
        if (visibile) { trovate++; if (q) v.open = true; else v.open = false; }
      });
      titoli.forEach(function (t) {
        var faq = t.nextElementSibling;
        var almeno = Array.prototype.some.call(faq.querySelectorAll('details'), function (v) {
          return v.style.display !== 'none';
        });
        t.style.display = almeno ? '' : 'none';
      });
      if (esito) {
        esito.textContent = !q ? '' :
          (trovate ? trovate + (trovate === 1 ? ' domanda trovata' : ' domande trovate')
                   : 'Nessuna domanda trovata: provate con una parola diversa, o scriveteci.');
      }
    });
  }

  /* ------------------------------------------------------ modulo di contatto
     Il modulo non invia nulla a un server: compone un'email già scritta e apre
     il programma di posta dell'utente. Così il sito resta statico, senza
     servizi di terze parti e senza dati che transitano da qualche parte. */

  var DESTINATARIO = 'studio@studioborgioli.com';

  /* Dove finiscono davvero le richieste del modulo: un'applicazione web di
     Google Apps Script sull'account dello studio, che le scrive su un foglio e
     manda l'avviso a studio@. Se questo indirizzo è vuoto, o se l'invio non
     riesce, il modulo torna a comportarsi come prima e la persona manda il
     messaggio da sé: in nessun caso la richiesta si perde in silenzio. */
  var INDIRIZZO_RICHIESTE = 'https://script.google.com/macros/s/AKfycbwYRncGpmLfvelAGGhykGuhE5E51oH48a68rJkRMekjcDV6E2umLfNnbEjnq9nlj6TsUQ/exec';

  function erroreDi(campo) {
    return document.getElementById('e-' + campo);
  }

  function segnala(input, chiave, messaggio) {
    var box = erroreDi(chiave);
    var contenitore = input.closest('.campo');
    if (messaggio) {
      if (box) box.textContent = messaggio;
      if (contenitore) contenitore.classList.add('campo--ko');
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (box) box.textContent = '';
    if (contenitore) contenitore.classList.remove('campo--ko');
    input.removeAttribute('aria-invalid');
    return true;
  }

  function validaCampo(modulo, nome, chiave, messaggio) {
    var input = modulo.querySelector('[name="' + nome + '"]');
    if (!input) return true;
    return segnala(input, chiave, input.value.trim() ? '' : messaggio);
  }

  function validaEmail(modulo) {
    var input = modulo.querySelector('[name="email"]');
    if (!input || !input.value.trim()) return segnala(input, 'email', '');
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    return segnala(input, 'email', ok ? '' : 'Controllate l\u2019indirizzo: manca qualcosa.');
  }

  function valore(modulo, nome) {
    var el = modulo.querySelector('[name="' + nome + '"]');
    return el ? el.value.trim() : '';
  }

  function componiTesto(modulo) {
    var cond = valore(modulo, 'condominio');
    return [
      valore(modulo, 'messaggio'),
      '',
      'Nome e cognome: ' + valore(modulo, 'nome'),
      'Telefono: ' + valore(modulo, 'telefono'),
      'Email: ' + (valore(modulo, 'email') || '(non indicata)'),
      'Condominio: ' + (cond || '(non indicato)'),
      'Tipo di richiesta: ' + (valore(modulo, 'tipo') || 'Richiesta dal sito')
    ].join('\n');
  }

  /* Tre strade vere invece di una sola: WhatsApp, Gmail e il programma di posta.
     Prima il modulo apriva soltanto mailto: e su chi non ha un client di posta
     configurato non succedeva nulla. */
  function mostraEsito(modulo, inviata) {
    var testo = componiTesto(modulo);
    var cond = valore(modulo, 'condominio');
    var oggetto = '[Sito] ' + (valore(modulo, 'tipo') || 'Richiesta') + (cond ? ' \u2014 ' + cond : '');

    var wa = 'https://wa.me/393296039006?text=' + encodeURIComponent(testo);
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + DESTINATARIO +
                '&su=' + encodeURIComponent(oggetto) + '&body=' + encodeURIComponent(testo);
    var mail = 'mailto:' + DESTINATARIO + '?subject=' + encodeURIComponent(oggetto) +
               '&body=' + encodeURIComponent(testo);

    var esito = document.createElement('div');
    esito.className = 'esito';
    esito.setAttribute('role', 'status');
    esito.innerHTML =
      (inviata
        ? '<h3>Richiesta ricevuta. Vi rispondiamo entro due giorni lavorativi.</h3>' +
          '<p class="esito__nota">\u00c8 arrivata allo studio ed \u00e8 gi\u00e0 in lista. ' +
          'Se nel frattempo volete anticiparci qualcosa, o se la cosa \u00e8 urgente, ' +
          'potete mandarci lo stesso messaggio anche per una di queste vie.</p>'
        : '<h3>La richiesta \u00e8 pronta. Scegliete come inviarcela.</h3>' +
          '<p class="esito__nota">Non siamo riusciti a recapitarla in automatico, ' +
          'quindi ci pensate voi: il messaggio \u00e8 gi\u00e0 scritto, scegliete lo strumento.</p>') +
      '<div class="esito__vie">' +
        '<a class="btn btn--primary" target="_blank" rel="noopener" href="' + wa + '">Invia su WhatsApp</a>' +
        '<a class="btn btn--outline" target="_blank" rel="noopener" href="' + gmail + '">Invia con Gmail</a>' +
        '<a class="btn btn--outline" href="' + mail + '">Programma di posta</a>' +
      '</div>' +
      '<details class="esito__testo"><summary>Oppure copiate il testo e mandatecelo come volete</summary>' +
        '<textarea readonly rows="10"></textarea>' +
        '<button type="button" class="btn btn--outline esito__copia">Copia il messaggio</button>' +
        '<p class="esito__nota">studio@studioborgioli.com \u00b7 055 872 2065</p>' +
      '</details>';

    modulo.parentNode.insertBefore(esito, modulo.nextSibling);
    esito.querySelector('textarea').value = 'A: ' + DESTINATARIO + '\nOggetto: ' + oggetto + '\n\n' + testo;

    esito.querySelector('.esito__copia').addEventListener('click', function () {
      var area = esito.querySelector('textarea');
      area.select();
      var fatto = false;
      try { fatto = document.execCommand('copy'); } catch (e) { fatto = false; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(area.value).then(function () {
          this.textContent = 'Copiato';
        }.bind(this)).catch(function () {});
      }
      this.textContent = fatto ? 'Copiato' : 'Selezionato: premete Ctrl+C';
    });

    esito.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth', block: 'center' });
    esito.querySelector('h3').setAttribute('tabindex', '-1');
    esito.querySelector('h3').focus();
  }

  /* Prima si prova la strada normale, che permette di leggere la risposta e
     quindi di sapere davvero se è arrivata. Se il browser la blocca si riprova
     alla cieca, che passa quasi sempre. Se non passa nemmeno quella si dice la
     verità e si lasciano le tre vie manuali. */
  function recapita(modulo) {
    if (!INDIRIZZO_RICHIESTE || typeof fetch !== 'function') {
      return Promise.resolve(false);
    }
    var dati = new URLSearchParams();
    ['nome', 'telefono', 'email', 'tipo', 'condominio', 'messaggio', 'sito'].forEach(function (c) {
      dati.append(c, valore(modulo, c));
    });
    dati.append('pagina', location.pathname);

    return fetch(INDIRIZZO_RICHIESTE, { method: 'POST', body: dati })
      .then(function (r) { return r.json(); })
      .then(function (esito) { return !!(esito && esito.ok); })
      .catch(function () {
        return fetch(INDIRIZZO_RICHIESTE, { method: 'POST', mode: 'no-cors', body: dati })
          .then(function () { return true; })
          .catch(function () { return false; });
      });
  }


  /* ------------------------------------------------- stato di apertura --
     Sulle pagine di sede dice se lo sportello è aperto in questo momento.
     Si calcola sull'ora di Roma, non su quella del visitatore, e tiene conto
     delle chiusure dello studio. Se qualcosa non torna non mostra nulla:
     meglio nessuna scritta che una scritta sbagliata. */

  /* periodi di chiusura, in formato GG/MM: la pausa natalizia si ripete ogni
     anno. Le ferie estive cambiano data e vanno aggiunte qui ogni anno. */
  var CHIUSURE = [
    { da: '24/12', a: '06/01', nome: 'chiusura natalizia' }
  ];

  function oraDiRoma() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit',
        minute: '2-digit', day: '2-digit', month: '2-digit', hour12: false
      });
      var p = {};
      f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var giorni = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
      if (!(p.weekday in giorni)) return null;
      return {
        giorno: giorni[p.weekday],
        minuti: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10),
        gg: p.day, mm: p.month
      };
    } catch (e) { return null; }
  }

  function dentroUnaChiusura(ora) {
    var oggi = parseInt(ora.mm, 10) * 100 + parseInt(ora.gg, 10);
    for (var i = 0; i < CHIUSURE.length; i++) {
      var c = CHIUSURE[i];
      var da = parseInt(c.da.slice(3), 10) * 100 + parseInt(c.da.slice(0, 2), 10);
      var a  = parseInt(c.a.slice(3), 10) * 100 + parseInt(c.a.slice(0, 2), 10);
      var dentro = da <= a ? (oggi >= da && oggi <= a) : (oggi >= da || oggi <= a);
      if (dentro) return c;
    }
    return null;
  }

  function inMinuti(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  var NOMI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  function statoSede(el) {
    var fasce;
    try { fasce = JSON.parse(el.getAttribute('data-orari')); } catch (e) { return; }
    if (!fasce || !fasce.length) return;
    var ora = oraDiRoma();
    if (!ora) return;

    var pallino = '<span class="stato__pallino" aria-hidden="true"></span>';
    var chiusura = dentroUnaChiusura(ora);
    if (chiusura) {
      el.className = 'stato stato--chiuso stato--visibile';
      el.innerHTML = pallino + '<span>Chiuso <span class="stato__poi">per ' + chiusura.nome + '</span></span>';
      return;
    }

    /* aperto adesso? */
    for (var i = 0; i < fasce.length; i++) {
      var f = fasce[i];
      if (f.giorni.indexOf(ora.giorno) === -1) continue;
      if (ora.minuti >= inMinuti(f.da) && ora.minuti < inMinuti(f.a)) {
        el.className = 'stato stato--visibile';
        el.innerHTML = pallino + '<span>Aperto ora <span class="stato__poi">· chiude alle ' + f.a + '</span></span>';
        return;
      }
    }

    /* altrimenti si cerca la prima apertura utile nei sette giorni seguenti */
    for (var d = 0; d <= 7; d++) {
      var g = (ora.giorno + d) % 7;
      var migliore = null;
      for (var j = 0; j < fasce.length; j++) {
        var fa = fasce[j];
        if (fa.giorni.indexOf(g) === -1) continue;
        if (d === 0 && inMinuti(fa.da) <= ora.minuti) continue;
        if (!migliore || inMinuti(fa.da) < inMinuti(migliore.da)) migliore = fa;
      }
      if (migliore) {
        var quando = d === 0 ? 'oggi' : (d === 1 ? 'domani' : NOMI[g]);
        el.className = 'stato stato--chiuso stato--visibile';
        el.innerHTML = pallino + '<span>Chiuso ora <span class="stato__poi">· riapre ' +
                       quando + ' alle ' + migliore.da + '</span></span>';
        return;
      }
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.stato[data-orari]'), statoSede);

  Array.prototype.forEach.call(document.querySelectorAll('form.form'), function (modulo) {
    modulo.addEventListener('submit', function (ev) {
      ev.preventDefault();

      /* trappola anti-spam: se il campo nascosto è pieno, non è una persona */
      if (valore(modulo, 'sito')) return;

      var ok = true;
      ok = validaCampo(modulo, 'nome', 'nome', 'Serve un nome per potervi rispondere.') && ok;
      ok = validaCampo(modulo, 'telefono', 'tel', 'Serve un recapito telefonico.') && ok;
      ok = validaCampo(modulo, 'messaggio', 'msg', 'Scriveteci due righe su cosa vi serve.') && ok;
      ok = validaEmail(modulo) && ok;

      if (!ok) {
        var primo = modulo.querySelector('.campo--ko input, .campo--ko textarea');
        if (primo) primo.focus();
        return;
      }

      var bottone = modulo.querySelector('button[type="submit"]');
      if (bottone) { bottone.disabled = true; bottone.textContent = 'Invio in corso\u2026'; }

      recapita(modulo).then(function (riuscito) {
        if (bottone) bottone.textContent = riuscito ? 'Richiesta inviata' : 'Richiesta pronta';
        mostraEsito(modulo, riuscito);
      });
    });

    /* pulizia dell'errore mentre si scrive */
    Array.prototype.forEach.call(modulo.querySelectorAll('input, textarea'), function (el) {
      el.addEventListener('input', function () {
        var contenitore = el.closest('.campo');
        if (contenitore && contenitore.classList.contains('campo--ko') && el.value.trim()) {
          contenitore.classList.remove('campo--ko');
          el.removeAttribute('aria-invalid');
          var box = contenitore.querySelector('.campo__errore');
          if (box) box.textContent = '';
        }
      });
    });
  });
})();
