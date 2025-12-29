# E-Kinderauto Shop

Ein moderner E-Commerce-Shop für Kinderautos, gebaut mit Astro und React, optimiert für Cloudflare Pages.

## 🚀 Features

- **Moderne UI** mit Tailwind CSS
- **Responsive Design** für alle Geräte
- **Warenkorb-Funktionalität** mit LocalStorage
- **Produktdetailseiten** mit dynamischen Routen
- **Checkout-Prozess** mit Formularvalidierung
- **Optimiert für Cloudflare Pages** - statisches Hosting mit maximaler Performance

## 🛠️ Technologie-Stack

- [Astro](https://astro.build/) - Web-Framework für statische Sites
- [React](https://react.dev/) - UI-Komponenten
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Typsicherheit

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Preview des Production Builds
npm run preview
```

## 🌐 Deployment auf Cloudflare Pages

### Option 1: Automatisches Deployment via GitHub

1. **Repository zu GitHub pushen:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Cloudflare Pages konfigurieren:**
   - Gehen Sie zu [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigieren Sie zu **Pages** → **Create a project**
   - Verbinden Sie Ihr GitHub-Repository
   - Wählen Sie das Repository `e-kinderauto` aus

3. **Build-Einstellungen:**
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leer lassen)

4. **Environment Variables (optional):**
   - Falls Sie später Cloudflare Workers für Backend-Funktionen nutzen möchten, können Sie hier Variablen setzen

5. **Deploy:**
   - Klicken Sie auf **Save and Deploy**
   - Cloudflare Pages baut und deployed automatisch bei jedem Push zu `main`

### Option 2: Manuelles Deployment mit Wrangler

```bash
# Wrangler CLI installieren
npm install -g wrangler

# Login bei Cloudflare
wrangler login

# Projekt deployen
npm run build
wrangler pages deploy dist
```

### Option 3: GitHub Actions (bereits konfiguriert)

Das Repository enthält bereits eine GitHub Actions Workflow-Datei. Sie müssen nur noch die Secrets in GitHub setzen:

1. Gehen Sie zu **Settings** → **Secrets and variables** → **Actions**
2. Fügen Sie folgende Secrets hinzu:
   - `CLOUDFLARE_API_TOKEN`: Ihr Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: Ihre Cloudflare Account ID

Diese finden Sie im [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens).

## 📁 Projektstruktur

```
/
├── public/          # Statische Assets
├── src/
│   ├── components/  # React & Astro Komponenten
│   ├── data/        # Produktdaten
│   ├── layouts/     # Layout-Komponenten
│   ├── pages/       # Seiten (file-based routing)
│   ├── styles/      # Globale Styles
│   └── types/       # TypeScript Typen
├── astro.config.mjs # Astro Konfiguration
└── package.json
```

## 🎨 Anpassungen

### Produkte hinzufügen/bearbeiten

Bearbeiten Sie `src/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: '1',
    name: 'Ihr Produktname',
    description: 'Beschreibung',
    price: 99.99,
    image: 'URL zum Bild',
    category: 'Kategorie',
    inStock: true,
    rating: 4.5,
  },
  // ...
];
```

### Styling anpassen

Die globalen Styles befinden sich in `src/styles/global.css`. Tailwind CSS ist bereits konfiguriert und kann direkt in den Komponenten verwendet werden.

## 🔧 Erweiterte Features (zukünftig)

- **Cloudflare Workers** für Backend-Funktionen (Bestellungen, Payment)
- **Stripe Integration** für Zahlungen
- **Produktverwaltung** über CMS
- **Benutzerkonten** und Bestellhistorie
- **Suchfunktion** und Filter

## 📝 Lizenz

MIT

## 🤝 Beitragen

Pull Requests sind willkommen! Für größere Änderungen öffnen Sie bitte zuerst ein Issue.
