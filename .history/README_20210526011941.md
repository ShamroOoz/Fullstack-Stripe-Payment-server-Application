## Backend Setup

The `/server` directory contains the Node.js API. Replace the `.env` file with your API credentials.

```
npm install

npm run dev
```

## Running Webhooks in Development

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) to run webhooks in development.

```
stripe listen --forward-to localhost:3333/hooks
```
