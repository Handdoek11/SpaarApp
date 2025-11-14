/**
 * SpaarApp Sample Data Import Script
 *
 * Gebruik dit script om de sample data te importeren voor testing/development
 *
 * Usage: node import-sample-data.js [--csv] [--json] [--all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  csvFile: path.join(__dirname, 'transactions-sample.csv'),
  jsonFile: path.join(__dirname, 'seed-data.json'),
  outputDir: path.join(__dirname, '../spaarapp/frontend/src/data')
};

// Parse command line arguments
const args = process.argv.slice(2);
const importCsv = args.includes('--csv') || args.includes('--all');
const importJson = args.includes('--json') || args.includes('--all');

/**
 * Converteer CSV naar JSON transacties
 */
function parseCsvToTransactions() {
  console.log('📂 Lezen van CSV bestand...');

  const csvContent = fs.readFileSync(CONFIG.csvFile, 'utf-8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    const transaction = {
      id: `txn_${Date.now()}_${i}`,
      date: values[0],
      description: values[1],
      amount: parseFloat(values[2]),
      transaction_type: values[3].toLowerCase() === 'credit' ? 'credit' : 'debit',
      category_id: mapCategory(values[4]),
      account_number: values[5],
      account_holder: values[6],
      tags: values[7] ? values[7].split(';') : [],
      notes: '',
      is_recurring: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    transactions.push(transaction);
  }

  console.log(`✅ ${transactions.length} transacties verwerkt`);
  return transactions;
}

/**
 * Map Nederlandse categorie namen naar category IDs
 */
function mapCategory(categoryName) {
  const categoryMap = {
    'Supermarkten': 'cat_supermarkets',
    'Boodschappen': 'cat_supermarkets',
    'Restaurants': 'cat_restaurants',
    'Transport': 'cat_transport',
    'Wonen': 'cat_housing',
    'Vrije tijd': 'cat_leisure',
    'Werk': 'cat_work',
    'Zorg': 'cat_health',
    'Belastingen': 'cat_taxes',
    'Verzekeringen': 'cat_insurance',
    'Kleding': 'cat_clothing',
    'Electronica': 'cat_electronics',
    'Huishouden': 'cat_household',
    'Sport': 'cat_sports',
    'Communicatie': 'cat_communication',
    'Kinderen': 'cat_children',
    'Auto': 'cat_auto',
    'Banken': 'cat_banks',
    'Bonus': 'cat_bonus'
  };

  return categoryMap[categoryName] || null;
}

/**
 * Voorbereiden van data voor SpaarApp
 */
function prepareData() {
  const seedData = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf-8'));

  console.log('📦 Voorbereiden van data voor SpaarApp...');

  // Update budget spent/remaining based on transactions
  if (importCsv) {
    const transactions = parseCsvToTransactions();

    // Calculate spending per category
    const spendingByCategory = {};
    transactions.forEach(tx => {
      if (tx.transaction_type === 'debit' && tx.category_id) {
        spendingByCategory[tx.category_id] =
          (spendingByCategory[tx.category_id] || 0) + Math.abs(tx.amount);
      }
    });

    // Update budgets
    seedData.budgets.forEach(budget => {
      const spent = spendingByCategory[budget.category_id] || 0;
      budget.spent = spent;
      budget.remaining = budget.amount - spent;
    });
  }

  return seedData;
}

/**
 * Export data voor gebruik in de app
 */
function exportData() {
  console.log('\n📤 Exporteren van data...');

  // Zorg dat output directory bestaat
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Exporteer JSON seed data
  if (importJson) {
    const seedData = prepareData();
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'seed-data.json'),
      JSON.stringify(seedData, null, 2)
    );
    console.log('✅ Seed data geëxporteerd naar spaarapp/frontend/src/data/seed-data.json');
  }

  // Exporteer transacties
  if (importCsv) {
    const transactions = parseCsvToTransactions();
    fs.writeFileSync(
      path.join(CONFIG.outputDir, 'transactions.json'),
      JSON.stringify(transactions, null, 2)
    );
    console.log('✅ Transacties geëxporteerd naar spaarapp/frontend/src/data/transactions.json');
  }

  // Exporteer TypeScript types helper
  const typeHelper = `
// Auto-generated helper types for sample data
export const SAMPLE_CATEGORIES = ${JSON.stringify(
  JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf-8')).categories,
  null,
  2
)};

export const SAMPLE_MERCHANTS = ${JSON.stringify(
  JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf-8')).sample_merchant_mappings,
  null,
  2
)};
`;

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'sample-data-helpers.ts'),
    typeHelper
  );
  console.log('✅ Helper types geëxporteerd naar spaarapp/frontend/src/data/sample-data-helpers.ts');
}

/**
 * Print statistieken
 */
function printStats() {
  const seedData = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf-8'));
  const transactions = parseCsvToTransactions();

  console.log('\n📊 Statistieken:');
  console.log(`   Categoriën: ${seedData.categories.length}`);
  console.log(`   Budgetten: ${seedData.budgets.length}`);
  console.log(`   Transacties: ${transactions.length}`);
  console.log(`   Terugkerende transacties: ${seedData.recurring_transactions.length}`);
  console.log(`   Merchant mappings: ${Object.keys(seedData.sample_merchant_mappings).length}`);

  // Income vs expenses
  const totalIncome = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  console.log(`\n💰 Financieel overzicht (3 maanden):`);
  console.log(`   Totaal inkomen: €${totalIncome.toFixed(2)}`);
  console.log(`   Totaal uitgaven: €${totalExpenses.toFixed(2)}`);
  console.log(`   Netto besparing: €${(totalIncome - totalExpenses).toFixed(2)}`);
  console.log(`   Gemiddeld per maand uitgaven: €${(totalExpenses / 3).toFixed(2)}`);
}

// Main execution
function main() {
  console.log('🚀 SpaarApp Sample Data Import\n');

  if (!importCsv && !importJson) {
    console.log('Gebruik: node import-sample-data.js [--csv] [--json] [--all]');
    console.log('  --csv  : Importeer transacties uit CSV');
    console.log('  --json : Importeer seed data uit JSON');
    console.log('  --all  : Importeer alles (standaard)\n');

    // Default to all if no arguments
    args.push('--all');
  }

  try {
    exportData();
    printStats();

    console.log('\n✨ Import voltooid!');
    console.log('\nVolgende stappen:');
    console.log('1. Start de development server: npm run dev');
    console.log('2. De data staat nu in spaarapp/frontend/src/data/');
    console.log('3. Gebruik de data in je componenten of tests\n');

  } catch (error) {
    console.error('❌ Fout bij import:', error.message);
    process.exit(1);
  }
}

main();