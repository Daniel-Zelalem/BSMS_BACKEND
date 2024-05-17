const Chat = require("../models/Chat");
const User = require("../models/Users");
const Message = require("../models/Message");
const { pusherServer } = require("../ChatPusher/pusher");

//Create New chates
const createNewChat = async (req, res) => {
  try {
    const { currentUserId, members, isGroup, name, groupPhoto } = req.body;

    const query = isGroup
      ? { isGroup, name, groupPhoto, members: [currentUserId, ...members] }
      : { members: { $all: [currentUserId, ...members], $size: 2 } };

    let chat = await Chat.findOne(query);

    if (!chat) {
      chat = await new Chat(
        isGroup ? query : { members: [currentUserId, ...members] }
      );

      await chat.save();

      const updateAllMembers = chat.members.map(async (memberId) => {
        await User.findByIdAndUpdate(
          memberId,
          {
            $addToSet: { chats: chat._id },
          },
          { new: true }
        );
      });
      await Promise.all(updateAllMembers);
      /* Trigger a Pusher event for each member to notify a new chat */
      chat.members.map(async (member) => {
        await pusherServer.trigger(member._id.toString(), "new-chat", chat);
      });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create a new chat" });
  }
};

// Retrieve chat details
const getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate({
        path: "members",
        model: User,
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .exec();

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get chat details" });
  }
};

// Update seen messages
const updateSeenMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { currentUserId } = req.body;

    await Message.updateMany(
      { chat: chatId },
      { $addToSet: { seenBy: currentUserId } },
      { new: true }
    )
      .populate({
        path: "sender seenBy",
        model: User,
      })
      .exec();

    res.status(200).json("Seen all messages by current user");
  } catch (err) {
    console.error(err);
    res.status(500).json("Failed to update seen messages");
  }
};

// Update group chat info
const updateGroupChatInfo = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name, groupPhoto } = req.body;

    const updatedGroupChat = await Chat.findByIdAndUpdate(
      chatId,
      { name, groupPhoto },
      { new: true }
    );

    res.status(200).json(updatedGroupChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update group chat info" });
  }
};

module.exports = {
  createNewChat,
  getChatDetails,
  updateSeenMessages,
  updateGroupChatInfo,
};
