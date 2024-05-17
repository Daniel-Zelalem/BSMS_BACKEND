const { workerData, parentPort } = require("worker_threads");

function calculateCommission(price) {
  let commissionRate;
  if (price <= 1000000) {
    commissionRate = 2.2;
  } else {
    commissionRate = 5.2;
  }
  return price * (commissionRate / 100);
}

// Calculate commission
const commission = calculateCommission(workerData);

// Send commission back to the main thread
parentPort.postMessage(commission);
