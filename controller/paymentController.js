var request = require("request");
var secret = process.env.SECRET_KEY;
var crypto = require("crypto");
const Doc = require("../models/Doc");
const House = require("../models/House");
const Land = require("../models/Land");
const Vehicle = require("../models/Vehicle");

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 8; i++) {
    if (i % 2 === 0) {
      result += "x";
    } else {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
  }

  result += "-";
  for (let i = 0; i < 4; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

const Payment = async (req, res) => {
  console.log(req.body);
  const doc = await Doc.findOne({
    $or: [
      { sellerEmail: req.body.Email },
      { buyerEmail: req.body.Email },
      { brokerEmail: req.body.Email },
    ],
  });

  if (!doc) {
    return res.json({
      success: true,
      docAvailable: false,
    });
  }

  const pendNumber = Number(doc.pendingId);
  const totalPrice = doc.price + doc.price * (2 / 100);
  const url = `https://api.signeasy.com/v3/rs/envelope/${pendNumber}`;
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
      accept: "application/json",
    },
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      response = json;
      if (
        json.recipients[0].status === "finalized" &&
        json.recipients[1].status === "finalized" &&
        doc.paymentStatus === "Not Paid"
      ) {
        var options = {
          method: "POST",
          url: "https://api.chapa.co/v1/transaction/initialize",
          headers: {
            Authorization:
              "Bearer CHASECK_TEST-qdTEq6YnHFFhFIPBePj9z51xJV5Hv5d5",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            email: req.body.Email,
            currency: "ETB",
            tx_ref: generateRandomString(),
            return_url: `${process.env.NEXT_PUBLIC_BSMS_FRONTEND_URL}/dashboard/seller/`,
          }),
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          const resp = JSON.parse(response.body);
          console.log(resp);
          res.json({
            success: true,
            docAvailable: true,
            Doc: doc,
            paymentStatus: doc.paymentStatus,
            url: resp.data.checkout_url,
          });
        });
      } else if (
        json.recipients[0].status === "finalized" &&
        json.recipients[1].status === "finalized" &&
        doc.paymentStatus === "Paid"
      ) {
        const pendId = Number(doc.pendingId);
        const originalId = Number(doc.originalId);
        const signedId = Number(doc.signedId);

        let options = {
          method: "GET",
          url: `https://api.signeasy.com/v3/rs/envelope/signed/pending/${pendId}`,
          headers: {
            Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
          },
        };
        request(options, async function (error, response) {
          if (error) res.json({ error: error });
          let resp = JSON.parse(response.body);
          if (resp.id) {
            const doc = await Doc.findOne({});
            doc.signedId = resp.id;
            await doc.save();
            let options = {
              method: "GET",
              url: `https://api.signeasy.com/v3/rs/envelope/signed/${signedId}/${originalId}/download`,
              headers: {
                Authorization: "Bearer " + process.env.SIGNEASY_ACCESS_TOKEN,
              },
              encoding: null,
            };
            request(options, function (error, response, body) {
              if (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
                return;
              }
              if (response.statusCode !== 200) {
                console.error(
                  "Request failed with status code:",
                  response.statusCode
                );
                res.status(response.statusCode).send("Request Failed");
                return;
              }
              res.setHeader("Content-Type", "application/pdf");
              res.setHeader(
                "Content-Disposition",
                "attachment; filename=certificate.pdf"
              );

              const pdfData = body;
              const base64PdfData = pdfData.toString("base64");
              res.json({
                success: true,
                docAvailable: true,
                paymentStatus: doc.paymentStatus,
                Doc: doc,
                pdfBase64Data: base64PdfData,
              });
            });
          }
        });
      }
    })
    .catch((err) => console.error("error:" + err));
};
const verifyPayment = async (req, res) => {
  if (req.body.status === "success") {
    const doc = await Doc.findOne({});
    console.log(doc);
    doc.paymentStatus = "Paid";
    await doc.save();
  }
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["Chapa-Signature"]) {
  }

  res.sendStatus(200);
};

const TranferMoney = async (req, res) => {
  console.log(req.body);
  var options = {
    method: "POST",
    url: "https://api.chapa.co/v1/transfers",
    headers: {
      Authorization: "Bearer CHASECK_TEST-qdTEq6YnHFFhFIPBePj9z51xJV5Hv5d5",
      "Content-Type": "application/json",
    },
    body: {
      account_name: req.body.Name,
      account_number: req.body.Number,
      amount: req.body.Price,
      currency: "ETB",
      reference: "3241342142sfdd",
      bank_code: "96e41186-29ba-4e30-b013-2ca36d7e7025",
    },
    json: true,
  };

  request(options, async function (error, response) {
    if (error) throw new Error(error);
    if (response.body.status === "success") {
      try {
        const doc = await Doc.findOne();
        doc.paymentWithdraw = "Done";
        await doc.save();
        const propertyId = doc.PropertyId;
        const property = await findProperty(propertyId);
        if (property) {
          property.Status = "Closed";
          await property.save();
          res.json({
            success: true,
            message: response.body.message,
          });
        } else {
          throw new Error("Property not found");
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
          success: false,
          message: "Error occurred while updating property status",
        });
      }
    }
    async function findProperty(propertyId) {
      let property = await House.findOne({ _id: propertyId });
      if (!property) {
        property = await Land.findOne({ _id: propertyId });
      }
      if (!property) {
        property = await Vehicle.findOne({ _id: propertyId });
      }
      return property;
    }
  });
};

module.exports = { Payment, verifyPayment, TranferMoney };
