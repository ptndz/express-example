import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Permissions } from "./Permissions";
import { User } from "./User";
@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;

  @Column({ default: false })
  root!: boolean;

  @OneToMany((_type) => User, (user: User) => user.role)
  users!: Array<User>;

  @ManyToMany(
    (_type) => Permissions,
    (permissions: Permissions) => permissions.roles
  )
  permissions!: Array<Permissions>;

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
