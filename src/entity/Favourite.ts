import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Favourite extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.favourites)
  @JoinColumn({ name: "postId" })
  post: Post;

  @ManyToOne(() => User, (user) => user.favourites)
  @JoinColumn({ name: "userId" })
  user: User;
}
