import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";
import CommentController from "../controllers/comments.controller";
import { AddComment, UpdateComment } from "../schemas/comment";

const commentRouter = Router({ mergeParams: true });

const commentController = new CommentController();

commentRouter.get("/", commentController.getAllComments);
commentRouter.post(
  "/",
  bodySchemaValidator(AddComment),
  commentController.createComment
);

commentRouter.get("/:id", commentController.getCommentById);

commentRouter.put(
  "/:id",
  bodySchemaValidator(UpdateComment),
  commentController.updateComment
);

commentRouter.delete("/:id", commentController.deleteComment);

export default commentRouter;
