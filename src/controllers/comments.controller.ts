import { RequestHandler } from "express";
import { buildResponse } from "../common/utils";
import { AppDataSource } from "../data-source";

import { errorHandler } from "../common/errors";
import { CustomRequest } from "../types/types";
import CommentService from "../services/comments.service";

class CommentController {
  private _commentsService = new CommentService();

  getAllComments: RequestHandler = async (req, res) => {
    try {
      const comments = await this._commentsService.getAllComments(req.query);
      return res.status(200).send(buildResponse(comments, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getCommentById: RequestHandler = async (req, res) => {
    try {
      const comment = await this._commentsService.getCommentById(
        parseInt(req.params["id"])
      );
      return res.status(200).send(buildResponse(comment, "", ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createComment: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const comment = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          const comment = await this._commentsService.createComment(
            transactionEntityManager,
            req.body,
            req.context
          );

          return comment;
        }
      );

      return res
        .status(201)
        .send(buildResponse(comment, "Comment created successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateComment: RequestHandler = async (req: CustomRequest, res) => {
    try {
      const comment = await AppDataSource.transaction(
        async (transactionEntityManager) => {
          const comment = await this._commentsService.updateComment(
            transactionEntityManager,
            req.body,
            parseInt(req.params["id"]),
            req.context
          );

          return comment;
        }
      );

      return res
        .status(201)
        .send(buildResponse(comment, "comment updated successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteComment: RequestHandler = async (req: CustomRequest, res) => {
    try {
      await AppDataSource.transaction(async (transactionEntityManager) => {
        await this._commentsService.deleteComment(
          transactionEntityManager,
          parseInt(req.params["id"]),
          req.context
        );

        return;
      });

      return res
        .status(204)
        .send(buildResponse(null, "Comment deleted successfully."));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default CommentController;
