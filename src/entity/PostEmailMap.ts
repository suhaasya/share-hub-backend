import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Post } from "./Post";

@Entity()
export class PostEmailMap extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.postEmails)
  @JoinColumn({ name: "postId" })
  post: Post;
}
