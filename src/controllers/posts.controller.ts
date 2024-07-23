/* eslint-disable prettier/prettier */
import { RequestHandler } from "express";
import { buildResponse } from "../common/utils";
import { AppDataSource } from "../data-source";

import { errorHandler } from "../common/errors";
import { CustomRequest } from "../types/types";
import PostService from "../services/posts.service";

class PostController {
  private _postsService = new PostService();

  searchPosts: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const posts = await this._postsService.searchPosts(
        req.query,
        req.context
      );
      return res.status(200).send(buildResponse(posts, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllPosts: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const posts = await this._postsService.getAllPosts(
        req.query,
        req.context
      );
      return res.status(200).send(buildResponse(posts, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllRecs: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const posts = await this._postsService.getRecommendedPosts(req.context);
      return res.status(200).send(buildResponse(posts, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllTags: RequestHandler = async (req, res) => {
    try {
      const posts = await this._postsService.getAllTags(req.query);
      return res.status(200).send(buildResponse(posts, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getPostById: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const post = await this._postsService.getPostById(
        parseInt(req.params["id"]),
        req.context
      );
      return res.status(200).send(buildResponse(post, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createPost: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const post = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          const Post = await this._postsService.createPost(
            transactionEntityManager,
            req.body,
            req.context
          );

          return Post;
        }
      );

      return res
        .status(201)
        .send(buildResponse(post, "Post created successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updatePost: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const post = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          const post = await this._postsService.updatePost(
            transactionEntityManager,
            req.body,
            parseInt(req.params["id"]),
            req.context
          );

          return post;
        }
      );

      return res
        .status(201)
        .send(buildResponse(post, "Post updated successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deletePost: RequestHandler = async (req: CustomRequest, res) => {
    try {
      await AppDataSource.transaction(async (transactionEntityManager) => {
        await this._postsService.deletePost(
          transactionEntityManager,
          parseInt(req.params["id"]),
          req.context
        );

        return;
      });

      return res
        .status(204)
        .send(buildResponse(null, "Post deleted successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default PostController;
