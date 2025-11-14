use crate::error::{AppError, AppResult};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{SaltString, rand_core::OsRng};
use ring::aead::{AES_256_GCM, Aad, LessSafeKey, Nonce, UnboundKey};
use ring::rand::{SecureRandom, SystemRandom};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

pub struct EncryptionManager<'a> {
    key_derivation: Argon2<'a>,
    rng: SystemRandom,
    master_key: Option<[u8; 32]>,
}

impl<'a> EncryptionManager<'a> {
    pub fn new() -> Self {
        Self {
            key_derivation: Argon2::default(),
            rng: SystemRandom::new(),
            master_key: None,
        }
    }

    pub fn set_master_key(&mut self, password: &str, salt: &[u8]) -> AppResult<()> {
        let salt_string = SaltString::encode_b64(salt)
            .map_err(|e| AppError::Encryption(format!("Failed to encode salt: {}", e)))?;

        let password_hash = self.key_derivation
            .hash_password(password.as_bytes(), &salt_string)
            .map_err(|e| AppError::Encryption(format!("Failed to derive key: {}", e)))?;

        // Extract the hash bytes as our master key
        let hash = password_hash.hash.unwrap();
        let key_bytes = hash.as_bytes();

        if key_bytes.len() >= 32 {
            let mut master_key = [0u8; 32];
            master_key.copy_from_slice(&key_bytes[..32]);
            self.master_key = Some(master_key);
            Ok(())
        } else {
            Err(AppError::Encryption("Derived key too short".to_string()))
        }
    }

    pub fn generate_salt() -> AppResult<[u8; 16]> {
        let rng = SystemRandom::new();
        let mut salt = [0u8; 16];
        rng.fill(&mut salt)
            .map_err(|e| AppError::Encryption(format!("Failed to generate salt: {}", e)))?;
        Ok(salt)
    }

    pub fn encrypt_data(&self, data: &[u8]) -> AppResult<Vec<u8>> {
        let master_key = self.master_key
            .ok_or_else(|| AppError::Encryption("Master key not set".to_string()))?;

        let unbound_key = UnboundKey::new(&AES_256_GCM, &master_key)
            .map_err(|e| AppError::Encryption(format!("Failed to create encryption key: {}", e)))?;

        let sealing_key = LessSafeKey::new(unbound_key);

        let mut nonce_bytes = [0u8; 12];
        self.rng.fill(&mut nonce_bytes)
            .map_err(|e| AppError::Encryption(format!("Failed to generate nonce: {}", e)))?;

        let nonce = Nonce::assume_unique_for_key(nonce_bytes);
        let mut in_out = data.to_vec();

        sealing_key.seal_in_place_append_tag(nonce, Aad::empty(), &mut in_out)
            .map_err(|e| AppError::Encryption(format!("Encryption failed: {}", e)))?;

        // Prepend nonce to ciphertext
        let mut encrypted = nonce_bytes.to_vec();
        encrypted.extend_from_slice(&in_out);

        Ok(encrypted)
    }

    pub fn decrypt_data(&self, encrypted_data: &[u8]) -> AppResult<Vec<u8>> {
        let master_key = self.master_key
            .ok_or_else(|| AppError::Encryption("Master key not set".to_string()))?;

        if encrypted_data.len() < 12 {
            return Err(AppError::Encryption("Invalid encrypted data length".to_string()));
        }

        let (nonce_bytes, ciphertext) = encrypted_data.split_at(12);
        let nonce = Nonce::assume_unique_for_key(nonce_bytes.try_into()
            .map_err(|_| AppError::Encryption("Invalid nonce length".to_string()))?);

        let unbound_key = UnboundKey::new(&AES_256_GCM, &master_key)
            .map_err(|e| AppError::Encryption(format!("Failed to create decryption key: {}", e)))?;

        let opening_key = LessSafeKey::new(unbound_key);
        let mut in_out = ciphertext.to_vec();

        let plaintext = opening_key.open_in_place(nonce, Aad::empty(), &mut in_out)
            .map_err(|e| AppError::Encryption(format!("Decryption failed: {}", e)))?;

        Ok(plaintext.to_vec())
    }

    pub fn encrypt_string(&self, s: &str) -> AppResult<String> {
        let encrypted = self.encrypt_data(s.as_bytes())?;
        Ok(base64::encode(encrypted))
    }

    pub fn decrypt_string(&self, encrypted: &str) -> AppResult<String> {
        let decoded = base64::decode(encrypted)
            .map_err(|e| AppError::Encryption(format!("Base64 decode failed: {}", e)))?;
        let decrypted = self.decrypt_data(&decoded)?;
        String::from_utf8(decrypted)
            .map_err(|e| AppError::Encryption(format!("UTF-8 decode failed: {}", e)))
    }

    pub fn verify_password(&self, password: &str, salt: &[u8]) -> AppResult<bool> {
        let salt_string = SaltString::encode_b64(salt)
            .map_err(|e| AppError::Encryption(format!("Failed to encode salt: {}", e)))?;

        let expected_hash = self.key_derivation
            .hash_password(password.as_bytes(), &salt_string)
            .map_err(|e| AppError::Encryption(format!("Failed to hash password: {}", e)))?;

        let hash_str = expected_hash.to_string();
        let parsed_hash = PasswordHash::new(&hash_str)
            .map_err(|e| AppError::Encryption(format!("Failed to parse hash: {}", e)))?;

        Ok(self.key_derivation.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }
}

impl Default for EncryptionManager<'_> {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    pub salt: String,
    pub algorithm: String,
    pub iterations: u32,
    pub memory_cost: u32,
    pub parallelism: u32,
}

impl Default for EncryptionConfig {
    fn default() -> Self {
        Self {
            salt: base64::encode(&EncryptionManager::generate_salt().unwrap_or_default()),
            algorithm: "argon2id".to_string(),
            iterations: 100000,
            memory_cost: 65536,
            parallelism: 4,
        }
    }
}

pub fn save_encryption_config<P: AsRef<Path>>(config: &EncryptionConfig, path: P) -> AppResult<()> {
    let config_json = serde_json::to_string_pretty(config)
        .map_err(|e| AppError::Serialization(e))?;

    fs::write(path, config_json)
        .map_err(|e| AppError::Io(e))?;

    Ok(())
}

pub fn load_encryption_config<P: AsRef<Path>>(path: P) -> AppResult<EncryptionConfig> {
    let config_content = fs::read_to_string(path)
        .map_err(|e| AppError::Io(e))?;

    serde_json::from_str(&config_content)
        .map_err(|e| AppError::Serialization(e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_roundtrip() {
        let mut manager = EncryptionManager::new();
        let salt = EncryptionManager::generate_salt().unwrap();
        manager.set_master_key("test_password", &salt).unwrap();

        let original = "This is a secret message!";
        let encrypted = manager.encrypt_string(original).unwrap();
        let decrypted = manager.decrypt_string(&encrypted).unwrap();

        assert_eq!(original, decrypted);
        assert_ne!(original, encrypted);
    }

    #[test]
    fn test_password_verification() {
        let mut manager = EncryptionManager::new();
        let salt = EncryptionManager::generate_salt().unwrap();

        let correct_password = "my_secure_password";
        let wrong_password = "wrong_password";

        assert!(manager.verify_password(correct_password, &salt).unwrap());
        assert!(!manager.verify_password(wrong_password, &salt).unwrap());
    }
}