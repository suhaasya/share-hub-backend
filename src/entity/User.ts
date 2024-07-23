import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from "typeorm";

import { encryptString } from "../common/utils";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Comment } from "./Comment";
import { Post } from "./Post";
import { UserTagMap } from "./UserTagMap";
import { Favourite } from "./Favourite";
@Entity()
export class User extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ nullable: true })
  pictureUrl: string;

  @Column({
    length: 500,
    select: false,
  })
  password?: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserTagMap, (ut) => ut.user)
  userTags: UserTagMap[];

  @OneToMany(() => Favourite, (fr) => fr.user)
  favourites: Favourite[];

  @BeforeInsert()
  @BeforeUpdate()
  async encryptPassword() {
    if (this.password) {
      this.password = await encryptString(this.password);
    }
  }
}
