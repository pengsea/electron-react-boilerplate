import CryptoJS from 'crypto-js';

let keyStr = 'JXU5NkM2JXU1NkUyJXU4RkQwJXU4NDI1JXU2NTcwJXU1QjU3JXU1MzE2JXU1MjA2JXU2NzkwJXU1RTczJXU1M0Yw';

//加密
export function encrypt(word) {
  keyStr = keyStr ? keyStr : 'abcdefgabcdefg12';
  let key = CryptoJS.enc.Utf8.parse(keyStr);//Latin1 w8m31+Yy/Nw6thPsMpO5fg==
  let srcs = CryptoJS.enc.Utf8.parse(word);
  let encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}

//解密
export function decrypt(word) {
  keyStr = keyStr ? keyStr : 'abcdefgabcdefg12';
  let key = CryptoJS.enc.Utf8.parse(keyStr);//Latin1 w8m31+Yy/Nw6thPsMpO5fg==
  let decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

//获取策略中的账号
export const getAccount = (name) => {
  if (!name) {
    return '';
  }
  let temp = name.match(/(?<=\().+(?=,)/gi);
  if (temp) {
    return temp[0];
  } else {
    return '';
  }
};
//获取策略中的索引
export const getIndex = (name) => {
  if (!name) {
    return '';
  }
  let temp = name.match(/(?<=strategy).+(?=\))/gi);
  if (temp) {
    return temp[0];
  } else {
    return '';
  }
};
