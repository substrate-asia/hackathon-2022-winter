
const AddresstoShow = (address:string) => {
    if (!address) return "..."

    let frontStr = address.substring(0, 10);

    let afterStr = address.substring(address.length - 10, address.length);

    return `${frontStr} ... ${afterStr}`

}

const dateFormat = (dateTime:number) => {
    const t = new Date(dateTime);
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const day = t.getDate();
    const hours = t.getHours();
    const minutes = t.getMinutes();
    const seconds = t.getSeconds();
    return `${month>=10?'':'0'}${month} / ${day>=10?'':'0'}${day} / ${year} ${hours>=10?'':'0'}${hours} : ${minutes>=10?'':'0'}${minutes} : ${seconds>=10?'':'0'}${seconds}`
}



export default {
  AddresstoShow,
    dateFormat
};
