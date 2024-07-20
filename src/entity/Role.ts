import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { User } from "./User";
import { Permissions } from "./Permissions";
@Entity()
export class Role extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column({ unique: true })
	name!: string;

	@Column({ unique: true })
	description!: string;

	@Column()
	root!: boolean;

	@OneToMany((_type) => User, (user: User) => user.role)
	users!: Array<User>;

	@OneToMany((_type) => Permissions, (permissions: Permissions) => permissions.role)
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
