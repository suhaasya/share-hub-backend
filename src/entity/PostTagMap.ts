import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Post } from "./Post";
import { Tag } from "./Tag";

@Entity()
export class PostTagMap extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @Column()
  tagId: number;

  @ManyToOne(() => Post, (post) => post.postTags)
  @JoinColumn({ name: "postId" })
  post: Post;

  @ManyToOne(() => Tag, (tag) => tag.postTags)
  @JoinColumn({ name: "tagId" })
  tag: Tag;
}
