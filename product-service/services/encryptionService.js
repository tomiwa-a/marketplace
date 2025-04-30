const crypto = require('crypto');

class EncryptionService {
    constructor() {
        // Initialize with a secure key management system
        this.algorithm = 'aes-256-gcm';
        // In production, use secure key management
        this.secretKey = process.env.ENCRYPTION_KEY || 'your-secure-key-here';
    }

    async encrypt(data) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
            
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                encryptedData: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    async decrypt(encryptedData, iv, authTag) {
        try {
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.secretKey,
                Buffer.from(iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}

module.exports = EncryptionService;