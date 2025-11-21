import bcrypt from "bcryptjs";

const password = "admin123";

// Generate hash synchronously
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("Password:", password);
console.log("Hash:", hash); 