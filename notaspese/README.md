# Nota Spese — App per iPhone

App per registrare le spese di lavoro: fotografi la ricevuta, l'AI legge data/importo/luogo, salvi il PDF su Drive/File e esporti tutto in CSV per Excel.

## Cosa ti serve (gratis)
- Un account GitHub: https://github.com
- Un account Vercel: https://vercel.com (accedi con GitHub)
- Una API key Anthropic: https://console.anthropic.com (serve solo per la lettura AI; costa pochi centesimi a scansione)

Se NON vuoi la lettura AI, l'app funziona lo stesso: inserisci i 3 campi a mano. In quel caso salta i passi sulla API key.

---

## PASSO 1 — Carica il progetto su GitHub
1. Vai su https://github.com/new e crea un repository chiamato `notaspese` (privato va bene).
2. Nella pagina del repo, clicca "uploading an existing file".
3. Trascina TUTTO il contenuto di questa cartella (le cartelle `src`, `api`, `public` e i file `package.json`, `vite.config.js`, `index.html`, `vercel.json`, `.gitignore`).
4. Clicca "Commit changes".

## PASSO 2 — Pubblica su Vercel
1. Vai su https://vercel.com e accedi con GitHub.
2. Clicca "Add New… → Project".
3. Seleziona il repository `notaspese` e clicca "Import".
4. Lascia tutte le impostazioni di default (Vercel riconosce Vite da solo).
5. PRIMA di cliccare Deploy, apri "Environment Variables" e aggiungi:
   - Nome: `ANTHROPIC_API_KEY`
   - Valore: la tua API key (inizia con `sk-ant-...`)
   (Salta questo punto se non usi la lettura AI.)
6. Clicca "Deploy". Dopo 1-2 minuti avrai un URL tipo `https://notaspese.vercel.app`.

## PASSO 3 — Metti l'icona sull'iPhone
1. Apri l'URL in **Safari** (non Chrome).
2. Tocca il pulsante Condividi (il quadrato con la freccia in alto).
3. Scorri e tocca **"Aggiungi a Home"**.
4. Conferma. Ora hai l'icona "Nota Spese" come un'app vera, a tutto schermo.

---

## Come si usa
1. Apri l'app, tocca per fotografare la ricevuta.
2. L'AI compila data, importo, luogo (se attiva).
3. Aggiungi causale, cliente, partecipanti.
4. Tocca "Salva PDF su Drive / File" → scegli dove salvarlo (File, Google Drive, iCloud).
5. Tocca "+ Aggiungi spesa".
6. A fine mese: "Esporta CSV", aprilo in Excel, poi "Svuota lista".

I dati restano salvati sul telefono tra una sessione e l'altra. Niente cloud, niente login.
