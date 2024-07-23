import { EntityManager } from "typeorm";
import {
  SearchUserSchema,
  UpdateUserSchema,
  UserSchema,
} from "../schemas/user";
import { ResourceNotFoundError, ValidationFailedError } from "../common/errors";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { defaultPageNumber, defaultPageSize } from "../common/constants";
import { UserTagMap } from "../entity/UserTagMap";
import { Tag } from "../entity/Tag";

class UserService {
  getAllUsers = async (query: SearchUserSchema) => {
    const userRepository = await AppDataSource.getRepository(User);
    const pageSize = query.size || defaultPageSize;
    const pageNumber = query.page || defaultPageNumber;

    let qb = userRepository
      .createQueryBuilder("user")
      .select(["user.id", "user.firstName", "user.lastName", "user.email"]);

    if (query.order) {
      qb = qb.orderBy("user.id", query.order);
    }

    if (query.page) {
      qb.skip((+query.page - 1) * +pageSize);
    } else {
      qb.skip(+pageNumber);
    }

    qb.take(+pageSize);

    const users = qb.getMany();

    return users;
  };

  getUserById = async (id: number) => {
    const userRepository = await AppDataSource.getRepository(User);

    const whereClause = {
      id: id,
    };

    const user = await userRepository
      .createQueryBuilder("user")
      .where(whereClause)
      .leftJoin("user.userTags", "userTag")
      .leftJoin("userTag.tag", "tag")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
        "user.pictureUrl",
        "userTag.id",
        "tag.name",
      ])
      .getOne();

    return user;
  };

  getUserProfile = async (id: number) => {
    const userRepository = await AppDataSource.getRepository(User);

    const whereClause = {
      id: id,
    };

    const user = await userRepository
      .createQueryBuilder("user")
      .where(whereClause)
      .select(["user.id", "user.name", "user.email"])
      .getOne();

    return user;
  };

  createUser = async (
    transactionEntityManager: EntityManager,
    user: UserSchema
  ) => {
    const userRepository = await transactionEntityManager.getRepository(User);

    const duplicateEmailUser = await userRepository.findOneBy({
      email: user.email,
    });

    if (duplicateEmailUser) {
      throw new ValidationFailedError(`user already exists`);
    }

    const dbUser = new User();
    dbUser.email = user.email;
    dbUser.firstName = user.firstName;
    dbUser.lastName = user.lastName;

    await transactionEntityManager.save(dbUser);

    return;
  };

  updateUser = async (
    transactionEntityManager: EntityManager,
    user: UpdateUserSchema,
    id: number
  ) => {
    const userRepository = await transactionEntityManager.getRepository(User);

    const currentUser = await userRepository.findOneBy({
      id: id,
    });

    if (currentUser) {
      try {
        let updatedUser = {};
        if (user.firstName) {
          updatedUser = { ...updatedUser, firstName: user.firstName };
        }
        if (user.lastName) {
          updatedUser = { ...updatedUser, lastName: user.lastName };
        }
        if (user.pictureUrl) {
          updatedUser = { ...updatedUser, pictureUrl: user.pictureUrl };
        }

        await transactionEntityManager.update(User, { id: id }, updatedUser);

        if (user.removedTagIds) {
          await Promise.all(
            user.removedTagIds.map(async (tid) => {
              await transactionEntityManager.softDelete(UserTagMap, {
                id: tid,
              });
            })
          );
        }

        if (user.tagIds) {
          await Promise.all(
            user.tagIds.map(async (tid) => {
              await this.createUserTagMap(transactionEntityManager, tid, id);
            })
          );
        }

        return;
      } catch (error) {
        throw new Error(error.message);
      }
    }

    throw new ResourceNotFoundError(`user doesn't exists.`);
  };

  deleteUser = async (transactionEntityManager: EntityManager, id: number) => {
    const userRepository = await transactionEntityManager.getRepository(User);

    const currentUser = await userRepository.findOneBy({
      id: id,
    });

    if (currentUser) {
      await transactionEntityManager.softDelete(User, { id: id });
      return;
    }

    throw new Error("user doesn't exists.");
  };

  createUserTagMap = async (
    transactionEntityManager: EntityManager,
    tagId: number,
    userId: number
  ) => {
    const userTagRepository =
      await transactionEntityManager.getRepository(UserTagMap);
    const tagRepository = await transactionEntityManager.getRepository(Tag);

    const currentTag = await tagRepository.findOneBy({
      id: tagId,
    });

    if (!currentTag) {
      throw new ResourceNotFoundError("tag doesn' exists");
    }

    const currentUserTagMap = await userTagRepository.findOneBy({
      tagId,
      userId,
    });

    if (currentUserTagMap) {
      return currentUserTagMap;
    }

    const dbUserTag = new UserTagMap();
    dbUserTag.tagId = tagId;
    dbUserTag.userId = userId;

    const createdUserTagMap = await transactionEntityManager.save(dbUserTag);

    return createdUserTagMap;
  };
}

export default UserService;
