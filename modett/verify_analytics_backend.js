import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const API_URL = "http://localhost:3001/api/v1";

async function verifyAnalytics() {
  const orderId = uuidv4();
  const productId = uuidv4();
  const variantId = uuidv4();
  const sessionId = uuidv4();
  // guestToken must probably be a specific format? Usually UUID or specific length string.
  // checking session-manager.ts (viewed earlier), it's a UUID.
  const guestToken = uuidv4();

  const payload = {
    orderId: orderId,
    sessionId: sessionId,
    guestToken: guestToken,
    totalAmount: 99.99,
    orderItems: [
      {
        productId: productId,
        variantId: variantId,
        quantity: 1,
        price: 99.99,
      },
    ],
  };

  console.log("Sending Test Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(
      `${API_URL}/analytics/track/purchase`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response Status:", res.status);
    console.log("Response Data:", res.data);

    if (res.status === 200 || res.status === 201 || res.status === 204) {
      console.log("SUCCESS: Backend accepted the analytics event.");
    } else {
      console.log("WARNING: Unexpected status code.");
    }
  } catch (error) {
    if (error.response) {
      console.error(
        "FAILED: Server responded with error:",
        error.response.status
      );
      console.error("Error Data:", error.response.data);
    } else {
      console.error("FAILED: Network or code error:", error.message);
    }
  }
}

verifyAnalytics();
