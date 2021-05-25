import { stripe } from "./";
import Stripe from "stripe";
import { db } from "./firebase";
import { firestore } from "firebase-admin";
import { Request, Response } from "express";

/**
 * Business logic for specific webhook event types
 */
const webhookHandlers = async (
  event: Stripe.Event,
  data: any
): Promise<any> => {
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("Add your business logic here");
      return await Promise.resolve(true);

    case "checkout.session.completed":
      console.log("Add your business logic here");
      return await Promise.resolve(true);

    case "checkout.session.completed":
      console.log("Add your business logic here");
      return await Promise.resolve(true);

    case "customer.subscription.deleted":
      const customer = (await stripe.customers.retrieve(
        data.customer as string
      )) as Stripe.Customer;
      const userId = customer.metadata.firebaseUID;
      const userRef = db.collection("users").doc(userId);
      return await userRef.update({
        activePlans: firestore.FieldValue.arrayRemove(data.id),
      });

    case "customer.subscription.created":
      const customer: Stripe.Customer = await stripe.customers.retrieve(
        data.customer as string
      );
      const userId = customer.metadata.firebaseUID;
      const userRef = db.collection("users").doc(userId);

      return await userRef.update({
        activePlans: firestore.FieldValue.arrayUnion(data.plan.id),
      });

    default:
      console.log(`Unhandled event type ${event.type}.`);
      return await Promise.resolve(true);
  }
};
/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const event = stripe.webhooks.constructEvent(
    req["rawBody"],
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  try {
    await webhookHandlers(event, event.data.object);
    res.send({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
