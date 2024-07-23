/* eslint-disable prettier/prettier */
import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator";

import PostController from "../controllers/posts.controller";
import { AddPost, UpdatePost } from "../schemas/post";

const postRouter = Router({ mergeParams: true });

const postController = new PostController();

postRouter.get("/", postController.getAllPosts);
postRouter.post("/", bodySchemaValidator(AddPost), postController.createPost);
postRouter.get("/tags", postController.getAllTags);
postRouter.get("/search", postController.searchPosts);
postRouter.get("/recommended", postController.getAllRecs);

postRouter.get("/:id", postController.getPostById);

postRouter.put(
  "/:id",
  bodySchemaValidator(UpdatePost),
  postController.updatePost
);

postRouter.delete("/:id", postController.deletePost);

export default postRouter;
