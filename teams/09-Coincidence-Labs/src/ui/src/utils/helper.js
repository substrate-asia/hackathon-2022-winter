import { Base64 } from 'js-base64'

const b64uLookup = {
    "/": "_",
    "_": "/",
    "+": "-",
    "-": "+",
    "=": ".",
    ".": "=",
    "N": 'p',
    "p": 'N'
};

export const b64uEnc = (str) => {
    return Base64.encode(str).replace(/(\+|\/|=)/g, (m) => b64uLookup[m])
}

export const b64uDec = (str) =>
    Base64.decode(str.replace(/(-|_|\.)/g, (m) => b64uLookup[m]));

export const sleep = async function (interval = 6) {
    return new Promise((resolve) => {
        setTimeout(resolve, interval * 1000); // 6秒
    });
}

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
export const isHexStrict = function (hex) {
  return ((typeof hex === 'string' || typeof hex === 'number') && /^(-)?0x[0-9a-f]*$/i.test(hex));
};

export const u8arryToHex = (buffer) => {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
}

export const hexTou8array = (hex) => {
    return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
}

export const hexToString = (str) => {
  if (str.length % 2 !== 0){
    console.log('Not a hex');
    return ""
  }
   let val = "";
   for (let i = 0; i < str.length; i+=2) {
     const n = parseInt(str[i] + str[i+1], 16)
     val += String.fromCharCode(n);
   }
   return val;
}

export const stringToHex = (str) => {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    if (val == "") {
      val = str.charCodeAt(i).toString(16);
    } else {
      val += str.charCodeAt(i).toString(16);
    }
  }
  return val;
}

export const formatAmount = function (value) {
  if (!value) return "0.00";
  let unit = ''
  let digit = 3
  const nm = Number(value)
  if(nm < 1) {
    digit = 4
  }
  if (nm > 1000) {
    digit = 2
  }
  if (Number.isInteger(nm)) {
    digit = 0
  }
  value = Number(value)
  if (value < 1e6) {
  }else if (value < 1e9){
    value = value / 1e6
    unit = 'M'
  }else if(value < 1e12) {
    value = value / 1e9
    unit = 'B'
  }
  const str = value.toFixed(digit).toString();
  let integer = str;
  let fraction = "";
  if (str.includes(".")) {
    integer = str.split(".")[0];
    fraction = "." + str.split(".")[1];
  }
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + fraction + unit;
}

/**
 * 
 * @param {*} value 
 * @param {*} abb is abbreviations 
 * @returns 
 */
 export const formatPrice = function (value, abb=false) {
  if (!value) return "$0.00";
  let unit = ''
  if(Number(value) > 1e6) {
    abb = true
  }
  let digit = 3
  if(Number(value) < 1) {
    digit = 4
  }
  if (abb) {
    value = Number(value)
    if (value < 1000) {}
    else if (value < 1e6) {
      value = value / 1000
      unit ='K'
    }else if (value < 1e9){
      value = value / 1e6
      unit = 'M'
    }else if(value < 1e12) {
      value = value / 1e9
      unit = 'B'
    }
  }
  const str = Number(value).toFixed(digit).toString();
  let integer = str;
  let fraction = "";
  if (str.includes(".")) {
    integer = str.split(".")[0];
    fraction = "." + str.split(".")[1];
  }
  return "$" + integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + fraction + unit;
};

export function getDateString(now, timezone, extra = 0) {
  now = now || new Date();
  const offset = timezone != null ? timezone * 3600 : 0;
  now = new Date(now.getTime() + (offset + extra) * 1000);
  return now.toISOString().replace("T", " ").substring(0, 19);
}

export function isDateString(str) {
  const regex_date = /^20\d{2}-\d{2}-\d{2} \d{2}\:\d{2}(:\d{2})?$/
  const res = str.match(regex_date)
  return res && res.length > 0
}

export function getUTCTime() {
  const d1 = new Date();
  const d2 = new Date(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds())
  return Date.parse(d2);
}

export function parseTimestamp(time) {
  if (!time) {
    return ''
  }
  let timestamp = new Date(time).getTime() / 1000
  // let _dif = new Date().getTimezoneOffset();
  // timestamp += _dif * 60
  
  let nowStamp = new Date().getTime() / 1000
  nowStamp = parseInt(nowStamp)
  timestamp = parseInt(timestamp)
  let diff = nowStamp - timestamp;
  if (diff < 0) {
    diff = timestamp - nowStamp
    if (diff < 10) {
      return 'Now'
    }else if(diff < 60) {
      return `${diff} seconds left`
    }else if (diff < 3600) {
      return `${Math.floor(diff / 60)} mins left`
    }else if (diff < 3600 * 24) {
      return `${Math.floor(diff / 3600)} hours left`
    }else if (diff < 3600 * 24 * 30) {
      return `${Math.floor(diff / 3600 / 24)} days left`
    }else if (diff < 3600 * 24 * 60) {
      return '1 month left'
    }else {
      return getDateString(null, null, timestamp - nowStamp)
    }
  }else {
    if (diff < 10) {
      return 'Now'
    }else if(diff < 60) {
      return `${diff} seconds ago`
    }else if (diff < 3600) {
      return `${Math.floor(diff / 60)} mins ago`
    }else if (diff < 3600 * 24) {
      return `${Math.floor(diff / 3600)} hours ago`
    }else if (diff < 3600 * 24 * 30) {
      return `${Math.floor(diff / 3600 / 24)} days ago`
    }else if (diff < 3600 * 24 * 60) {
      return '1 month ago'
    }else {
      return getDateString(null, null, timestamp - nowStamp)
    }
  }
}

/**
 * 
 * @param {*} time timeinterval(second)
 */
export function parseTimestampToUppercase(time) {
  if (!time) return ''
  let timestamp = new Date().getTime() / 1000
  if (time - timestamp > 0) {
    let sec = time - timestamp;
    let days = Math.floor(sec / (24 * 3600))
    let leave1 = sec % (24 * 3600)
    let hours = Math.floor(leave1 / (3600))
    let leave2 = leave1 % 3600
    let minutes = Math.floor(leave2 / 60)
    let leave3 = leave2%60
    let seconds = Math.round(leave3)
    if (days > 0) {
      return `${days} DAY ${hours} HOURS ${minutes} MIN`
    }else {
      if (hours > 0) {
        return `${hours} HOURS ${minutes} MIN ${seconds} S`
      }else {
        return `${minutes} MIN ${seconds} S`
      }
    }
  }else {
    let monthMap = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    let d1 = new Date(time * 1000)
    return `${d1.getUTCHours() >= 12 ? (d1.getUTCHours() - 12) + 'PM' : (d1.getUTCHours()) + 'AM'},${monthMap[d1.getUTCMonth()]} ${d1.getUTCDate()},${d1.getUTCFullYear()}(UTC)`
  }
}

export function parseSpaceStartTime(time) {
  let monthMap = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  let d1 = new Date(time)
  return `${d1.getUTCHours() >= 12 ? prefixInteger(d1.getUTCHours() - 12, 2) + ":" + prefixInteger(d1.getMinutes(), 2) + 'PM' : prefixInteger(d1.getUTCHours(), 2) + ':' + prefixInteger(d1.getMinutes(), 2) + 'AM'}(UTC),${monthMap[d1.getUTCMonth()]} ${d1.getUTCDate()}`
}

export function stringLength(str) {
  if (!str || str.length === 0) return 0;
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    }else {
      len += 2;
    }
  }
  return len;
}

export function prefixInteger(num, length) {
  var i = (num + "").length;
  while(i++ < length) num = "0" + num;
  return num;
}

export function sortCurations(curations) {
  if (curations && curations.length > 0){
    const now = (new Date().getTime() / 1000).toFixed(0)
    const pending = curations.filter(c => c.endtime > now)
    const ended = curations.filter(c => c.endtime <= now)
    return pending.reverse().concat(ended)
  }
  return []
}