// orders.js - BestBuy Store Admin - Orders Management
const ORDER_API_URL = window.APP_CONFIG.ORDER_API_BASE_URL;
const ordersContainer = document.getElementById("orders-container");
const ordersError = document.getElementById("orders-error");
const refreshOrdersBtn = document.getElementById("refresh-orders-btn");

// ---------- Helpers ---------- //

function formatDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}
// Format number as currency string
function formatCurrency(amount) {
  if (typeof amount !== "number") return amount;
  return "$" + amount.toFixed(2);
}

// ---------- LOAD ORDERS ---------- //

async function loadOrders() {
  if (!ordersContainer || !ordersError) return;

  ordersContainer.innerHTML = "";
  ordersError.textContent = "";

  console.log("[Admin] Loading orders from", ORDER_API_URL);

  try {
    const response = await fetch(ORDER_API_URL);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${text}`
      );
    }

    const data = await response.json();
    const orders = Array.isArray(data) ? data : [];

    console.log("[Admin] Orders received:", orders);

    if (orders.length === 0) {
      ordersContainer.innerHTML =
        '<p class="order-empty">No orders found yet. Place an order from the store-front, then click "Refresh Orders".</p>';
      return;
    }

    orders.forEach((order) => {
      const card = createOrderCard(order);
      ordersContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading orders:", err);
    ordersError.textContent = "Failed to load orders: " + err.message;
  }
}


// ---------- RENDER ORDER CARD ---------- //

function createOrderCard(order) {
  const card = document.createElement("div");
  card.className = "order-card";

  const id = order._id || order.id || "(no id)";
  const status = (order.status || "PENDING").toUpperCase();
  const createdAt = order.createdAt ? formatDate(order.createdAt) : "";
  const total = typeof order.totalAmount === "number" ? order.totalAmount : 0;
  const items = Array.isArray(order.items) ? order.items : [];

  // Header
  const header = document.createElement("div");
  header.className = "order-header";

  const title = document.createElement("h3");
  title.textContent = `Order`;
  header.appendChild(title);

  const statusBadge = document.createElement("span");
  statusBadge.className = "order-status";

  if (status === "COMPLETED") {
    statusBadge.classList.add("completed");
  } else if (status === "CANCELLED") {
    statusBadge.classList.add("cancelled");
  } else {
    statusBadge.classList.add("pending");
  }
  statusBadge.textContent = status;

  header.appendChild(statusBadge);
  card.appendChild(header);

  // ID + date
  const idEl = document.createElement("p");
  idEl.className = "order-id";
  idEl.textContent = `ID: ${id}`;
  card.appendChild(idEl);

  if (createdAt) {
    const dateEl = document.createElement("p");
    dateEl.className = "order-meta";
    dateEl.textContent = `Created: ${createdAt}`;
    card.appendChild(dateEl);
  }

  // Items
  if (items.length > 0) {
    const itemsTitle = document.createElement("p");
    itemsTitle.className = "order-meta";
    itemsTitle.textContent = "Items:";
    card.appendChild(itemsTitle);

    const ul = document.createElement("ul");
    ul.className = "order-items";

    items.forEach((it) => {
      const li = document.createElement("li");
      const name = it.name || "Unnamed product";
      const qty = it.quantity ?? 1;
      const price = typeof it.price === "number" ? it.price : 0;
      li.textContent = `${name} x ${qty} (${formatCurrency(price)} each)`;
      ul.appendChild(li);
    });

    card.appendChild(ul);
  }

  // Total
  const totalEl = document.createElement("p");
  totalEl.className = "order-total";
  totalEl.textContent = `Total: ${formatCurrency(total)}`;
  card.appendChild(totalEl);

  // Actions
  const actions = document.createElement("div");
  actions.className = "order-actions";

  if (status === "PENDING" || status === "PROCESSING") {
    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.textContent = "Mark as Completed";
    completeBtn.className = "btn-primary btn-complete";
    completeBtn.addEventListener("click", () => {
      updateOrderStatus(id, "COMPLETED");
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel Order";
    cancelBtn.className = "btn-secondary btn-cancel";
    cancelBtn.addEventListener("click", () => {
      const ok = confirm("Are you sure you want to cancel this order?");
      if (ok) {
        updateOrderStatus(id, "CANCELLED");
      }
    });

    actions.appendChild(completeBtn);
    actions.appendChild(cancelBtn);
  } else {
    const info = document.createElement("p");
    info.className = "order-meta";
    info.textContent = "This order is already finalized.";
    actions.appendChild(info);
  }

  card.appendChild(actions);

  return card;
}
// ---------- UPDATE ORDER STATUS ---------- //
async function updateOrderStatus(orderId, newStatus) {
  if (!orderId) {
    alert("Invalid order id.");
    return;
  }

  try {
    const response = await fetch(`${ORDER_API_URL}/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${text}`
      );
    }

    await loadOrders();
  } catch (err) {
    console.error("Error updating order status:", err);
    alert("Failed to update order: " + err.message);
  }
}
// ---------- INIT ---------- //
if (refreshOrdersBtn) {
  refreshOrdersBtn.addEventListener("click", () => {
    loadOrders();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});
