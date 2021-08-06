export const getAmountFromTransaction = t => +t.value / 10 ** +t.tokenDecimal;
export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}