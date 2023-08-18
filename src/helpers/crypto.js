import cryptoJs from 'crypto-js';
import { _commonGetCommonInfo } from './common';

// 암호화
export function _encrypt(text) {
   const cipher = cryptoJs.AES.encrypt(text, cryptoJs.enc.Utf8.parse(_commonGetCommonInfo("cryptoInfo").key), {
       iv: cryptoJs.enc.Utf8.parse(_commonGetCommonInfo("cryptoInfo").iv),
       padding: cryptoJs.pad.Pkcs7,
       mode: cryptoJs.mode.CBC,
   });
   return cipher.toString();
}

// 복호화
export function _decrypt(encryptedText) {
    const decipher = cryptoJs.AES.decrypt(encryptedText, cryptoJs.enc.Utf8.parse(_commonGetCommonInfo("cryptoInfo").key), {
        iv: cryptoJs.enc.Utf8.parse(_commonGetCommonInfo("cryptoInfo").iv),
        padding: cryptoJs.pad.Pkcs7,
        mode: cryptoJs.mode.CBC,
    })
    return decipher.toString(cryptoJs.enc.Utf8);
}