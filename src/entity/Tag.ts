import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

import { CustomBaseEntity } from "./CustomBaseEntity";
import { PostTagMap } from "./PostTagMap";
import { UserTagMap } from "./UserTagMap";
@Entity()
export class Tag extends CustomBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => PostTagMap, (pt) => pt.tag)
  postTags: PostTagMap[];

  @OneToMany(() => UserTagMap, (ut) => ut.tag)
  userTags: PostTagMap[];
}
