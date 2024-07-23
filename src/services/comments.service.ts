import { EntityManager } from "typeorm";

import { ForbiddenError, ResourceNotFoundError } from "../common/errors";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { Comment } from "../entity/Comment";
import {
  CommentSchema,
  SearchCommentSchema,
  UpdateCommentSchema,
} from "../schemas/comment";
import { Post } from "../entity/Post";
import { RequestContext } from "../interfaces/types";

class CommentService {
  getAllComments = async (query: SearchCommentSchema) => {
    const commentRepository = await AppDataSource.getRepository(Comment);

    let qb = commentRepository
      .createQueryBuilder("comment")
      .leftJoin("comment.user", "user")
      .select([
        "comment.id",
        "comment.description",
        "user.firstName",
        "user.lastName",
        "user.id",
        "user.pictureUrl",
      ]);

    if (query.order) {
      qb = qb.orderBy("comment.id", query.order);
    }

    if (query.userId) {
      qb.andWhere("comment.userId = :userId", {
        userId: parseInt(query.userId),
      });
    }

    if (query.postId) {
      qb.andWhere("comment.postId = :postId", {
        postId: parseInt(query.postId),
      });
    }

    const comments = qb.getMany();

    return comments;
  };

  getCommentById = async (id: number) => {
    const userRepository = await AppDataSource.getRepository(Comment);

    const whereClause = {
      id: id,
    };

    const comment = await userRepository
      .createQueryBuilder("comment")
      .where(whereClause)
      .select(["comment.id", "comment.description"])
      .getOne();

    return comment;
  };

  createComment = async (
    transactionEntityManager: EntityManager,
    comment: CommentSchema,
    context: RequestContext
  ) => {
    const userRepository = await transactionEntityManager.getRepository(User);
    const postRepository = await transactionEntityManager.getRepository(Post);
    const userId = context.auth?.id;

    const findUser = await userRepository.findOneBy({
      id: userId,
    });

    const findPost = await postRepository.findOneBy({
      id: comment.postId,
    });

    if (!findUser) {
      throw new ResourceNotFoundError(`user doesn't exists`);
    }

    if (!findPost) {
      throw new ResourceNotFoundError(`post doesn't exists`);
    }

    const dbComment = new Comment();
    dbComment.userId = userId!;
    dbComment.postId = comment.postId;
    dbComment.description = comment.description;

    const createdComment = await transactionEntityManager.save(dbComment);

    return createdComment;
  };

  updateComment = async (
    transactionEntityManager: EntityManager,
    comment: UpdateCommentSchema,
    id: number,
    context: RequestContext
  ) => {
    const commentRepository =
      await transactionEntityManager.getRepository(Comment);

    const currentComment = await commentRepository.findOneBy({
      id: id,
    });

    const userId = context.auth?.id;

    if (currentComment) {
      if (currentComment.userId !== userId) {
        throw new ForbiddenError("this user can't update this comment");
      }
      try {
        await transactionEntityManager.update(Comment, { id: id }, comment);
        const updateComment = await commentRepository.findOneBy({
          id: id,
        });

        return updateComment;
      } catch (error) {
        throw new Error(error.message);
      }
    }

    throw new ResourceNotFoundError(`comment doesn't exists.`);
  };

  deleteComment = async (
    transactionEntityManager: EntityManager,
    id: number,
    context: RequestContext
  ) => {
    const commentRepository =
      await transactionEntityManager.getRepository(Comment);

    const currentComment = await commentRepository.findOneBy({
      id: id,
    });

    const userId = context.auth?.id;

    if (currentComment) {
      if (currentComment.userId !== userId) {
        throw new ForbiddenError("this user can't delete this comment");
      }
      await transactionEntityManager.softDelete(Comment, { id: id });
      return null;
    }

    throw new Error("comment doesn't exists.");
  };
}

export default CommentService;
