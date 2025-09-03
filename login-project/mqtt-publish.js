// mqtt-publish.js
const mqtt = require('mqtt');

// =====================
// Load biến môi trường
// =====================
const HOST = process.env.HIVEMQ_HOST;
const USER = process.env.HIVEMQ_USER;   // publish only
const PASS = process.env.HIVEMQ_PASS;
const PORT = process.env.HIVEMQ_PORT || 8883;

if (!HOST || !USER || !PASS) {
  console.error("❌ Missing HiveMQ credentials (HIVEMQ_HOST / HIVEMQ_USER / HIVEMQ_PASS)");
}

// =====================
// Kết nối MQTT Broker
// =====================
const url = `mqtts://${HOST}:${PORT}`;

const client = mqtt.connect(url, {
  username: USER,
  password: PASS,
  clientId: 'server-' + Math.random().toString(16).substr(2, 8), // random clientId
  reconnectPeriod: 3000,   // tự động reconnect sau 3s nếu mất kết nối
});

// Event
client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud');
});

client.on('error', (err) => {
  console.error('❌ MQTT Connection Error:', err.message);
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting to HiveMQ...');
});

// =====================
// Hàm publish book info
// =====================
function publishBook(bookId, bookInfo) {
  const topic = `library/books/${bookId}`;   // topic theo id sách
  const payload = JSON.stringify(bookInfo);

  client.publish(
    topic,
    payload,
    { qos: 1, retain: true },
    (err) => {
      if (err) {
        console.error('❌ Publish error:', err.message);
      } else {
        console.log(`📚 Published to ${topic}:`, payload);
      }
    }
  );
}

module.exports = { publishBook, client };
