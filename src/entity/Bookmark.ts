import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BookmarkTag } from "./BookmarkTag";
import { User } from "./User";

@Entity()
export class Bookmark extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: "CASCADE" })
  user!: User;

  @Column({ length: 255 })
  url!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  summarize!: string | null;

  @Column({ length: 255 })
  image!: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updateAt!: Date;

  @OneToMany(() => BookmarkTag, (bookmarkTag) => bookmarkTag.bookmark, {
    cascade: true,
  })
  bookmarkTags!: BookmarkTag[];
}
