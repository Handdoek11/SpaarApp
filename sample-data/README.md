# SpaarApp Sample Data

Realistische Nederlandse testdata voor SpaarApp ontwikkeling en testing.

## Bestanden

### 1. `transactions-sample.csv`
3 maanden (september - november 2024) aan realistische transacties voor een typisch Nederlands huishouden:

**Inkomsten:**
- Maandelijks salaris: €2.800 (gemiddeld bruto salaris Nederland)
- Incidentele bonussen/cadeaubonnen

**Vaste lasten (per maand):**
- Huur: €1.200 (gemiddelde huur in middelgrote stad)
- Energie (gas & elektriciteit): €90
- Water: €35
- Internet: €45
- Zorgverzekering: €127,50
- Telefoonabonnement: €25
- NS abonnement: €100
- Gemeentebelastingen: €215
- Verzekeringen: €27

**Variabele lasten:**
- Supermarkten: €350-400 per maand (Albert Heijn, Jumbo, PLUS)
- Restaurants & bezorging: €100-150 per maand
- Benzine: €150-200 per maand
- Vrije tijd: €100-200 per maand (Netflix, Spotify, bioscoop)
- Kleding: €50-200 per maand
- Overig: huishoudelijke artikelen, cadeaus

### 2. `seed-data.json`
Complete database seed data inclusief:

**Categoriën (19 stuks):**
- Supermarkten (15% budget)
- Restaurants & Bezorging (6% budget)
- Transport (8% budget)
- Wonen (45% budget)
- Vrije tijd (8% budget)
- Zorg (5% budget)
- Belastingen (10% budget)
- Verzekeringen (2% budget)
- Kleding (4% budget)
- Electronica (3% budget)
- Huishouden (3% budget)
- etc.

**Budgetten:**
- 12 actieve budgetten (maandelijks, wekelijks, jaarlijks)
- Realistische limieten gebaseerd op Nederlands inkomen
- Notificatie drempels bij 80-90% gebruik

**Instellingen:**
- Valuta: EUR
- Formaat: DD-MM-YYYY
- Taal: nl-NL
- Thema: auto
- Automatische categorisatie: ingeschakeld

**Merchant Mappings:**
50+ Nederlandse winkels en diensten automatisch gekoppeld aan categorieën.

**Terugkerende Transacties (15 stuks):**
Alle vaste lasten en inkomsten als terugkerende transacties ingesteld.

## Importeren in SpaarApp

### CSV Import:
1. Ga naar Import functie in SpaarApp
2. Selecteer `transactions-sample.csv`
3. Kies bankformaat: "Custom"
4. Kolom mapping:
   - Datum: Kolom 1
   - Omschrijving: Kolom 2
   - Bedrag: Kolom 3
   - Type: Kolom 4
   - Categorie: Kolom 5 (optioneel)
   - Rekening: Kolom 6
   - Tegenrekening: Kolom 7

### JSON Seed Data:
De seed-data.json kan gebruikt worden voor:
- Database initialisatie (development)
- Automated testing
- Demo purposes

## Kenmerken

### Realistische patronen:
- Wekelijkse boodschappen (€75-125)
- Bi-weeklijkse tanken (€65-82)
- Weekend uit eten/bestellen
- Maandelijkse vaste lasten begin/end maand
- Sporadische grote uitgaven (electronica, kleding)

### Nederlandse specifiek:
- IBAN rekeningnummers
- Nederlandse winkelketens
- Realistische bedragen in Euro's
- Typische NL uitgavenpatronen
- NS abonnementen, gemeentebelastingen

### Test scenarios:
- Budget alerts (80% drempel)
- Categorisatie op basis van merchant naam
- Terugkerende transacties
- CSV import parsing
- Dunne data (data gaps)
- Uitzonderlijke uitgaven (€299 MediaMarkt)

## Gebruik in Development

```javascript
// Voorbeeld: Importeren in Tauri backend
import { readFileSync } from 'fs';
import seedData from './sample-data/seed-data.json';

// Categoriën aanmaken
seedData.categories.forEach(cat => {
  db.createCategory(cat);
});

// Budgetten instellen
seedData.budgets.forEach(budget => {
  db.createBudget(budget);
});

// Instellingen configureren
db.updateSettings(seedData.settings);
```

## Aanpassingen

- Pas bedragen aan op basis van gewenst inkomen
- Voeg extra categorieën toe indien nodig
- Pas merchant mappings aan voor nieuwe winkels
- Voeg extra transacties toe voor specifieke testcases