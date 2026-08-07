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
  function mostraEsito(modulo) {
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
      '<h3>La richiesta \u00e8 pronta. Scegliete come inviarcela.</h3>' +
      '<p class="esito__nota">Nessun dato \u00e8 stato trasmesso a questo sito: il messaggio ' +
      'parte da voi, con lo strumento che preferite.</p>' +
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
      if (bottone) { bottone.disabled = true; bottone.textContent = 'Richiesta pronta'; }
      mostraEsito(modulo);
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
