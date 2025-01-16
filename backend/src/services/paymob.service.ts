import { SessionType } from "@prisma/client";
import axios from "axios"
import { convertUSDtoEGP } from "../utils/helper.util";

export const getPaymobAcceessToken = async () => {
    const res = await axios.post(`${process.env.PAYMOB_BASE_URL}/api/auth/tokens`, {
        'api_key': process.env.PAYMOB_API_KEY
    });

    if (!res || res.status != 201) return false;

    return res.data.token;
}

export const createPaymobPlan = async (name: string, accessToken: string, price: number, sessionType: SessionType) => {
    console.log(process.env.PAYMOB_INTEGERATION_URL);
    const res = await axios.post(`${process.env.PAYMOB_BASE_URL}/api/acceptance/subscription-plans`, {
        "frequency": 30,
        "name": `${name} ${sessionType.toString()} Plan`,
        "reminder_days": null,
        "retrial_days": null,
        "plan_type": "rent",
        "number_of_deductions": null,
        "amount_cents": price * 100,
        "use_transaction_amount": true,
        "is_active": true,
        "integration": process.env.PAYMOB_INTEGERATION_ID,
        "fee": null
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
        }
    });

    if (!res || res.status != 201) return false;

    return res.data.id;
}

export const createPaymobSubscription = async (name: string, email: string, price: number, planId: number) => {
    const amountEgp = await convertUSDtoEGP(price);
    if(!amountEgp) return false;

    console.log("amount in egp");
    console.log(Math.ceil(amountEgp));

    const res = await axios.post(`${process.env.PAYMOB_BASE_URL}/v1/intention`, {
        "amount": Math.ceil(amountEgp) * 100,
        "currency": "EGP",
        "payment_methods": [
            parseInt(process.env.PAYMOB_INTEGERATION_ID ?? "")
        ],
        "subscription_plan_id": planId,
        "billing_data": {
            "first_name": name.split(" ")[0],
            "last_name": name.split(" ").slice(1).join(" ") ?? "-",
            "email": email,
            "phone_number": process.env.PAYMOB_PLACEHOLDER_PHONENUMBER
        }
    }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYMOB_SECRET_KEY}`
        }
    });

    if(!res || res.status != 201) return false;

    const {id, client_secret} = res.data;
    return {id, client_secret};
}