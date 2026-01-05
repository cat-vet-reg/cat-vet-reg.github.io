export function convertDate(inputDate) {

    const date = new Date(inputDate);
    return `${getDate(date.getDate())}.${getDate(date.getMonth() + 1)}.${date.getFullYear()}`;
}

const getDate = (date) => {
    return (date < 10) ? `0${date}` : date;
}