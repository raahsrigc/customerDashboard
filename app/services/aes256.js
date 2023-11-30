// const { AES, SHA256, enc } = require('crypto-js');
const CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = "859aa1127c96a7da";
const IV = "1b554da30e64f609";

function encrypt(val) {
    const cipher = CryptoJS.AES.encrypt(val, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
        iv: CryptoJS.enc.Utf8.parse(IV), // parse the IV 
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    })
    return cipher.toString();
}

function decrypt(val) {
    const cipher = CryptoJS.AES.decrypt(val, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
        iv: CryptoJS.enc.Utf8.parse(IV), // parse the IV 
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8)
    return cipher;
}

module.exports = { decrypt, encrypt };