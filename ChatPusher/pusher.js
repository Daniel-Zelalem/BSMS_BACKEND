const PusherServer = require("pusher");

const dotenv = require("dotenv");

dotenv.config();

const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "ap2",
  useTLS: true,
});

module.exports = { pusherServer };
