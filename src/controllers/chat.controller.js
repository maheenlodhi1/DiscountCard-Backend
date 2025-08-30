const catchAsync = require('../utils/catchAsync');
const { chatService, tokenService } = require('../services');

const createChat = catchAsync(async (req, res) => {
    const chat = await chatService.createChat(req.body);
    res.status(200).send(chat);
});

const userChats = catchAsync(async (req, res) => {
    const chat = await chatService.findUserChats(req.params.userId);
    res.status(200).send(chat);
});

const findChatByIds = catchAsync(async (req, res) => {
    const { firstId, secondId } = req.body;
    const chat = await chatService.findUserChatById(firstId, secondId);
    res.status(200).send(chat);
});

const createMessage = catchAsync(async (req, res) => {
    const { chatId, messageBody } = req.body;
    const message = await chatService.createMessage(chatId, messageBody);
    res.status(200).send(message);
});

const getMessages = catchAsync(async (req, res) => {
    const messages = await chatService.getMessages(req.params.chatId);
    res.status(200).send(messages);
});
const setUnreadCount = catchAsync(async (req, res) => {
    const conversation = await chatService.setUnreadCount(
        req.body.chatId,
        req.body.count
    );
    res.status(200).send(conversation);
});
const deleteChat = catchAsync(async (req, res) => {
    const chat = await chatService.deleteChat(req.params.chatId);
    res.status(200).send(chat);
});
const updateChat = catchAsync(async (req, res) => {
    const chat = await chatService.updateChat(req.params.chatId, req.body);
    res.status(200).send(chat);
});
const getChatByLink = catchAsync(async (req, res) => {
    const chat = await tokenService.verifyToken(req.query.token);
    res.status(200).send(chat.sub);
});

module.exports = {
    createChat,
    userChats,
    findChatByIds,
    createMessage,
    getMessages,
    deleteChat,
    updateChat,
    setUnreadCount,
    getChatByLink,
};
