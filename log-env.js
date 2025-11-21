import { config } from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();
config({
  path: join(__dirname, "config", "config.env")
});

// Log all environment variables
console.log('All Environment Variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('EMAIL') || key.includes('CLOUDINARY') || key.includes('MONGO') || key.includes('PORT')) {
    console.log(`${key}=${process.env[key]}`);
  }
});

// Check for EmailJS variables specifically
const emailJsVars = [
  'EMAILJS_PUBLIC_KEY',
  'EMAILJS_PRIVATE_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID'
];

console.log('\nChecking for EmailJS variables:');
emailJsVars.forEach(key => {
  console.log(`${key} exists: ${!!process.env[key]}`);
  if (process.env[key]) {
    console.log(`${key} value: ${process.env[key]}`);
  }
}); 