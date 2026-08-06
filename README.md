# Sito studioborgioli.com — versione 3 (6 agosto 2026)

Sito statico costruito sui token del **Brand Identity Manual v1.0** e sulle specifiche
dei report UX e UI. Niente database, niente plugin, niente cookie. Si pubblica gratis
su GitHub Pages.

## File

| File | Cosa contiene |
|---|---|
| `index.html` | Home: hero, barra di riprova, servizi, perché sceglierci, team, sedi, CTA |
| `servizi.html` | I cinque servizi in dettaglio + FAQ |
| `chi-siamo.html` | Storia con timeline, i cinque valori, la squadra |
| `amministratore.html` | Acquisizione: obiezioni, subentro in 4 passi, modulo preventivo, FAQ |
| `contatti.html` | Recapiti, tre sedi con orari, modulo di contatto, MioCondominio |
| `privacy.html` | Informativa GDPR |
| `404.html` | Pagina di errore personalizzata |
| `stile.css` | Tutti i token e i componenti, in un file solo |
| `script.js` | Comparsa allo scroll + modulo di contatto |
| `font/` | Libre Baskerville e Inter in woff2, ospitati localmente |
| `icona-192.png`, `icona-512.png`, `manifest.json` | Installabilità su telefono (PWA fase 1) |
| `CNAME`, `robots.txt`, `sitemap.xml` | Dominio e motori di ricerca |

## QUATTRO SCOSTAMENTI DAL BRAND MANUAL — tutti per conformità WCAG

I rapporti di contrasto dichiarati nella sezione 4 del manuale **non corrispondono ai
valori reali**. Ricalcolati uno per uno:

| Token | Manuale dichiara | Valore reale | Cosa ho fatto |
|---|---|---|---|
| `#718096` text-2 su bianco | 4.6:1 | **4.02:1** | sostituito con `#5D6B7D` (5.43:1 bianco, 4.79:1 crema) |
| `#C45C1A` accent con testo bianco | 4.8:1 | **4.29:1** | superfici interattive con `#A94E15` (5.54:1); `#C45C1A` resta per filetti e accenti non testuali |
| `#5BA3D9` light su bianco | 3.1:1 | **2.73:1** | usato solo come fondo, mai come colore di testo |
| `#E53E3E` error su bianco | 4.5:1 | **4.13:1** | testi di errore in `#C92A2E` (5.45:1) |

La spec tecnica aveva già intercettato il primo caso e proponeva `#64748B`: quel valore
passa su bianco (4.76:1) ma **fallisce sul fondo crema** (4.19:1), che nel sito si usa
in metà delle sezioni. Per questo ho scelto un tono più scuro.

Tutte le altre combinazioni effettivamente presenti nel sito sono state verificate: **31
su 31 superano il 4.5:1**.

## Font: stessi caratteri, serviti da casa nostra

Il manuale indica Libre Baskerville e Inter, entrambi da Google Fonts. Sono esattamente
i caratteri usati, ma **ospitati sul dominio dello Studio** invece che richiamati dai
server di Google. Motivo: caricarli da Google significa trasmettere l'indirizzo IP di
ogni visitatore negli Stati Uniti, ed è il motivo per cui diversi garanti privacy
europei hanno sanzionato siti che lo facevano. Così il sito resta conforme senza banner
cookie. Peso complessivo dei font: 135 KB, precaricati.

## Il modulo di contatto

I report lo indicano come l'intervento singolo a maggior impatto sulle conversioni, ed è
presente su `contatti.html` e `amministratore.html`, con la validazione inline e gli
stati previsti dal report UI.

**Come funziona:** non invia a un server. Alla conferma apre il programma di posta con
l'email già scritta e ordinata. Nessun servizio terzo, nessun dato che transita da
qualche parte, nessun costo. È la scelta obbligata su un sito statico.

**Se un giorno serve l'invio vero** (con notifica WhatsApp allo studio, come chiede il
report UX), l'aggiornamento è di mezz'ora: si aggiunge un endpoint gratuito tipo
Formspree o una Cloudflare Worker e si cambia una riga in `script.js`. In quel caso va
aggiornata anche l'informativa privacy.

## PRIMA DI PUBBLICARE — le cose da completare

Nel sito sono evidenziate in **rosso** con la scritta `DA INSERIRE`.

1. **Partita IVA, codice fiscale, numero REA.** La P.IVA in home page è obbligatoria per
   legge (art. 35 DPR 633/1972), sanzione da 258 a 2.065 euro.
2. **Quale è la PEC attiva.** `studioborgiolisas@pec.it` il 17 giugno 2026 ha respinto un
   messaggio con errore 554 «indirizzo inesistente». Va verificata prima di pubblicarla.
3. **Data dell'informativa privacy**, in cima a `privacy.html`.

## Cose che i documenti chiedono e che non ho potuto inventare

- **Testimonianze.** Il report UI le mette fra i componenti P1. Servono tre citazioni di
  condòmini reali, con consenso scritto. Lo stile `blockquote` è già pronto.
- **Iscrizione A.N.A.I.P.** Compare nei report ma non è verificabile da qui. Se è reale,
  il badge va aggiunto: aumenta la fiducia più di qualunque aggettivo.
- **Fotografie del team.** Il manuale vieta le stock photo e ha ragione. Per ora ci sono
  le iniziali; con foto vere fatte in studio la sezione cambia registro.
- **Numeri da confermare.** I documenti dicono «27 anni» e «9 professionisti»: dal 1998
  al 2026 sono 28 anni, e le persone elencate sono 8. Nel sito ho scritto «dal 1998» e non
  ho messo il numero delle persone, così non c'è niente da smentire.

## Aggiornamenti periodici

- **Avviso di chiusura**: in `costruisci.py` e nelle pagine, cercare il commento
  `MODIFICA O CANCELLA QUESTO BLOCCO`. Ora riporta la chiusura 10–21 agosto 2026.
- **Numero di condomìni**: ora «oltre 120».
- **Orari delle sedi**: in `index.html` e `contatti.html`, da tenere allineati alla firma email.

## Pubblicazione su GitHub Pages

1. Account GitHub con `studio@studioborgioli.com` (username suggerito: `studioborgioli`).
2. Nuovo repository pubblico `sito`.
3. Caricare tutti i file **mantenendo la cartella `font/`**.
4. Settings → Pages → Source *Deploy from a branch* → `main`, cartella `/ (root)`.
5. Custom domain: `www.studioborgioli.com` → Save → spuntare *Enforce HTTPS*.
6. DNS: CNAME `www` → `studioborgioli.github.io`; record A sul dominio nudo
   `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`; rimuovere i vecchi A verso
   `51.178.149.170` (OVH).
7. Verificare da telefono, poi disdire l'hosting OVH. Il dominio non si tocca.
8. Search Console: inviare `sitemap.xml`.

## Su Scenario B dei report

I report pianificano lo Scenario B su WordPress con VPS, Cloudflare, Redis, WP Rocket e
Schema Pro: fra hosting e licenze si va sui 250-400 € l'anno, più lo sviluppo del tema.

Questo sito raggiunge gli stessi obiettivi di architettura informativa, conversione e
accessibilità **a costo zero e senza superficie d'attacco**: niente wp-admin da difendere,
niente plugin da aggiornare, niente backup da verificare. Le voci dello Scenario B che
restano davvero aperte sono i contenuti (blog, testimonianze) e l'analytics, non
l'infrastruttura.
