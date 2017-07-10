console.log("!!Node Start¡¡");
var crypto = require("crypto-js");
var secretKey = "KiwiBots17";

var encryptedMessage = crypto.AES.encrypt("Carlos Zubieta",secretKey);
console.log("Encrypted Messaje :" + encryptedMessage);

var decryptedMessage = crypto.AES.decrypt(encryptedMessage,secretKey);
console.log("Decrypted Messaje :" + decryptedMessage.toString(crypto.enc.Utf8));
 
