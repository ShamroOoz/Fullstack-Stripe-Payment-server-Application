"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const _1 = require("./");
const firebase_1 = require("./firebase");
const firebase_admin_1 = require("firebase-admin");
/**
 * Business logic for specific webhook event types
 */
const webhookHandlers = async (event, data) => {
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
        case "invoice.payment_succeeded":
            console.log("Add your business logic here");
            return await Promise.resolve(true);
        case "customer.subscription.deleted":
            const customer = (await _1.stripe.customers.retrieve(data.customer));
            const userId = customer.metadata.firebaseUID;
            const userRef = firebase_1.db.collection("users").doc(userId);
            return await userRef.update({
                activePlans: firebase_admin_1.firestore.FieldValue.arrayRemove(data.id),
            });
        case "customer.subscription.created":
            (async function () {
                const customer = (await _1.stripe.customers.retrieve(data.customer));
                const userId = customer.metadata.firebaseUID;
                const userRef = firebase_1.db.collection("users").doc(userId);
                return await userRef.update({
                    activePlans: firebase_admin_1.firestore.FieldValue.arrayUnion(data.plan.id),
                });
            })();
        case "invoice.payment_failed":
            (async function () {
                const customer = (await _1.stripe.customers.retrieve(data.customer));
                const userSnapshot = await firebase_1.db
                    .collection("users")
                    .doc(customer.metadata.firebaseUID)
                    .get();
                return await userSnapshot.ref.update({ status: "PAST_DUE" });
            })();
        default:
            console.log(`Unhandled event type ${event.type}.`);
            return await Promise.resolve(true);
    }
};
/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const event = _1.stripe.webhooks.constructEvent(req["rawBody"], sig, process.env.STRIPE_WEBHOOK_SECRET);
    try {
        await webhookHandlers(event, event.data.object);
        res.send({ received: true });
    }
    catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};
//# sourceMappingURL=webhooks.js.map