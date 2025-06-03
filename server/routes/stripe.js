const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { title, amount, userId } = req.body;

  console.log("🔥 Stripe create-checkout-session body:", { title, amount, userId });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: title },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      metadata: {
        userId: userId,
        campaignTitle: title
      },
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/cancel",
    });

    console.log("🎉 Created session with metadata:", session.metadata);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe session creation error:", error);
    res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
});

module.exports = router;
