// ================================
// apps/api/src/sse/order-status.js - Server-Sent Events for Order Tracking
// ================================
import { collections, toObjectId } from "../db.js";

/**
 * SSE endpoint for real-time order status updates
 * GET /api/orders/:id/stream
 * 
 * Auto-simulates order progression:
 * PENDING → PROCESSING → SHIPPED → DELIVERED
 */
export async function streamOrderStatus(req, res) {
  const { id } = req.params;
  const { orders } = collections();

  // Validate order ID
  let objectId;
  try {
    objectId = toObjectId(id);
  } catch (error) {
    return res.status(400).json({
      error: { code: "INVALID_ID", message: "Invalid order ID format" }
    });
  }

  // Get initial order
  const order = await orders.findOne({ _id: objectId });
  if (!order) {
    return res.status(404).json({
      error: { code: "ORDER_NOT_FOUND", message: "Order not found" }
    });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Send initial status immediately
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({
    orderId: order._id,
    status: order.status,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
    updatedAt: order.updatedAt || order.createdAt,
    message: `Order is currently ${order.status}`
  });

  // Status progression flow
  const statusFlow = {
    PENDING: { next: "PROCESSING", delay: 3000 },
    PROCESSING: { next: "SHIPPED", delay: 5000 },
    SHIPPED: { next: "DELIVERED", delay: 5000 },
    DELIVERED: { next: null, delay: 0 }
  };

  let currentStatus = order.status;
  let intervalId = null;

  // Auto-progress order status
  const progressOrder = async () => {
    const flow = statusFlow[currentStatus];
    
    if (!flow || !flow.next) {
      // Order is already DELIVERED or unknown status
      clearInterval(intervalId);
      res.end();
      return;
    }

    // Wait for specified delay
    await new Promise(resolve => setTimeout(resolve, flow.delay));

    // Update to next status
    currentStatus = flow.next;
    const now = new Date();
    
    // Update database
    const updateData = {
      status: currentStatus,
      updatedAt: now
    };

    // Add carrier info when shipped
    if (currentStatus === "SHIPPED" && !order.carrier) {
      const carriers = ["UPS", "DHL", "USPS", "FedEx"];
      updateData.carrier = carriers[Math.floor(Math.random() * carriers.length)];
      
      // Set estimated delivery (3-7 days from now)
      const daysToAdd = Math.floor(Math.random() * 5) + 3;
      const estimatedDelivery = new Date(now);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToAdd);
      updateData.estimatedDelivery = estimatedDelivery.toISOString();
    }

    // ✅ NEW: Update delivery date to today when delivered
    if (currentStatus === "DELIVERED") {
      updateData.estimatedDelivery = now.toISOString(); // Delivered today!
    }

    await orders.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    // Send SSE event to client
    sendEvent({
      orderId: order._id,
      status: currentStatus,
      carrier: updateData.carrier || order.carrier,
      estimatedDelivery: updateData.estimatedDelivery || order.estimatedDelivery,
      updatedAt: now,
      message: getStatusMessage(currentStatus)
    });

    console.log(`[SSE] Order ${id} → ${currentStatus}`);

    // If DELIVERED, close the stream
    if (currentStatus === "DELIVERED") {
      clearInterval(intervalId);
      setTimeout(() => res.end(), 1000);
    }
  };

  // Start auto-progression
  intervalId = setInterval(progressOrder, 100); // Check frequently

  // Clean up on client disconnect
  req.on("close", () => {
    console.log(`[SSE] Client disconnected from order ${id}`);
    if (intervalId) clearInterval(intervalId);
    res.end();
  });
}

function getStatusMessage(status) {
  const messages = {
    PENDING: "Order received and awaiting processing",
    PROCESSING: "Order is being prepared for shipment",
    SHIPPED: "Order has been shipped and is on the way",
    DELIVERED: "Order has been delivered successfully"
  };
  return messages[status] || `Order status: ${status}`;
}