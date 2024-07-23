import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { Comment } from "./Comment";
import { PostTagMap } from "./PostTagMap";
import { User } from "./User";
import { PostEmailMap } from "./PostEmailMap";
import { Favourite } from "./Favourite";

@Entity()
export class Post extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  thumbnailUrl: string;

  @Column({ nullable: true })
  articleLink: string;

  @Column({ nullable: true })
  videoLink: string;

  @Column({ nullable: true, type: "text" })
  description: string;

  @Column({
    type: "enum",
    enum: ["public", "private"],
    default: "public",
  })
  type: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostTagMap, (pt) => pt.post)
  postTags: PostTagMap[];

  @OneToMany(() => PostEmailMap, (pem) => pem.post)
  postEmails: PostEmailMap[];

  @OneToMany(() => Favourite, (fr) => fr.post)
  favourites: Favourite[];
}
