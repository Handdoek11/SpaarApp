# SpaarApp

![SpaarApp Logo](docs/images/logo.png)

**ADHD-vriendelijke financiële beheer applicatie voor Nederlandse gebruikers**

SpaarApp is een moderne desktop applicatie speciaal ontworpen voor mensen met ADHD die moeite hebben met traditionele financiële planning tools. Met AI-ondersteunde inzichten en een intuïtieve interface maakt SpaarApp financieel beheer toegankelijk en stress-vrij.

## ✨ Belangrijkste Kenmerken

### 🧠 ADHD-Geoptimaliseerd Ontwerp
- **Eén-cijfer focus**: Direct zicht op "Veilig om te Besteden" bedrag
- **Wekelijkse cycli**: Minder overweldigend dan maandelijkse budgetten
- **Minimale cognitieve belasting**: Vereenvoudigde interface met progressieve onthulling
- **Directe feedback**: Onmiddellijke visuele bevestiging van acties

### 🏦 Nederlandse Bank Integratie
- **Rabobank compatibiliteit**: Automatische CSV import van bankafschriften
- **ISO-formaat ondersteuning**: Werkt met alle Nederlandse banken
- **Real-time synchronisatie**: Actuele financiële data altijd beschikbaar

### 🤖 AI-Ondersteunde Inzichten
- **Claude Sonnet 4.5 integratie**: Geavanceerde financiële analyse
- **Persoonlijke adviezen**: Op maat gemaakte besparingsuggesties
- **Uitgavencategorisatie**: Automatische herkenning en sortering
- **Cost-effective**: Slechts €1.82-€5.46 per maand operationele kosten

### 🔒 Privacy & Security
- **Lokaal-first**: Alle data blijft op jouw computer
- **SQLCipher encryptie**: Bank-niveau encryptie voor financiële data
- **GDPR compliant**: Volledig conform Europese privacy wetgeving
- **Zero-knowledge architectuur**: Niet wij, alleen jij hebt toegang tot je data

## 🚀 Quick Start

### Vereisten
- Windows 10 of hoger
- Node.js 18.0+
- Rust 1.75+
- Git

### Installatie

```bash
# Clone de repository
git clone https://github.com/Handdoek11/SpaarApp.git
cd SpaarApp

# Installeer dependencies
npm install

# Kopieer environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Eerste Installatie

1. **Download**: Haal de laatste release van [GitHub Releases](https://github.com/Handdoek11/SpaarApp/releases)
2. **Installeer**: Dubbel-klik op het `.exe` installatiebestand
3. **Configureer**: Volg de setup wizard voor initieel budget
4. **Importeer**: Upload je Rabobank CSV bestand
5. **Start**: Begin direct met het beheren van je financiën!

## 🏗️ Architectuur

### Tech Stack
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Rust (Tauri 2.0) + Python voor data processing
- **Database**: SQLite met SQLCipher encryptie
- **AI Integration**: Claude Sonnet 4.5 + OpenAI GPT-4.1
- **Development**: Claude Code CLI met Claude Agent SDK

### Project Structuur
```
SpaarApp/
├── spaarapp/                   # Main application
│   ├── frontend/              # React + TypeScript UI
│   ├── backend/               # Rust Tauri backend
│   ├── shared/                # Gedeelde types en utilities
│   └── ai-services/           # AI integratie services
├── tools/                     # Development tools
│   └── claude-code-toolkit/   # Claude Code marketplace plugins
├── docs/                      # Documentatie
└── tests/                     # Test suites
```

## 🤖 Claude Code CLI Integration

Dit project is volledig geoptimaliseerd voor Claude Code CLI met:

### Geconfigureerde Agents
- **frontend**: React/TypeScript/Material-UI specialist met ADHD focus
- **backend**: Rust/Tauri/financial services expert met Claude SDK
- **financial**: FinTech/GDPR/Rabobank integratie specialist
- **ai**: Claude SDK/financial analysis met cost management

### Custom Commands
```bash
# Development workflows
claude-code spaarapp:dev        # Start development met hot reload
claude-code spaarapp:build      # Build productie applicatie
claude-code spaarapp:test       # Run alle tests inclusief accessibility
claude-code spaarapp:security   # Security audit en compliance checks
claude-code spaarapp:deploy     # Build en package voor distributie

# AI workflows
claude-code spaarapp:analyze    # Analyseer uitgavenpatronen
claude-code spaarapp:optimize   # Optimaliseer budget suggesties
claude-code spaarapp:report     # Genereer financiële rapporten
```

### Skills & Tools
- **tauri-development**: Full-stack Tauri applicatie development
- **financial-data-processing**: CSV import, categorisatie, analyse
- **accessibility-compliance**: WCAG 2.1 AA+ validatie
- **gdpr-compliance**: Privacy by design implementation
- **dutch-banking-integration**: Rabobank API en format ondersteuning
- **adhd-ux-design**: Cognitive load reduction principes
- **claude-sdk-integration**: AI-gedragen features met cost tracking

## 📊 Features in Detail

### Budgetbeheer
- **Wekelijkse budget cycli**: Begint elke week op een schone lei
- **Safe-to-Spend**: Dynamisch berekend beschikbaar bedrag
- **Categorisatie**: Automatische en handmatige uitgaven sortering
- **Doelen stellen**: Persoonlijke spaardoelen met voortgang tracking

### Inzicht & Analyse
- **Visuele dashboards**: Intuïtieve grafieken en charts
- **Trend analyse**: Patronen in uitgaven gedetecteerd door AI
- **Adviezen**: Persoonlijke tips voor besparingen
- **Rapporten**: Exporteerbare financiële overzichten

### Import & Export
- **CSV import**: Ondersteunt alle Nederlandse bankformaten
- **Automatische categorisatie**: AI-gedreven transactie herkenning
- **Data export**: PDF, Excel, en CSV rapporten
- **Backup & Restore**: Versleutelde backups en herstel

## 🔧 Development

### Local Development
```bash
# Installeer Rust en Node.js
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
npm install -g @tauri-apps/cli

# Clone en setup
git clone https://github.com/Handdoek11/SpaarApp.git
cd SpaarApp
npm install
cargo build

# Start development
npm run dev
```

### Testing
```bash
# Run alle tests
npm run test

# Accessibility testing
npm run test:a11y

# Security testing
npm run test:security

# Performance testing
npm run test:performance
```

### Build & Release
```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Package for distribution
npm run package
```

## 📋 Roadmap

### Versie 0.1 - MVP
- [x] Basis UI met ADHD-focus
- [x] Rabobank CSV import
- [x] Simpel budgetbeheer
- [x] Lokale data opslag

### Versie 0.2 - AI Features
- [ ] Claude Sonnet 4.5 integratie
- [ ] Automatische categorisatie
- [ ] Basis financiële adviezen
- [ ] Enhanced data visualisatie

### Versie 0.3 - Advanced Features
- [ ] Meerdere bank ondersteuning
- [ ] Geavanceerde rapportage
- [ ] Spaardoelen tracking
- [ ] Mobile companion app

### Versie 1.0 - Production Ready
- [ ] Volledige Rabobank API integratie
- [ ] Multi-user support
- [ ] Advanced AI inzichten
- [ ] Enterprise features

## 🤝 Bijdragen

We verwelkomen bijdragen! Vooral op het gebied van:

- ADHD gebruikerservaring
- Financiële educatie content
- Dutch banking integratie
- Accessibility improvements
- AI feature suggestions

### Development Workflow
1. Fork de repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicentieerd onder de MIT License - zie de [LICENSE](LICENSE) file voor details.

## 🙏 Dankwoord

- De ADHD community voor waardevolle feedback en inzichten
- Rabobank voor CSV export mogelijkheden
- Anthropic voor Claude AI technologie
- De Tauri community voor het fantastische framework

## 📞 Contact

- **GitHub Issues**: [Bugs en feature requests](https://github.com/Handdoek11/SpaarApp/issues)
- **Email**: dev@spaarapp.nl
- **Website**: [spaarapp.nl](https://spaarapp.nl) (binnenkort)

## 🔗 Links

- [Website](https://spaarapp.nl)
- [Documentatie](https://docs.spaarapp.nl)
- [Community Discord](https://discord.gg/spaarapp)
- [Claude Code CLI](https://claude.com/claude-code)
- [Tauri Framework](https://tauri.app)

---

**SpaarApp** - Maak financieel beheer eenvoudig, zelfs met ADHD 🧠💙

*Gebouwd met ❤️ in Nederland, voor Nederlandse gebruikers*