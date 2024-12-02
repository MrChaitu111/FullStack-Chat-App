import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getMessages, getUsersFromSiderbar, sendMessage } from '../controllers/message.controllers.js';

const router = express.Router();

router.get("/users",protectRoute,getUsersFromSiderbar);
router.get("/:id",protectRoute,getMessages);

router.post("/send/:id",protectRoute, sendMessage);


export default router;