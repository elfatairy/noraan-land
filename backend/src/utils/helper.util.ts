import axios from "axios";

export const decoder = (str: string) =>
    decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'));

let latestUpdate = new Date(0);
let latestValue = 0;
export const convertUSDtoEGP = async (amount: number) => {
    const now = new Date();
    if(now.getTime() - latestUpdate.getTime() > 86400000) {
        const res = await axios.get("https://api.currencyapi.com/v3/latest", {
            headers: {
                "apikey": process.env.CURRENCYAPI_API_KEY
            }
        });
        if(!res || res.status != 200 || !res.data.data.EGP) return false;

        latestValue = res.data.data.EGP.value;
        latestUpdate = now;
    }

    return amount * latestValue;
}