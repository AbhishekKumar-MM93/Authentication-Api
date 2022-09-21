import CryptoJS from "crypto-js";
import aes256 from "aes256";

// let key = "Abhishek Kumar";

// let publish_Pk = "Kumar 007";
// let secret_Sk = "ABHISHEK 007";
// let buffer = Buffer.from(secret_Sk);

// let encryptSecret = aes256.encrypt(key, secret_Sk);
// console.log(encryptSecret, "Sk --- EN");

// let bcryptSecret = aes256.decrypt(key, encryptSecret);
// console.log(bcryptSecret, "sk-----dec");

// let buffer02 = Buffer.from(publish_Pk);

// var encryptedPublish = aes256.encrypt(key, publish_Pk);
// console.log(encryptedPublish, "En-----Pk");
// var decryptedPublish = aes256.decrypt(key, encryptedPublish);
// console.log(decryptedPublish, "DEC------PK");

let secretKey = "secret";
// let password = "12345";

// let encrypted = CryptoJS.AES.encrypt(password, secretKey);
// console.log(encrypted.toString());

let encryptPassword = "U2FsdGVkX1984Bn4VaLdDI3bf/qj/PpVTTDT5+lXw2M=";

let decrypted = CryptoJS.AES.decrypt(encryptPassword, secretKey);
let decryptedPassword = decrypted.toString(CryptoJS.enc.Utf8);
console.log(decryptedPassword);
