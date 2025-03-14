import { SessionType } from "@prisma/client";
import axios from "axios"

export const getPaypalAccessToken = async () => {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');

    const res = await axios.post(`${process.env.PAYPAL_BASE_URL}/oauth2/token`, body, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: process.env.PAYPAL_CLIENT_ID ?? "",
            password: process.env.PAYPAL_CLIENT_SECRET ?? "",
        },
    });

    if (!res || res.status != 200) return false;

    return res.data.access_token;
}

export const createPaypalProduct = async (name: string, description: string, accessToken: string) => {
    const res = await axios.post(`${process.env.PAYPAL_BASE_URL}/catalogs/products`, {
        "name": name,
        "description": description,
        "type": "SERVICE",
        "category": "EDUCATIONAL_AND_TEXTBOOKS"
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
        }
    });

    if (!res || res.status != 201) return false;

    return res.data.id;
}

export const createPaypalPlan = async (name: string, productId: string, accessToken: string, price: number, sessionType: SessionType) => {
    const res = await axios.post(`${process.env.PAYPAL_BASE_URL}/billing/plans`, {
        "product_id": productId,
        "name": `${name} ${sessionType.toString()} Plan`,
        "description": `${name} ${sessionType.toString()} plan`,
        "billing_cycles": [
            {
                "frequency": {
                    "interval_unit": "MONTH",
                    "interval_count": 1
                },
                "tenure_type": "REGULAR",
                "sequence": 1,
                "total_cycles": 0,
                "pricing_scheme": {
                    "fixed_price": {
                        "value": price,
                        "currency_code": "USD"
                    }
                }
            }
        ],
        "payment_preferences": {
            "auto_bill_outstanding": true,
            "setup_fee": {
                "value": "0",
                "currency_code": "USD"
            },
            "setup_fee_failure_action": "CONTINUE",
            "payment_failure_threshold": 3
        },
        "taxes": {
            "percentage": "0",
            "inclusive": true
        }
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=minimal'
        }
    });

    if (!res || res.status != 201) return false;

    return res.data.id;
}

export const getPaypalSubscription = async (subscriptionId: string, accessToken: string) => {
    const res = await axios.get(`${process.env.PAYPAL_BASE_URL}/billing/subscriptions/${subscriptionId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if(!res || res.status != 200) return false;

    return res.data
}