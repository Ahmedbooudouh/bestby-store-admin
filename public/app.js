// app.js - BestBuy Store Admin

// API of the product-service
const PRODUCT_API_URL = window.APP_CONFIG.PRODUCT_API_BASE_URL;
const form = document.getElementById("product-form");
const formMessage = document.getElementById("form-message");
const refreshBtn = document.getElementById("refresh-btn");
const productsContainer = document.getElementById("products-container");
const errorMessage = document.getElementById("error-message");
// To track if we are editing an existing product
let editingProductId = null;

// ---------- MESSAGES ---------- //

function setFormMessage(message, type) {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className =
    "message " + (type === "error" ? "error" : "success");
}

function clearFormMessage() {
  if (!formMessage) return;
  formMessage.textContent = "";
  formMessage.className = "message";
}

// ---------- CREATE / UPDATE PRODUCT ---------- //

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormMessage();

  const name = document.getElementById("name").value.trim();
  const category = document.getElementById("category").value;
  const price = Number(document.getElementById("price").value);
  const stock = Number(document.getElementById("stock").value);

  if (!name || !category || isNaN(price) || isNaN(stock)) {
    setFormMessage("Please fill all fields correctly.", "error");
    return;
  }

  const productPayload = {
    name,
    category,
    price,
    stock,
  };

  try {
    let response;

    if (editingProductId) {
      // UPDATE : PUT /api/products/:id
      response = await fetch(`${PRODUCT_API_URL}/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${text}`
        );
      }

      setFormMessage("✅ Product updated successfully!", "success");
    } else {
      // CREATE : POST /api/products
      response = await fetch(PRODUCT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${text}`
        );
      }

      setFormMessage("✅ Product created successfully!", "success");
    }

    form.reset();
    editingProductId = null;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Create Product";

    await loadProducts();
  } catch (err) {
    console.error("Error saving product:", err);
    setFormMessage("❌ Failed to save product: " + err.message, "error");
  }
});

// ---------- READ : LOAD PRODUCTS ---------- //

async function loadProducts() {
  if (!productsContainer || !errorMessage) return;

  productsContainer.innerHTML = "";
  errorMessage.textContent = "";

  try {
    const response = await fetch(PRODUCT_API_URL);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${text}`
      );
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : [];

    if (products.length === 0) {
      productsContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    products.forEach((product) => {
      const card = createAdminProductCard(product);
      productsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading products:", err);
    errorMessage.textContent = "Failed to load products: " + err.message;
  }
}

// ---------- ADMIN PRODUCT CARD (READ + EDIT + DELETE) ---------- //

function createAdminProductCard(product) {
  const card = document.createElement("div");
  card.className = "admin-product-card";

  const id = product._id || product.id || "(no id)";
  const name = product.name || "Unnamed";
  const category = product.category || "Unknown";
  const price = product.price ?? "N/A";
  const stock = product.stock ?? "N/A";

  const nameEl = document.createElement("h3");
  nameEl.textContent = name;
  card.appendChild(nameEl);

  const idEl = document.createElement("p");
  idEl.style.fontSize = "0.8rem";
  idEl.style.color = "#666";
  idEl.textContent = `ID: ${id}`;
  card.appendChild(idEl);

  const categoryEl = document.createElement("p");
  categoryEl.innerHTML = `<strong>Category:</strong> ${category}`;
  card.appendChild(categoryEl);

  const priceEl = document.createElement("p");
  priceEl.innerHTML = `<strong>Price:</strong> $${price}`;
  card.appendChild(priceEl);

  const stockEl = document.createElement("p");
  stockEl.innerHTML = `<strong>Stock:</strong> ${stock}`;
  card.appendChild(stockEl);

  // Boutons Edit / Delete
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "0.5rem";
  btnRow.style.marginTop = "0.5rem";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.className = "btn-secondary";
  editBtn.addEventListener("click", () => {
    enterEditMode(product);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.style.backgroundColor = "#c62828";
  deleteBtn.style.color = "#fff";
  deleteBtn.addEventListener("click", () => {
    deleteProduct(id);
  });

  btnRow.appendChild(editBtn);
  btnRow.appendChild(deleteBtn);
  card.appendChild(btnRow);

  return card;
}

// ---------- EDIT MODE ---------- //

function enterEditMode(product) {
  clearFormMessage();

  const id = product._id || product.id;
  if (!id) {
    setFormMessage("Cannot edit: product has no id.", "error");
    return;
  }

  editingProductId = id;

  document.getElementById("name").value = product.name || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("price").value = product.price ?? "";
  document.getElementById("stock").value = product.stock ?? "";

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Update Product";

  setFormMessage("Edit mode: you are editing an existing product.", "success");
}

// ---------- DELETE PRODUCT ---------- //

async function deleteProduct(productId) {
  if (!productId) {
    alert("Cannot delete: invalid product id.");
    return;
  }

  const ok = confirm("Are you sure you want to delete this product?");
  if (!ok) return;

  try {
    const response = await fetch(`${PRODUCT_API_URL}/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${text}`
      );
    }

    if (editingProductId === productId) {
      form.reset();
      editingProductId = null;
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = "Create Product";
      clearFormMessage();
    }

    await loadProducts();
  } catch (err) {
    console.error("Error deleting product:", err);
    alert(" Failed to delete product: " + err.message);
  }
}

// ---------- REFRESH BUTTON + INIT ---------- //

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadProducts();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
