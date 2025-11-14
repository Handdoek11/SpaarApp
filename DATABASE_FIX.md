# Database Library Mismatch Fix

## Probleem
`database.rs` gebruikt `sqlx` maar `Cargo.toml` configureert `rusqlite`

## Optie A: Gebruik SQLx (Aanbevolen)

Voeg toe aan `spaarapp/frontend/src-tauri/Cargo.toml`:

```toml
[dependencies]
# Existing dependencies...

# Database - voeg sqlx toe
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite", "chrono", "uuid", "sqlcipher"] }

# Verwijder of comment out:
# rusqlite = { workspace = true }
```

Update workspace dependencies in `Cargo.toml`:

```toml
[workspace.dependencies]
# Database and encryption
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite", "chrono", "uuid", "sqlcipher"] }
rusqlite = { version = "0.31", features = ["bundled", "sqlcipher"] }  # Keep for other modules
```

## Optie B: Gebruik Rusqlite (Meer werk)

Rewrite `database.rs` om rusqlite te gebruiken:

```rust
// Replace sqlx imports met rusqlite
use rusqlite::{Connection, params, OpenFlags};
use tokio::sync::Mutex;

// Verander async methods naar sync met tokio::task::spawn_blocking
pub async fn new(database_path: &str) -> AppResult<Self> {
    let path = database_path.to_string();
    let db = tokio::task::spawn_blocking(move || {
        // Sync database initialization
        Self::new_sync(&path)
    }).await?;
}
```

## Test na Fix

```bash
# Check of code compile
cd spaarapp/frontend/src-tauri
cargo check

# Run tests
cargo test

# Start app
npm run dev
```