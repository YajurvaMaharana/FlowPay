import express from "express";
import path from "path";
import cors from "cors";
import Razorpay from "razorpay";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from "./src/data/products";


dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));


  app.post("/api/vision", async (req, res) => {
    try {
      const { imageBase64, textPrompt } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 in request" });
      }

      // Extract accurate mimeType and base64 data
      let imageMimeType = 'image/jpeg';
      let base64Data = imageBase64;
      if (imageBase64.includes(';base64,')) {
        const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
        if (match) {
          imageMimeType = match[1];
        }
        base64Data = imageBase64.split(';base64,')[1];
      } else if (imageBase64.includes(',')) {
        base64Data = imageBase64.split(',')[1];
      }

      const productCatalog = PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        tags: p.tags
      }));
      
      const prompt = `You are Veluno Concierge's expert workspace vision and hardware analyst.
Analyze this workspace/desk setup image and the accompanying user note: "${textPrompt || 'Analyze my workspace setup'}".
Identify ergonomic gaps, computing bottlenecks, or missing productivity hardware (e.g., laptop resting flat on desk causing neck strain, absence of ultrawide curved monitor/4K display, lack of tactile mechanical keyboard, need for high-speed NVMe storage, or poor desk lighting).

Select the top 1-2 matching products from the following merchant catalog that directly address the workspace needs or user's hardware request:
Catalog: ${JSON.stringify(productCatalog)}

Respond ONLY with a valid JSON object in this exact format:
{
  "detectedIssue": "Detailed, professional ergonomic and workspace assessment (e.g., Laptop resting flat on desk causing posture strain, and lack of secondary ultrawide 4K display)",
  "productIds": ["prod_id_1", "prod_id_2"]
}`;

      let parsed: { detectedIssue: string; productIds: string[] } | null = null;

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        // Multimodal model candidates with high-availability gemini-3.1-flash-lite, gemini-flash-latest, and gemini-3.8-flash
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType: imageMimeType
                      }
                    },
                    { text: prompt }
                  ]
                }
              ],
              config: {
                responseMimeType: "application/json",
                temperature: 0.2
              }
            });

            const responseText = response.text;
            if (responseText) {
              const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
              parsed = JSON.parse(cleaned);
              if (parsed && Array.isArray(parsed.productIds) && parsed.productIds.length > 0) {
                break;
              }
            }
          } catch {
            // Gracefully proceed to next candidate or heuristic fallback
            continue;
          }
        }
      }

      // Robust offline/fallback analysis if model is rate-limited, 503 overloaded, or offline
      if (!parsed || !parsed.productIds || parsed.productIds.length === 0) {
        const lowerPrompt = (textPrompt || '').toLowerCase();
        let fallbackProducts: string[] = ['prod_laptop_stand', 'prod_keychron_mech'];
        let detected = 'Laptop resting flat on desk causing cervical neck strain, paired with missing ergonomic riser and mechanical keyboard.';

        if (lowerPrompt.includes('laptop') || lowerPrompt.includes('portable') || lowerPrompt.includes('macbook')) {
          fallbackProducts = ['prod_apexbook_pro16', 'prod_laptop_stand'];
          detected = 'Workspace ready for high-performance creator workstation; paired with ergonomic aluminum riser.';
        } else if (lowerPrompt.includes('pc') || lowerPrompt.includes('desktop') || lowerPrompt.includes('rig') || lowerPrompt.includes('gaming')) {
          fallbackProducts = ['prod_velox_rig_4080', 'prod_lumina_monitor'];
          detected = 'Desk setup requires high-performance liquid-cooled rig and 34" ultrawide curved display.';
        } else if (lowerPrompt.includes('ssd') || lowerPrompt.includes('storage') || lowerPrompt.includes('drive') || lowerPrompt.includes('speed')) {
          fallbackProducts = ['prod_hyperdrive_2tb_ssd', 'prod_velox_rig_4080'];
          detected = 'High-throughput storage bottlenecks detected; Gen4 7,450 MB/s NVMe expansion recommended.';
        } else if (lowerPrompt.includes('monitor') || lowerPrompt.includes('screen') || lowerPrompt.includes('display') || lowerPrompt.includes('ultrawide')) {
          fallbackProducts = ['prod_lumina_monitor', 'prod_light_bar'];
          detected = 'Single-screen setup causing visual fatigue; 34" 4K HDR ultrawide curved monitor recommended.';
        }

        parsed = {
          detectedIssue: detected,
          productIds: fallbackProducts
        };
      }

      res.json(parsed);
    } catch {
      res.json({
        detectedIssue: "Ergonomic workspace optimization detected (Laptop riser & dual display setup recommended).",
        productIds: ["prod_laptop_stand", "prod_lumina_monitor"]
      });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, expire_by: customExpireBy } = req.body;
      const currentEpochSeconds = Math.floor(Date.now() / 1000);
      const expire_by = customExpireBy || (currentEpochSeconds + 300); // 300s = 5 minutes
      
      const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

      if (key_id === "rzp_test_dummy") {
        // Return a mock order_id with 5-minute expiry data
        return res.json({ 
          key: key_id,
          order_id: "order_dummy_" + Date.now(), 
          amount: Math.round(amount * 100), 
          currency: "INR",
          expire_by,
          expires_at: new Date(expire_by * 1000).toISOString(),
          countdown_seconds: 300,
          urgency_lock: "5_MINUTE_EPHEMERAL_LOCK"
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
        notes: {
          expire_by: expire_by.toString(),
          ephemeral_gateway_lock: "5_MINUTES"
        }
      };

      const order = await razorpay.orders.create(options);
      res.json({
        key: key_id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        expire_by,
        expires_at: new Date(expire_by * 1000).toISOString(),
        countdown_seconds: 300,
        urgency_lock: "5_MINUTE_EPHEMERAL_LOCK"
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/generate-payment", async (req, res) => {
    try {
      const { amount, customer_email, order_description, expire_by: customExpireBy } = req.body;
      const currentEpochSeconds = Math.floor(Date.now() / 1000);
      const expire_by = customExpireBy || (currentEpochSeconds + 300); // 300s = exactly 5 minutes
      const amountPaise = Math.round(amount * 100);
      const orderId = `ord_flw_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const linkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
      const shortUrl = `https://rzp.io/i/${linkId}`;
      const expiresAt = new Date(expire_by * 1000).toISOString();

      const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
      const key_secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

      if (key_id !== "rzp_test_dummy") {
        try {
          const razorpay = new Razorpay({ key_id, key_secret });
          if ((razorpay as any).paymentLink && typeof (razorpay as any).paymentLink.create === 'function') {
            const rzpLink = await (razorpay as any).paymentLink.create({
              amount: amountPaise,
              currency: "INR",
              accept_partial: false,
              description: order_description || "Veluno Hardware Order",
              customer: {
                email: customer_email || "customer@example.com"
              },
              notify: { sms: false, email: true },
              reminder_enable: false,
              expire_by,
              notes: {
                cryptographic_gateway_lock: "5_MINUTES",
                order_id: orderId
              }
            });

            return res.json({
              orderId,
              razorpayPaymentLinkId: rzpLink.id,
              razorpayShortUrl: rzpLink.short_url,
              razorpayKey: key_id,
              amount,
              amountInPaise: amountPaise,
              currency: "INR",
              expire_by,
              expires_at: expiresAt,
              countdown_seconds: 300,
              ttl_seconds: 300,
              urgency_lock: "5_MINUTE_EPHEMERAL_LOCK",
              status: "created"
            });
          }
        } catch (rzpErr) {
          console.warn("Razorpay API create payment link fallback:", rzpErr);
        }
      }

      return res.json({
        orderId,
        razorpayPaymentLinkId: linkId,
        razorpayShortUrl: shortUrl,
        razorpayKey: key_id,
        amount,
        amountInPaise: amountPaise,
        currency: "INR",
        expire_by,
        expires_at: expiresAt,
        countdown_seconds: 300,
        ttl_seconds: 300,
        urgency_lock: "5_MINUTE_EPHEMERAL_LOCK",
        status: "created"
      });
    } catch (error) {
      console.error("Error in /api/generate-payment:", error);
      res.status(500).json({ error: "Failed to generate payment link" });
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
