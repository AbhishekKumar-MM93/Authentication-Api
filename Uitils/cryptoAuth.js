import CryptoJS from "crypto-js";

const CRYPTO_SECRET_KEY = "ABHISHEK";

export const encryption = (password) => {
  const encryptPassword = CryptoJS.AES.encrypt(
    password,
    CRYPTO_SECRET_KEY
  ).toString();
  return encryptPassword;
};
// console.log(process.env.CRYPTO_SECRET_KEY);

export const decryption = (encrPassword) => {
  /// encrPassword comes from data base
  const decryptPassword = CryptoJS.AES.decrypt(
    encrPassword,
    CRYPTO_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);
  return decryptPassword;
};
