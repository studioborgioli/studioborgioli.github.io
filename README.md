# Sito Studio Borgioli — GitHub Pages

Sito statico: `index.html` (vetrina) + `amministratore.html` (acquisizione).
Nessuna dipendenza esterna, nessun cookie, nessun tracker: niente cookie banner necessario.

## Pubblicazione (una volta)
1. Creare un account GitHub per lo studio (es. `studioborgioli`)
2. Creare un repository pubblico chiamato `sito` (o `studioborgioli.github.io`)
3. Caricare questi file (o farli caricare a Claude con un token)
4. Settings → Pages → Deploy from branch `main` → root
5. Settings → Pages → Custom domain: `www.studioborgioli.com` (il file CNAME è già pronto)
6. Dal pannello del dominio (attuale registrar): creare un record CNAME
   `www → <account>.github.io` e i 4 record A di GitHub Pages sul dominio nudo:
   185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153
7. Attivare "Enforce HTTPS" quando il certificato è pronto (pochi minuti)

## Modifiche future
Il sito si modifica cambiando l'HTML e facendo push: Claude può farlo
direttamente in ogni sessione, su richiesta.
