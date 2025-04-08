import CryptoJS from 'crypto-js'

// 加密
function encrypt(keyStr: string, str: string): string {
  let key = CryptoJS.enc.Utf8.parse(keyStr)
  let srcs = CryptoJS.enc.Utf8.parse(str)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    blockSize: 16
  })

  // 返回base64格式的加密结果
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}

// 解密
function decrypt(keyStr: string, str: string): string {
  let key = CryptoJS.enc.Utf8.parse(keyStr)
  let base64 = CryptoJS.enc.Base64.parse(str)
  let src = CryptoJS.enc.Base64.stringify(base64)

  const decrypt = CryptoJS.AES.decrypt(src, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    blockSize: 16
  })

  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}

export { encrypt, decrypt }
