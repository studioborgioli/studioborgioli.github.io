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


  /* ------------------------------------------------- facciata che si muove
     Con il mouse: gli strati seguono il puntatore, ognuno di quanto gli spetta.
     Senza mouse (telefono, tablet): seguono lo scorrimento della pagina.
     Con le animazioni ridotte attive: non si muove niente. */
  var scena = document.querySelector('[data-scena]');
  if (scena && !ridotto) {
    var strati = scena.querySelectorAll('.scena__strato');
    var puntatore = window.matchMedia('(pointer: fine)').matches;

    if (puntatore) {
      var attesa = false;
      window.addEventListener('mousemove', function (ev) {
        if (attesa) return;
        attesa = true;
        window.requestAnimationFrame(function () {
          var dx = (ev.clientX / window.innerWidth - 0.5) * 2;
          var dy = (ev.clientY / window.innerHeight - 0.5) * 2;
          Array.prototype.forEach.call(strati, function (st) {
            var p = parseFloat(st.getAttribute('data-prof')) || 1;
            st.style.transform = 'translate(' + (-dx * 9 * p).toFixed(2) + 'px,' +
                                 (-dy * 5 * p).toFixed(2) + 'px)';
          });
          attesa = false;
        });
      }, { passive: true });
    } else {
      var atteso = false;
      window.addEventListener('scroll', function () {
        if (atteso) return;
        atteso = true;
        window.requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 600) / 600;
          Array.prototype.forEach.call(strati, function (st) {
            var p = parseFloat(st.getAttribute('data-prof')) || 1;
            st.style.transform = 'translateY(' + (-y * 26 * p).toFixed(2) + 'px)';
          });
          atteso = false;
        });
      }, { passive: true });
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

  function preparaMailto(modulo) {
    var tipo = valore(modulo, 'tipo') || 'Richiesta dal sito';
    var cond = valore(modulo, 'condominio');
    /* il prefisso rende le richieste dal sito riconoscibili dallo smistamento */
    var oggetto = '[Sito] ' + tipo + (cond ? ' \u2014 ' + cond : '');

    var corpo = [
      'Buongiorno,',
      '',
      valore(modulo, 'messaggio'),
      '',
      '---',
      'Nome e cognome: ' + valore(modulo, 'nome'),
      'Telefono: ' + valore(modulo, 'telefono'),
      'Email: ' + (valore(modulo, 'email') || '(non indicata)'),
      'Condominio: ' + (cond || '(non indicato)'),
      'Tipo di richiesta: ' + tipo,
      '',
      'Inviato dal sito studioborgioli.com'
    ].join('\n');

    return 'mailto:' + DESTINATARIO +
      '?subject=' + encodeURIComponent(oggetto) +
      '&body=' + encodeURIComponent(corpo);
  }

  function mostraEsito(modulo, link) {
    var esito = document.createElement('div');
    esito.className = 'form__esito';
    esito.setAttribute('role', 'status');
    esito.innerHTML =
      '<svg class="icona icona--sm" viewBox="0 0 24 24" aria-hidden="true" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" ' +
      'stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>' +
      '<div><strong>Il messaggio \u00e8 pronto.</strong><br>' +
      'Si sta aprendo il vostro programma di posta con l\u2019email gi\u00e0 scritta: ' +
      'rileggetela e premete invia. Se non si apre nulla, ' +
      '<a href="' + link.replace(/"/g, '&quot;') + '">aprite l\u2019email da qui</a> ' +
      'oppure scriveteci direttamente a <a href="mailto:' + DESTINATARIO + '">' +
      DESTINATARIO + '</a>.</div>';
    modulo.parentNode.insertBefore(esito, modulo.nextSibling);
    esito.scrollIntoView({ behavior: ridotto ? 'auto' : 'smooth', block: 'center' });
  }

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

      var link = preparaMailto(modulo);
      var bottone = modulo.querySelector('button[type="submit"]');
      if (bottone) { bottone.disabled = true; bottone.textContent = 'Email preparata'; }
      mostraEsito(modulo, link);
      window.location.href = link;
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
