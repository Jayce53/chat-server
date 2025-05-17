import {createCipheriv, createDecipheriv, randomBytes} from "crypto";

class CryptoSimple {
  private static instance: CryptoSimple;

  private readonly secretKey: Buffer;

  private constructor() {
    // Initialize the secret key (must be 16, 24, or 32 bytes long for AES)
    this.secretKey = Buffer.from("Glass House MountainsQld"); // Example key, replace with your own
  }

  public static getInstance(): CryptoSimple {
    if (!CryptoSimple.instance) {
      CryptoSimple.instance = new CryptoSimple();
    }
    return CryptoSimple.instance;
  }

  // Function to encrypt text
  public encrypt(text: string): string {
    const iv = randomBytes(16); // Generate a random initialization vector
    const cipher = createCipheriv("aes-256-cbc", this.secretKey, iv); // Create a cipher using AES-256-CBC algorithm
    let encrypted = cipher.update(text, "utf-8", "hex"); // Encrypt the text
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted; // Return the IV concatenated with the encrypted text
  }

  // Function to decrypt text
  public decrypt(encryptedText: string): string {
    const iv = Buffer.from(encryptedText.slice(0, 32), "hex"); // Extract the IV from the encrypted text
    const encrypted = encryptedText.slice(32); // Extract the encrypted text
    const decipher = createDecipheriv("aes-256-cbc", this.secretKey, iv); // Create a decipher using AES-256-CBC algorithm
    let decrypted = decipher.update(encrypted, "hex", "utf-8"); // Decrypt the text
    decrypted += decipher.final("utf-8");
    return decrypted; // Return the decrypted text
  }
}

// Example usage
const cryptoInstance = CryptoSimple.getInstance();

const plaintext = "Hello, world!";
const encryptedText = cryptoInstance.encrypt(plaintext);
console.log("Encrypted:", encryptedText);

const decryptedText = cryptoInstance.decrypt(encryptedText);
console.log("Decrypted:", decryptedText);
