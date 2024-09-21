import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Bookmark } from "./Bookmark";
import { Tag } from "./Tag";

@Entity()
export class BookmarkTag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Bookmark, (bookmark) => bookmark.bookmarkTags, {
    onDelete: "CASCADE",
  })
  bookmark!: Bookmark;

  @ManyToOne(() => Tag, (tag) => tag.bookmarkTags, { onDelete: "CASCADE" })
  tag!: Tag;
  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createAt!: Date;
}
