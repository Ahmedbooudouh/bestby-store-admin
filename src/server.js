// bestby-store-admin/src/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Statics (HTML, JS, CSS, images…)
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Internal API targets
const PRODUCT_API_BASE =
  process.env.PRODUCT_API_BASE || "http://product-service:4000/api/products";
const ORDER_API_BASE =
  process.env.ORDER_API_BASE || "http://order-service:4001/api/orders";

// ======================= PRODUITS ======================= //

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const upstreamRes = await fetch(PRODUCT_API_BASE);
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (err) {
    console.error("[store-admin] Error proxying GET /api/products:", err);
    res.status(500).json({ error: "Failed to load products." });
  }
});

// POST /api/products
app.post("/api/products", async (req, res) => {
  try {
    const upstreamRes = await fetch(PRODUCT_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(upstreamRes.status).send(data);
  } catch (err) {
    console.error("[store-admin] Error proxying POST /api/products:", err);
    res.status(500).json({ error: "Failed to create product." });
  }
});

// PUT /api/products/:id
app.put("/api/products/:id", async (req, res) => {
  try {
    const url = `${PRODUCT_API_BASE}/${req.params.id}`;

    const upstreamRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(upstreamRes.status).send(data);
  } catch (err) {
    console.error("[store-admin] Error proxying PUT /api/products/:id:", err);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// DELETE /api/products/:id
app.delete("/api/products/:id", async (req, res) => {
  try {
    const url = `${PRODUCT_API_BASE}/${req.params.id}`;
    console.log("[store-admin] DELETE /api/products/:id →", url);

    const upstreamRes = await fetch(url, {
      method: "DELETE",
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(upstreamRes.status).send(data);
  } catch (err) {
    console.error("[store-admin] DELETE /api/products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ======================= ORDERS ======================= //

// GET /api/orders
app.get("/api/orders", async (req, res) => {
  try {
    const upstreamRes = await fetch(ORDER_API_BASE);
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (err) {
    console.error("[store-admin] Error proxying GET /api/orders:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// PATCH /api/orders/:id/status 
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    // IMPORTANT: order-service attend PATCH /api/orders/:id  
    const url = `${ORDER_API_BASE}/${req.params.id}`;

    const upstreamRes = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(upstreamRes.status).send(data);
  } catch (err) {
    console.error(
      "[store-admin] Error proxying PATCH /api/orders/:id/status:",
      err
    );
    res.status(500).json({ error: "Failed to update order status." });
  }
});

// PATCH /api/orders/:id (update order)
app.patch("/api/orders/:id", async (req, res) => {
  try {
    
    const url = `${ORDER_API_BASE}/${req.params.id}`;
    console.log("[store-admin] PATCH /api/orders/:id →", url);

    const upstreamRes = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await upstreamRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(upstreamRes.status).send(data);
  } catch (err) {
    console.error("[store-admin] PATCH /api/orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`store-admin is running on port ${PORT}`);
  console.log(`Proxying products from: ${PRODUCT_API_BASE}`);
  console.log(`Proxying orders   from: ${ORDER_API_BASE}`);
});
