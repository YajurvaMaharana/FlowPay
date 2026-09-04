import express from "express";
import path from "path";
import cors from "cors";
import Razorpay from "razorpay";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount } = req.body;
      
      const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

      if (key_id === "rzp_test_dummy") {
        // Return a mock order_id if keys are not configured
        return res.json({ 
          order_id: "order_dummy_" + Date.now(), 
          amount: Math.round(amount * 100), 
          currency: "INR" 
        });
      }

      const razorpay = new Razorpay({
        key_id,
        key_secret,
      });

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      };

      const order = await razorpay.orders.create(options);
      res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
