import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Bookmark } from "./Bookmark";
import { Device } from "./Device";
import { File } from "./File";
import { Role } from "./Role";
import { Bot } from "./Bot";
export type UserStatus =
  | "Active"
  | "Inactive"
  | "Banned"
  | "Pending"
  | "Suspended";

// Active - Người dùng đang hoạt động.
// Inactive - Người dùng không hoạt động.
// Banned - Người dùng bị cấm.
// Pending - Tài khoản người dùng đang chờ phê duyệt.
// Suspended - Tài khoản bị tạm khóa.

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  image!: string;

  @Column()
  password!: string;

  @OneToMany(() => Device, (device) => device.user)
  devices!: Device[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks!: Bookmark[];

  @ManyToOne((_type) => Role, (role: Role) => role.users, { nullable: true })
  @JoinColumn()
  role!: Role | null;

  @OneToMany(() => File, (file) => file.user)
  files!: File[];

  @Column({ default: false })
  verified!: boolean;
  @Column({
    type: "enum",
    enum: ["Active", "Inactive", "Banned", "Pending", "Suspended"],
    default: "Pending",
  })
  status!: UserStatus;

  @OneToMany(() => Bot, bot => bot.owner)
  bots!: Bot[];

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
}
