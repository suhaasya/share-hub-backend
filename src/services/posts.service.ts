import { Brackets, EntityManager } from "typeorm";

import { ForbiddenError, ResourceNotFoundError } from "../common/errors";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

import { Post } from "../entity/Post";
import {
  PostSchema,
  SearchPostSchema,
  UpdatePostSchema,
} from "../schemas/post";
import { Tag } from "../entity/Tag";
import { PostTagMap } from "../entity/PostTagMap";
import { RequestContext } from "../interfaces/types";
import { PostEmailMap } from "../entity/PostEmailMap";
import SesService from "./ses.service";
import { DOCUMENT_ACCESS } from "../templates/email.template";
import { frontendUrl } from "../common/constants";

class PostService {
  private sesService = new SesService();

  searchPosts = async (queryObj: SearchPostSchema, context: RequestContext) => {
    const query = queryObj.query;
    const userEmail = context.auth?.email;
    const postRepository = await AppDataSource.getRepository(Post);

    const posts = await postRepository
      .createQueryBuilder("post")
      .leftJoin("post.postTags", "postTag")
      .leftJoin("post.user", "user")
      .leftJoin("postTag.tag", "tag")
      .leftJoin("post.postEmails", "postEmail")
      .select([
        "post.id",
        "post.description",
        "post.title",
        "post.thumbnailUrl",
        "post.articleLink",
        "post.videoLink",
        "postTag.id",
        "tag.name",
        "user.firstName",
        "user.lastName",
        "user.pictureUrl",
        "user.id",
      ])
      .where("post.title LIKE :query", { query: `%${query}%` })
      .orWhere("post.description LIKE :query", {
        query: `%${query}%`,
      })
      .orWhere("tag.name LIKE :query", { query: `%${query}%` })
      .andWhere(
        new Brackets((qb) => {
          qb.where("post.type = :publicType", { publicType: "public" }).orWhere(
            new Brackets((qb) => {
              qb.where("post.type = :privateType", {
                privateType: "private",
              }).andWhere("postEmail.email = :email", {
                email: userEmail,
              });
            })
          );
        })
      )
      .getMany();

    return posts;
  };

  getAllPosts = async (query: SearchPostSchema, context: RequestContext) => {
    const userId = context.auth?.id;
    const postRepository = await AppDataSource.getRepository(Post);
    const userRepository = await AppDataSource.getRepository(User);

    const user = await userRepository
      .createQueryBuilder("user")
      .where({ id: userId })
      .leftJoin("user.userTags", "userTag")
      .leftJoin("userTag.tag", "tag")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.pictureUrl",
        "userTag.id",
        "tag.id",
        "tag.name",
      ])
      .getOne();

    let qb = postRepository
      .createQueryBuilder("post")
      .leftJoin("post.postTags", "postTag")
      .leftJoin("post.user", "user")
      .leftJoin("postTag.tag", "tag")
      .leftJoin("post.postEmails", "postEmail")
      .select([
        "post.id",
        "post.description",
        "post.title",
        "post.thumbnailUrl",
        "post.articleLink",
        "post.videoLink",
        "post.createdAt",
        "postTag.id",
        "tag.name",
        "user.firstName",
        "user.lastName",
        "user.pictureUrl",
        "user.id",
      ])
      .andWhere(
        new Brackets((qb) => {
          qb.where("post.type = :publicType", { publicType: "public" }).orWhere(
            new Brackets((qb) => {
              qb.where("post.type = :privateType", {
                privateType: "private",
              }).andWhere("postEmail.email = :email", {
                email: user?.email,
              });
            })
          );
        })
      );

    if (query.query) {
      const searchQuery = query.query;
      qb.where("post.title LIKE :query", { query: `%${searchQuery}%` })
        .orWhere("post.description LIKE :query", {
          query: `%${searchQuery}%`,
        })
        .orWhere("tag.name LIKE :query", { query: `%${searchQuery}%` });
    }

    if (query.order) {
      qb = qb.orderBy("post.id", query.order);
    }

    if (query.userId) {
      qb.andWhere("post.userId = :userId", {
        userId: parseInt(query.userId),
      });
    }

    if (query.tagId) {
      qb.andWhere("tag.id = :tagId", {
        tagId: parseInt(query.tagId),
      });
    }

    const posts = qb.getMany();

    return posts;
  };
  getRecommendedPosts = async (context: RequestContext) => {
    const userId = context.auth?.id;
    const postRepository = await AppDataSource.getRepository(Post);
    const userRepository = await AppDataSource.getRepository(User);

    const user = await userRepository
      .createQueryBuilder("user")
      .where({ id: userId })
      .leftJoin("user.userTags", "userTag")
      .leftJoin("userTag.tag", "tag")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.pictureUrl",
        "userTag.id",
        "tag.id",
        "tag.name",
      ])
      .getOne();

    const tagIds = user?.userTags.map((user) => user.tag.id);

    const qb = postRepository
      .createQueryBuilder("post")
      .leftJoin("post.postTags", "postTag")
      .leftJoin("post.user", "user")
      .leftJoin("post.postEmails", "postEmail")
      .leftJoin("postTag.tag", "tag")
      .select([
        "post.id",
        "post.description",
        "post.title",
        "post.thumbnailUrl",
        "post.articleLink",
        "post.videoLink",
        "post.createdAt",
        "postTag.id",
        "tag.name",
        "tag.id",
        "user.firstName",
        "user.lastName",
        "user.pictureUrl",
        "user.id",
      ])
      .andWhere("tag.id IN (:...tagIds)", { tagIds: tagIds })
      .andWhere(
        new Brackets((qb) => {
          qb.where("post.type = :publicType", { publicType: "public" }).orWhere(
            new Brackets((qb) => {
              qb.where("post.type = :privateType", {
                privateType: "private",
              }).andWhere("postEmail.email = :email", {
                email: user?.email,
              });
            })
          );
        })
      );

    const posts = qb.getMany();

    return posts;
  };

  getAllTags = async (query: SearchPostSchema) => {
    const tagRepository = await AppDataSource.getRepository(Tag);

    let qb = tagRepository
      .createQueryBuilder("tag")
      .select(["tag.id", "tag.name"]);

    if (query.order) {
      qb = qb.orderBy("post.id", query.order);
    }

    const posts = qb.getMany();

    return posts;
  };

  getPostById = async (id: number, context?: RequestContext) => {
    const userId = context?.auth?.id;
    const postRepository = await AppDataSource.getRepository(Post);
    const userRepository = await AppDataSource.getRepository(User);

    const whereClause = {
      id: id,
    };

    const user = await userRepository
      .createQueryBuilder("user")
      .where({ id: userId })
      .leftJoin("user.userTags", "userTag")
      .leftJoin("userTag.tag", "tag")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.pictureUrl",
        "userTag.id",
        "tag.id",
        "tag.name",
      ])
      .getOne();

    const post = await postRepository
      .createQueryBuilder("post")
      .where(whereClause)
      .leftJoin("post.postTags", "postTag")
      .leftJoin("post.user", "user")
      .leftJoin("postTag.tag", "tag")
      .leftJoin("post.postEmails", "postEmail")
      .select([
        "post.id",
        "post.description",
        "post.title",
        "post.thumbnailUrl",
        "post.articleLink",
        "postTag.id",
        "post.videoLink",
        "post.createdAt",
        "tag.name",
        "user.firstName",
        "user.lastName",
        "user.pictureUrl",
        "user.id",
      ])
      .andWhere(
        new Brackets((qb) => {
          qb.where("post.type = :publicType", { publicType: "public" }).orWhere(
            new Brackets((qb) => {
              qb.where("post.type = :privateType", {
                privateType: "private",
              }).andWhere("postEmail.email = :email", {
                email: user?.email,
              });
            })
          );
        })
      )
      .getOne();

    return post;
  };

  createPost = async (
    transactionEntityManager: EntityManager,
    post: PostSchema,
    context: RequestContext
  ) => {
    const userRepository = await transactionEntityManager.getRepository(User);
    const userId = context.auth?.id;
    const userEmail = context.auth?.email;

    const findUser = await userRepository.findOneBy({
      id: userId,
    });

    if (!findUser) {
      throw new ResourceNotFoundError(`user doesn't exists`);
    }

    const cpost = { ...post };
    delete cpost.newTags;
    delete cpost.tagIds;

    const dbPost = new Post();
    dbPost.userId = userId!;
    dbPost.description = cpost.description;
    dbPost.title = cpost.title;
    dbPost.thumbnailUrl = cpost.thumbnailUrl || "";
    dbPost.videoLink = cpost.videoLink || "";
    dbPost.articleLink = cpost.articleLink || "";
    if (cpost.type) {
      dbPost.type = cpost.type;
    }

    const createdPost = await transactionEntityManager.save(dbPost);

    if (post.newTags) {
      await Promise.all(
        post.newTags.map(async (name) => {
          const tag = await this.createTag(transactionEntityManager, name);
          await this.createPostTagMap(
            transactionEntityManager,
            tag.id,
            createdPost.id
          );
        })
      );
    }

    if (post.tagIds) {
      await Promise.all(
        post.tagIds.map(async (tid) => {
          await this.createPostTagMap(
            transactionEntityManager,
            tid,
            createdPost.id
          );
        })
      );
    }

    if (createdPost.type === "private") {
      const emails = post.emails || [];

      await Promise.all(
        [...emails, userEmail].map(async (email) => {
          await this.createPostEmailMap(
            transactionEntityManager,
            createdPost.id,
            email!,
            createdPost.title,
            userEmail?.trim() !== email?.trim()
          );
        })
      );
    }

    return createdPost;
  };

  updatePost = async (
    transactionEntityManager: EntityManager,
    post: UpdatePostSchema,
    id: number,
    context: RequestContext
  ) => {
    const postRepository = await transactionEntityManager.getRepository(Post);

    const currentPost = await postRepository.findOneBy({
      id: id,
    });

    const userId = context.auth?.id;
    const userEmail = context.auth?.email;

    if (currentPost) {
      if (currentPost.userId !== userId) {
        throw new ForbiddenError("this user can't update this post");
      }

      try {
        let updatedPost = {};
        if (post.title) {
          updatedPost = { ...updatedPost, title: post.title };
        }
        if (post.articleLink) {
          updatedPost = { ...updatedPost, articleLink: post.articleLink };
        }
        if (post.videoLink) {
          updatedPost = { ...updatedPost, videoLink: post.videoLink };
        }
        if (post.thumbnailUrl) {
          updatedPost = { ...updatedPost, thumbnailUrl: post.thumbnailUrl };
        }
        if (post.description) {
          updatedPost = { ...updatedPost, description: post.description };
        }

        await transactionEntityManager.update(Post, { id: id }, updatedPost);

        if (post.deletedTagIds) {
          await Promise.all(
            post.deletedTagIds.map(async (id) => {
              await this.deleteTag(transactionEntityManager, id);
            })
          );
        }

        if (post.newTags) {
          await Promise.all(
            post.newTags.map(async (name) => {
              const tag = await this.createTag(transactionEntityManager, name);
              await this.createPostTagMap(transactionEntityManager, tag.id, id);
            })
          );
        }

        if (post.tagIds) {
          await Promise.all(
            post.tagIds.map(async (tid) => {
              await this.createPostTagMap(transactionEntityManager, tid, id);
            })
          );
        }

        if (currentPost.type === "private" || post.type === "private") {
          const emails = post.emails || [];
          const removedEmails = post.removedEmails || [];

          await Promise.all(
            [...emails, userEmail].map(async (email) => {
              await this.createPostEmailMap(
                transactionEntityManager,
                currentPost.id,
                email!,
                currentPost.title,
                userEmail?.trim() !== email?.trim()
              );
            })
          );

          await Promise.all(
            [...removedEmails].map(async (email) => {
              await this.deleteEmailPostMap(
                transactionEntityManager,
                currentPost.id,
                email!
              );
            })
          );
        }

        const updatePost = await this.getPostById(id);

        return updatePost;
      } catch (error) {
        throw new Error(error.message);
      }
    }

    throw new ResourceNotFoundError(`post doesn't exists.`);
  };

  deletePost = async (
    transactionEntityManager: EntityManager,
    id: number,
    context: RequestContext
  ) => {
    const postRepository = await transactionEntityManager.getRepository(Post);

    const currentPost = await postRepository.findOneBy({
      id: id,
    });

    const userId = context.auth?.id;

    if (currentPost) {
      if (currentPost.userId !== userId) {
        throw new ForbiddenError("this user can't delete this post");
      }
      await transactionEntityManager.softDelete(Post, { id: id });
      return null;
    }

    throw new Error("post doesn't exists.");
  };

  deleteTag = async (transactionEntityManager: EntityManager, id: number) => {
    const tagRepository = await transactionEntityManager.getRepository(Tag);

    const currentTag = await tagRepository.findOneBy({
      id: id,
    });

    if (currentTag) {
      await transactionEntityManager.softDelete(Tag, { id: id });
      return null;
    }

    throw new Error("tag doesn't exists.");
  };

  deletePostTagMap = async (
    transactionEntityManager: EntityManager,
    id: number
  ) => {
    const tagMapRepository =
      await transactionEntityManager.getRepository(PostTagMap);

    const currentTag = await tagMapRepository.findOneBy({
      id: id,
    });

    if (currentTag) {
      await transactionEntityManager.softDelete(PostTagMap, { id: id });
      return null;
    }

    throw new Error("tag doesn't exists.");
  };

  deleteEmailPostMap = async (
    transactionEntityManager: EntityManager,
    postId: number,
    email: string
  ) => {
    const postEmailRepository =
      await transactionEntityManager.getRepository(PostEmailMap);

    const currentPostEmail = await postEmailRepository.findOneBy({
      postId,
      email,
    });

    if (currentPostEmail) {
      await transactionEntityManager.softDelete(PostEmailMap, { email: email });
    }

    return;
  };

  createTag = async (transactionEntityManager: EntityManager, name: string) => {
    const tagRepository = await transactionEntityManager.getRepository(Tag);
    const currentTag = await tagRepository.findOneBy({
      name: name,
    });

    if (currentTag) {
      return currentTag;
    }

    const dbTag = new Tag();
    dbTag.name = name;
    const createdTag = await transactionEntityManager.save(dbTag);

    return createdTag;
  };

  createPostEmailMap = async (
    transactionEntityManager: EntityManager,
    postId: number,
    email: string,
    title: string,
    sendEmail: boolean
  ) => {
    const postEmailRepository =
      await transactionEntityManager.getRepository(PostEmailMap);

    const currentPostEmail = await postEmailRepository.findOneBy({
      postId,
      email,
    });

    if (currentPostEmail) {
      return currentPostEmail;
    }

    const dbPostEmail = new PostEmailMap();
    dbPostEmail.postId = postId;
    dbPostEmail.email = email;

    const createdPostEmail = await transactionEntityManager.save(dbPostEmail);

    if (sendEmail) {
      const subject = "Docify | Document Access Granted";
      const body = DOCUMENT_ACCESS.replace("[DOC_NAME]", title).replace(
        "[DOC_URL]",
        `${frontendUrl}/postId=${postId}`
      );

      await this.sesService.sendEmail([email], subject, body);
    }

    return createdPostEmail;
  };

  createPostTagMap = async (
    transactionEntityManager: EntityManager,
    tagId: number,
    postId: number
  ) => {
    const postTagRepository =
      await transactionEntityManager.getRepository(PostTagMap);
    const tagRepository = await transactionEntityManager.getRepository(Tag);
    const postRepository = await transactionEntityManager.getRepository(Post);

    const currentTag = await tagRepository.findOneBy({
      id: tagId,
    });

    const currentPost = await postRepository.findOneBy({
      id: postId,
    });

    if (!currentTag) {
      throw new ResourceNotFoundError("tag doesn' exists");
    }

    if (!currentPost) {
      throw new ResourceNotFoundError("post doesn' exists");
    }

    const currentTagMap = await postTagRepository.findOneBy({
      tagId: tagId,
      postId: postId,
    });

    if (currentTagMap) {
      return;
    }

    const dbPostTag = new PostTagMap();
    dbPostTag.tagId = tagId;
    dbPostTag.postId = postId;
    const createdTagMap = await transactionEntityManager.save(dbPostTag);

    return createdTagMap;
  };
}

export default PostService;
