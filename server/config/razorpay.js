const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

try {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_smartfleet123';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_smartfleet_test_key';

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (error) {
  console.warn('[SmartFleet Razorpay] Failed to initialize Razorpay client:', error.message);
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_smartfleet_test_key';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

module.exports = {
  razorpayInstance,
  verifyPaymentSignature,
};
