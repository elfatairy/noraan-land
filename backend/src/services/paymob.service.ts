import axios from "axios";
import { convertUSDtoEGP } from "../utils/helper.util";

let accessToken: undefined | string;
let accessTokenCreatedAt: undefined | Date;

export const getPaymobAcceessToken = async () => {
  if (
    accessToken &&
    accessTokenCreatedAt &&
    new Date().getTime() - accessTokenCreatedAt.getTime() < 3600000
  ) {
    return accessToken;
  }

  const res = await axios.post(
    `${process.env.PAYMOB_BASE_URL}/api/auth/tokens`,
    {
      api_key: process.env.PAYMOB_API_KEY,
    }
  );

  if (!res || res.status != 201) return false;

  accessToken = res.data.token;
  accessTokenCreatedAt = new Date();

  return res.data.token;
};

export const createPaymobPlan = async (name: string, price: number) => {
  const accessToken = await getPaymobAcceessToken();

  const amountEgp = await convertUSDtoEGP(price);
  if (!amountEgp) return false;

  const res = await axios.post(
    `${process.env.PAYMOB_BASE_URL}/api/acceptance/subscription-plans`,
    {
      frequency: 30,
      name: `${name} Plan`,
      reminder_days: null,
      retrial_days: null,
      plan_type: "rent",
      number_of_deductions: null,
      amount: amountEgp * 100,
      currency: "EGP",
      use_transaction_amount: true,
      is_active: true,
      integration: process.env.PAYMOB_INTEGERATION_ID,
      fee: null,
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

export const createPaymobSubscription = async (
  name: string,
  email: string,
  price: number,
  planId: number
) => {
  const amountEgp = await convertUSDtoEGP(price);
  if (!amountEgp) return false;

  console.log("amount in egp");
  console.log(Math.ceil(amountEgp));

  const res = await axios.post(
    `${process.env.PAYMOB_BASE_URL}/v1/intention`,
    {
      amount: Math.ceil(amountEgp) * 100,
      currency: "EGP",
      payment_methods: [parseInt(process.env.PAYMOB_INTEGERATION_ID ?? "")],
      subscription_plan_id: planId,
      billing_data: {
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") ?? "-",
        email: email,
        phone_number: process.env.PAYMOB_PLACEHOLDER_PHONENUMBER,
      },
      notification_url: process.env.PAYMOB_NOTIFICATION_URL,
      redirection_url: process.env.PAYMOB_REDIRECTION_URL,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYMOB_SECRET_KEY}`,
      },
    }
  );

  if (!res || res.status != 201) return false;

  const {
    id,
    client_secret,
  } = res.data;
  return { id, client_secret };
};

export const cancelPaymobSubscription = async (
  subscriptionId: string,
  planId: number
) => {
  const accessToken = await getPaymobAcceessToken();

  console.log("step 1");
  let res = await axios.post(
    `${process.env.PAYMOB_BASE_URL}/api/acceptance/subscriptions/${subscriptionId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log("done step 1");

  if (!res || res.status != 200) return false;

  console.log("step 2");
  res = await axios.post(
    `${process.env.PAYMOB_BASE_URL}/api/acceptance/subscription-plans/${planId}/suspend`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  console.log("done step 2");

  if (!res || res.status != 200) return false;

  return true;
};
