import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { BookmarkTag } from "./BookmarkTag";

@Entity()
@Unique(["name"])
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @OneToMany(() => BookmarkTag, (bookmarkTag) => bookmarkTag.tag, {
    cascade: true,
  })
  bookmarkTags!: BookmarkTag[];
}
