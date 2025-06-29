import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();


router
  .route("/:channelId")
  .patch(verifyJWT, toggleSubscription)
  .get(verifyJWT, getUserChannelSubscribers);

router.route("/users/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;