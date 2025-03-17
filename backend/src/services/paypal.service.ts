import { SessionType } from "@prisma/client";
import axios from "axios";

let accessToken: undefined | string;
let accessTokenCreatedAt: undefined | Date;

export const getPaypalAccessToken = async () => {
  if (
    accessToken &&
    accessTokenCreatedAt &&
    new Date().getTime() - accessTokenCreatedAt.getTime() < 3600000
  ) {
    return accessToken;
  }

  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");

  const res = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/oauth2/token`,
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.PAYPAL_CLIENT_ID ?? "",
        password: process.env.PAYPAL_CLIENT_SECRET ?? "",
      },
    }
  );

  if (!res || res.status != 200) return false;

  accessToken = res.data.access_token;
  accessTokenCreatedAt = new Date();

  return res.data.access_token;
};

export const createPaypalProduct = async (
  name: string,
  description: string
) => {
  const accessToken = await getPaypalAccessToken();

  const res = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/catalogs/products`,
    {
      name: name,
      description: description,
      type: "SERVICE",
      category: "EDUCATIONAL_AND_TEXTBOOKS",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    }
  );

  if (!res || res.status != 201) return false;

  return res.data.id;
};

export const createPaypalPlan = async (
  name: string,
  productId: string,
  price: number
) => {
  const accessToken = await getPaypalAccessToken();

  const res = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/billing/plans`,
    {
      product_id: productId,
      name: `${name} Plan`,
      description: `${name} plan`,
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "TRIAL",
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: "0",
              currency_code: "USD",
            },
          },
        },
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 2,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: price,
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    }
  );

  if (!res || res.status != 201) return false;

  return res.data.id;
};

export const cancelPaypalSubscription = async (
  subscriptionId: string,
  planId: string
) => {
  const accessToken = await getPaypalAccessToken();

  console.log("step 1");
  let res = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/billing/subscriptions/${subscriptionId}/cancel`,
    {
      reason: "Subscription Cancelled"
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log("done step 1");
  
  if (!res || res.status != 204) return false;

  console.log("step 2");
  res = await axios.post(
    `${process.env.PAYPAL_BASE_URL}/billing/plans/${planId}/deactivate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log("done step 2");

  if (!res || res.status != 204) return false;

  return true;
};

export const getPaypalSubscription = async (subscriptionId: string) => {
  const accessToken = await getPaypalAccessToken();

  const res = await axios.get(
    `${process.env.PAYPAL_BASE_URL}/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res || res.status != 200) return false;

  return res.data;
};
