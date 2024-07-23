import { Router } from "express";
import userRouter from "./users.routes";
import authRouter from "./auth.routes";
import postRouter from "./posts.routes";
import commentRouter from "./comments.routes";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);

export default router;
