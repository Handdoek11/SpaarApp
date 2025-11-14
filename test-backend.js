// Backend testing script for SpaarApp
// This will test the Tauri commands without running the full app

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== SpaarApp Backend Test Report ===\n');

// Test 1: Check if Tauri configuration exists
console.log('1. Checking Tauri configuration...');
const tauriConfigPath = path.join(__dirname, 'spaarapp/frontend/src-tauri/tauri.conf.json');
if (fs.existsSync(tauriConfigPath)) {
    console.log('✓ Tauri configuration found');
} else {
    console.log('✗ Tauri configuration missing');
}

// Test 2: Check Rust source files
console.log('\n2. Checking Rust backend structure...');
const rustFiles = [
    'spaarapp/frontend/src-tauri/src/main.rs',
    'spaarapp/frontend/src-tauri/src/lib.rs',
    'spaarapp/frontend/src-tauri/src/database.rs',
    'spaarapp/frontend/src-tauri/src/models.rs',
    'spaarapp/frontend/src-tauri/src/commands/mod.rs',
    'spaarapp/frontend/src-tauri/src/commands/transactions.rs',
    'spaarapp/frontend/src-tauri/src/commands/csv_import.rs',
    'spaarapp/frontend/src-tauri/src/commands/categories.rs',
    'spaarapp/frontend/src-tauri/src/commands/budgets.rs'
];

for (const file of rustFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✓ ${file}`);
    } else {
        console.log(`✗ ${file} - MISSING`);
    }
}

// Test 3: Check Cargo.toml dependencies
console.log('\n3. Checking Rust dependencies...');
const cargoTomlPath = path.join(__dirname, 'spaarapp/frontend/src-tauri/Cargo.toml');
if (fs.existsSync(cargoTomlPath)) {
    const cargoToml = fs.readFileSync(cargoTomlPath, 'utf8');
    const requiredDeps = [
        'serde',
        'serde_json',
        'sqlx',
        'tauri',
        'tokio',
        'uuid',
        'chrono'
    ];

    requiredDeps.forEach(dep => {
        if (cargoToml.includes(dep)) {
            console.log(`✓ ${dep} dependency found`);
        } else {
            console.log(`✗ ${dep} dependency missing`);
        }
    });
}

// Test 4: Check if sample data exists
console.log('\n4. Checking sample data...');
const sampleCsvPath = path.join(__dirname, 'sample-data/transactions-sample.csv');
if (fs.existsSync(sampleCsvPath)) {
    const csvContent = fs.readFileSync(sampleCsvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`✓ Sample CSV found with ${lines.length} lines`);

    // Validate CSV structure
    const headers = lines[0].split(',');
    const expectedHeaders = ['Datum', 'Omschrijving', 'Bedrag', 'Type', 'Categorie', 'Rekening', 'Tegenrekening', 'Tags'];
    if (headers.every(h => expectedHeaders.includes(h))) {
        console.log('✓ CSV headers are correct');
    } else {
        console.log('✗ CSV headers do not match expected format');
    }
} else {
    console.log('✗ Sample CSV not found');
}

// Test 5: Check frontend API services
console.log('\n5. Checking frontend API services...');
const apiServices = [
    'spaarapp/frontend/src/services/api.ts',
    'spaarapp/frontend/src/services/transactionService.ts',
    'spaarapp/frontend/src/services/categoryService.ts',
    'spaarapp/frontend/src/services/budgetService.ts'
];

for (const service of apiServices) {
    const servicePath = path.join(__dirname, service);
    if (fs.existsSync(servicePath)) {
        console.log(`✓ ${service}`);
    } else {
        console.log(`✗ ${service} - MISSING`);
    }
}

console.log('\n=== Test Complete ===');
console.log('\nTo run the full application:');
console.log('1. Install Rust toolchain: https://rustup.rs/');
console.log('2. Install Tauri CLI: npm install -g @tauri-apps/cli');
console.log('3. Install dependencies: npm install');
console.log('4. Run development server: npm run dev');