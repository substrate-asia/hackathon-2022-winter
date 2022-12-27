import React, { useEffect, useState } from 'react'

const getDateDiff = (dateTimeStamp, hideAgo?) => {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = Math.abs(now - dateTimeStamp);
    if (diffValue < 0) { return; }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    let result
    if (monthC >= 1) {
        result = "" + Math.floor(monthC) + " month" + (Math.floor(monthC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
    }
    else if (dayC >= 1) {
        result = "" + Math.floor(dayC) + " day" + (Math.floor(dayC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
    }
    else if (hourC >= 1) {
        result = "" + Math.floor(hourC) + " hour" + (Math.floor(hourC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
    }
    else if (minC > 1) {
        result = "" + Math.floor(minC) + " minutes" + (hideAgo ? "" : " ago");
    } else {
        result = "Now";
    }
    return result;
}

const customFormat = (date, formatString) => {
    if (!date)
        return ''
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    YY = ((YYYY = date.getFullYear()) + "").slice(-2);
    MM = (M = date.getMonth() + 1) < 10 ? ('0' + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = date.getDate()) < 10 ? ('0' + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY)
        .replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M)
        .replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = date.getHours());
    if (h == 0) h = 24;
    // if (h > 12) h -= 12;
    hh = h < 10 ? ('0' + h) : h;
    hhhh = hhh < 10 ? ('0' + hhh) : hhh;
    AMPM = (ampm = hhh < 12 ? 'AM' : 'PM').toUpperCase();
    mm = (m = date.getMinutes()) < 10 ? ('0' + m) : m;
    ss = (s = date.getSeconds()) < 10 ? ('0' + s) : s;
    return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h)
        .replace("#mm#", mm).replace("#m#", m)
        .replace("#ss#", ss).replace("#s#", s)
        .replace("#ampm#", ampm).replace("#AMPM#", AMPM);
}

const customUTCFormat = (date: Date, formatString) => {
    if (!date)
        return ''
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    YY = ((YYYY = date.getUTCFullYear()) + "").slice(-2);
    MM = (M = date.getUTCMonth() + 1) < 10 ? ('0' + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = date.getUTCDate()) < 10 ? ('0' + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY)
        .replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M)
        .replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = date.getUTCHours());
    if (h == 0) h = 24;
    // if (h > 12) h -= 12;
    hh = h < 10 ? ('0' + h) : h;
    hhhh = hhh < 10 ? ('0' + hhh) : hhh;
    AMPM = (ampm = hhh < 12 ? 'AM' : 'PM').toUpperCase();
    mm = (m = date.getUTCMinutes()) < 10 ? ('0' + m) : m;
    ss = (s = date.getUTCSeconds()) < 10 ? ('0' + s) : s;
    return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h)
        .replace("#mm#", mm).replace("#m#", m)
        .replace("#ss#", ss).replace("#s#", s)
        .replace("#ampm#", ampm).replace("#AMPM#", AMPM);
}

const getDateDiff2 = (date1, date2) => {
    var diffValue = date1.getTime() - date2.getTime();
    if (diffValue < 0) { return '00:00:00'; }

    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var now = new Date().getTime();
    var dayC = Math.floor(diffValue / day);
    diffValue -= dayC * day
    var hourC = Math.floor(diffValue / hour);
    diffValue -= hourC * hour
    var minC = Math.floor(diffValue / minute);
    var secondC = Math.floor((diffValue - minC * minute) / 1000)

    let result = ''
    if (dayC >= 1) {
        result = "" + Math.floor(dayC) + "D ";
    }
    result += (hourC < 10 ? '0' + hourC : hourC) + ":";
    result += (minC < 10 ? '0' + minC : minC) + ":";
    result += (secondC < 10 ? '0' + secondC : secondC);

    return result
}

const useTimer = () => {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const tmp = setInterval(() => {
            setNow(new Date())
        }, 1000)
        return () => clearInterval(tmp)
    }, [])

    return { now }
}




export {
    getDateDiff, getDateDiff2, customFormat, useTimer, customUTCFormat
}