const { Worker } = require("worker_threads");
const path = require("path");

const calculateCommissionHandler = (req, res) => {
  const { price } = req.body;

  if (!price) {
    return res.status(400).json({ error: "Price is required." });
  }

  const startTime = process.hrtime();
  let commission, tax;

  const commissionWorkerFilePath = path.resolve(
    __dirname,
    "./commissionWorker.js"
  );
  const taxCalculatorFilePath = path.resolve(__dirname, "./taxWorker.js");

  const commissionWorker = new Worker(commissionWorkerFilePath, {
    workerData: price,
  });

  const taxCalculatorWorker = new Worker(taxCalculatorFilePath, {
    workerData: price,
  });

  commissionWorker.on("message", (calculatedCommission) => {
    commission = calculatedCommission;

    if (commission !== undefined && tax !== undefined) {
      sendResponse();
    }
  });

  taxCalculatorWorker.on("message", (calculatedTax) => {
    tax = calculatedTax;

    if (commission !== undefined && tax !== undefined) {
      sendResponse();
    }
  });

  const sendResponse = () => {
    const endTime = process.hrtime(startTime);
    const responseTimeInMilliseconds = (
      endTime[0] * 1000 +
      endTime[1] / 1000000
    ).toFixed(2);
    res.json({
      commission,
      tax,
      responseTime: responseTimeInMilliseconds + "ms",
    });
  };

  commissionWorker.on("error", (err) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  taxCalculatorWorker.on("error", (err) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });
};

module.exports = { calculateCommissionHandler };
