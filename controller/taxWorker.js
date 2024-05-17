const { workerData, parentPort } = require("worker_threads");

function calculateTax(price) {
  let taxRate;
  if (price <= 1000000) {
    taxRate = 1.5;
  } else {
    taxRate = 3.2;
  }
  return price * (taxRate / 100);
}

const tax = calculateTax(workerData);

parentPort.postMessage(tax);
