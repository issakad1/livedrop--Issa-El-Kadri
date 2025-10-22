// ================================
// apps/api/src/sse/order-status.js
// Server-Sent Events (SSE) for Real-Time Order Tracking
// ================================
import express from "express";
import { collections, toObjectId } from "../db.js";

const router = express.Router();

/**
 * GET /api/orders/:id/stream
 * 
 * Sends real-time updates for a specific order using SSE.
 * Simulates order progression automatically:
 * PENDING → PROCESSING → SHIPPED → DELIVERED
 */
router.get("/:id/stream", async (req, res) => {
  const { id } = req.params;
  const { orders } = collections();

  // ✅ Validate ID
  let objectId;
  try {
    objectId = toObjectId(id);
  } catch (error) {
    return res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid order ID format" }
    });
  }

  // ✅ Find the order
  const order = await orders.findOne({ _id: objectId });
  if (!order) {
    return res.status(404).json({
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" }
    });
  }

  // ✅ SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Utility function to send events
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial order state immediately
  sendEvent({
    orderId: order._id,
    status: order.status,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
    updatedAt: order.updatedAt || order.createdAt,
    message: `Order is currently ${order.status}`
  });

  // ✅ Define status flow simulation
  const statusFlow = {
    PENDING: { next: "PROCESSING", delay: 3000 },
    PROCESSING: { next: "SHIPPED", delay: 5000 },
    SHIPPED: { next: "DELIVERED", delay: 5000 },
    DELIVERED: { next: null, delay: 0 }
  };

  let currentStatus = order.status;

  // Function to simulate status progression
  const progressOrder = async () => {
    const flow = statusFlow[currentStatus];
    if (!flow || !flow.next) return; // Reached final state

    await new Promise((r) => setTimeout(r, flow.delay));
    currentStatus = flow.next;
    const now = new Date();

    const updateData = {
      status: currentStatus,
      updatedAt: now
    };

    // Add carrier and estimated delivery when shipped
    if (currentStatus === "SHIPPED" && !order.carrier) {
      const carriers = ["UPS", "DHL", "USPS", "FedEx"];
      updateData.carrier = carriers[Math.floor(Math.random() * carriers.length)];

      const days = Math.floor(Math.random() * 5) + 3; // 3–7 days
      const eta = new Date(now);
      eta.setDate(eta.getDate() + days);
      updateData.estimatedDelivery = eta.toISOString();
    }

    // Set delivery time to now when delivered
    if (currentStatus === "DELIVERED") {
      updateData.estimatedDelivery = now.toISOString();
    }

    // Update DB
    await orders.updateOne({ _id: objectId }, { $set: updateData });

    // Send update to client
    sendEvent({
      orderId: order._id,
      status: currentStatus,
      carrier: updateData.carrier || order.carrier,
      estimatedDelivery: updateData.estimatedDelivery || order.estimatedDelivery,
      updatedAt: now,
      message: getStatusMessage(currentStatus)
    });

    console.log(`[SSE] Order ${id} → ${currentStatus}`);

    // End stream after delivery
    if (currentStatus === "DELIVERED") {
      setTimeout(() => res.end(), 1000);
    }
  };

  // ✅ Start status progression interval
  const loop = setInterval(progressOrder, 100);

  // ✅ Cleanup on client disconnect
  req.on("close", () => {
    console.log(`[SSE] Client disconnected from order ${id}`);
    clearInterval(loop);
    res.end();
  });
});

// Helper to generate readable status messages
function getStatusMessage(status) {
  const messages = {
    PENDING: "Order received and awaiting processing",
    PROCESSING: "Order is being prepared for shipment",
    SHIPPED: "Order has been shipped and is on the way",
    DELIVERED: "Order has been delivered successfully"
  };
  return messages[status] || `Order status: ${status}`;
}

export default router;
