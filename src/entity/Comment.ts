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
export class Comment extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @Column()
  description: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: "postId" })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: "userId" })
  user: User;
}
