# SpaarApp Manual Test Script

## Voer dit uit NADAT de database issue is gefixt

---

## Stap 1: Installatie

```bash
# 1. Installeer Rust (indien niet geïnstalleerd)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Installeer Tauri CLI
cargo install tauri-cli

# 3. npm dependencies
npm install

# 4. Start development server
npm run dev
```

---

## Stap 2: Database Initialisatie Test

**Verwachte Resultaten:**
- [ ] App start zonder errors
- [ ] Database file aangemaakt in AppData
- [ ] "spaarapp.db" of "spaarapp_encrypted.db" zichtbaar
- [ ] Console toont "Database initialized successfully"
- [ ] Default categorieën zijn geladen (10 stuks)

**Check Database:**
```sql
-- Open database met SQLite browser
-- controleer tabellen:
.tables  -- Moet tonen: settings, categories, transactions, budgets, financial_insights

-- Check default data:
SELECT COUNT(*) FROM categories;  -- Moet 10+ tonen
SELECT * FROM settings LIMIT 1;  -- Moet default settings tonen
```

---

## Stap 3: CSV Import Test

**Test Data:** `sample-data/transactions-sample.csv`

**Steps:**
1. [ ] Open de SpaarApp
2. [ ] Navigeer naar "Import CSV" pagina
3. [ ] Klik "Kies bestand" of drag & drop CSV
4. [ ] Selecteer `transactions-sample.csv`
5. [ ] Verifieer preview toont 98 transacties
6. [ ] Klik "Importeer"

**Verwachte Resultaten:**
- [ ] Toast notification: "98 transacties geïmporteerd"
- [ ] Transacties verschijnen in dashboard
- [ ] Categorieën automatisch toegewezen
- [ ] Total balance berekend

---

## Stap 4: CRUD Operations Tests

### Transacties CRUD
```javascript
// Test in Browser Console:
await transactionsApi.getAll()  // Should return 98+ transactions

// Create nieuwe transactie:
await transactionsApi.create({
  description: "Test transactie",
  amount: -25.50,
  date: new Date().toISOString(),
  transaction_type: "debit",
  category_id: "<category uuid>"
})

// Update transactie:
await transactionsApi.update(id, {
  description: "Updated description"
})

// Delete transactie:
await transactionsApi.delete(id)
```

### Categorieën CRUD
```javascript
// Get alle categorieën:
await categoriesApi.getAll()  // Should return 10+ default categories

// Create nieuwe categorie:
await categoriesApi.create({
  name: "Test Categorie",
  color: "#FF0000",
  icon: "test"
})
```

### Budgets CRUD
```javascript
// Create budget:
await budgetsApi.create({
  name: "Test Budget",
  category_id: "<category uuid>",
  amount: 500.00,
  period: "monthly",
  start_date: new Date().toISOString()
})

// Get budget met spending:
await budgetsApi.getAll()  // Should show calculated spent amount
```

---

## Stap 5: UI Tests

### Dashboard
- [ ] Toont huidige balance (€2,800.00 - uitbrekeningen)
- [ ] Chart toont spending per categorie
- [ ] Recent transactions list werkt
- [ ] Budget progress bars zichtbaar
- [ ] Nederlandse formatting (€1.234,56)

### Transaction List
- [ ] Alle 98 transacties zichtbaar
- [ ] Sorteren op datum werkt
- [ ] Filter op categorie werkt
- [ ] Search functionaliteit werkt
- [ ] Pagination indien nodig

### Import Flow
- [ ] File picker opent
- [ ] CSV preview correct
- [ ] Progress bar tijdens import
- [ ] Success/error toasts
- [ ] Duplicate detection

---

## Stap 6: Nederlandse Features Test

### Formatting
- [ ] Bedragen: €1.234,56 (niet $1,234.56)
- [ ] Datums: DD-MM-YYYY (13-11-2024)
- [ ] Getallen: Komma als decimaal
- [ ] Categorienamen in Nederlands

### Banking Features
- [ ] Nederlandse IBAN format herkend
- [ ] Rabobank transacties correct geparsed
- [ ] SEPA transacties ondersteund
- [ ]荷兰语描述 (NL)

---

## Stap 7: Error Handling Tests

### API Errors
```javascript
// Test invalid ID:
await transactionsApi.getById("invalid-id")
// Should show: "Transactie ophalen mislukt"

// Test invalid data:
await transactionsApi.create({ invalid: "data" })
// Should show validation error
```

### UI Errors
- [ ] Network errors getoond
- [ ] Validation errors in forms
- [ ] Toast notifications voor errors
- [ ] Fallback states tonen

---

## Stap 8: Performance Tests

### Large Dataset
- [ ] Import 1000+ transacties zonder freeze
- [ ] Scroll door transaction list smooth
- [ ] Charts render snel
- [ ] Search results < 500ms

### Memory
- [ ] Memory usage stabiel
- [ ] Geen memory leaks
- [ ] Database file size redelijk (< 10MB voor 1000 transacties)

---

## Stap 9: Integration Tests

### End-to-End Flow
1. [ ] Import CSV → Database
2. [ ] Database → UI Display
3. [ ] UI Edit → Database Update
4. [ ] Create Budget → Transaction Category Assignment
5. [ ] Budget Alert → Notification

### Data Consistency
- [ ] Transacties niet verdubbeld
- [ ] Budget calculations correct
- [ ] Category totals kloppen
- [ ] Date ranges correct

---

## Stap 10: Security Tests

### Encryption
- [ ] Database file is encrypted
- [ ] Kan niet openen zonder wachtwoord
- [ ] Sensitive data niet in plaintext

### Input Validation
- [ ] SQL injection niet mogelijk
- [ ] XSS niet mogelijk
- [ ] File upload veilig

---

## Test Results Template

```
Datum: _______________
Tester: _______________

✓ Database Initialisatie: ____
✓ CSV Import: ____
✓ CRUD Transactions: ____
✓ CRUD Categories: ____
✓ CRUD Budgets: ____
✓ Dashboard UI: ____
✓ NL Formatting: ____
✓ Error Handling: ____
✓ Performance: ____
✓ Security: ____

Totaal Score: ____/10

Issues gevonden:
1.
2.
3.
```

---

## Quick Commands for Testing

```javascript
// Browser Console - Quick API Tests
console.table(await transactionsApi.getAll())
console.table(await categoriesApi.getAll())
console.table(await budgetsApi.getAll())

// Import test
const csv = await fetch('/sample-data/transactions-sample.csv').then(r => r.text())
await importCsvApi.importFromContent(csv)

// Check dashboard stats
const stats = await dashboardApi.getStats()
console.log('Balance:', stats.balance)
console.log('This month:', stats.monthly_spending)
```