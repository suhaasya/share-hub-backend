import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CustomBaseEntity } from "./CustomBaseEntity";
import { User } from "./User";
import { Tag } from "./Tag";

@Entity()
export class UserTagMap extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  tagId: number;

  @ManyToOne(() => User, (user) => user.userTags)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Tag, (tag) => tag.userTags)
  @JoinColumn({ name: "tagId" })
  tag: Tag;
}
