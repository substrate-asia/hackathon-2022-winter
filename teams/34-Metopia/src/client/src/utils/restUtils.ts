const defaultSWRConfig = {
    refreshInterval: 0,
    revalidateOnFocus: false
}

const encodeQueryData = (url, data) => {
    if (!data || !Object.keys(data))
        return url
    const ret = [];
    for (let d in data) {
        ret.push(encodeURIComponent(d) + '=' + (data[d] != null ? encodeURIComponent(data[d]) : ''));
    }
    if (!url?.length) {
        return ret.join('&')
    }
    if (url.indexOf("?") > -1) {
        return url + "&" + ret.join('&')
    }
    else return url + "?" + ret.join('&')
}

export const decodeQueryData = (url): any => {
    let res = {}
    let tmp = url.split("?")
    if (tmp.length <= 1) {
        return {}
    } else {
        let tmpp = tmp[1].split("&")
        tmpp.forEach(t => {
            let tmppp = t.split("=")
            res[tmppp[0]] = tmppp.length === 1 ? '' : decodeURIComponent(tmppp[1])
        })
    }
    return res
}


const getFetcher = (url, params?) => fetch(encodeQueryData(url, params)).then((res) => res.json())

const postFetcher = (url, params) => fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
        'content-type': "application/json"
    }
}).then((res) => {
    return res.json()
})

export interface ResponsePack<T> {
    code: number,
    content: T
}

export { defaultSWRConfig, encodeQueryData, getFetcher, postFetcher }