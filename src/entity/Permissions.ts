import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	ManyToMany,
} from "typeorm";
import { Role } from "./Role";

@Entity()
export class Permissions extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column()
	role_id!: string;

	@Column()
	resource!: string;

	@Column({ default: null })
	value!: string;

	@ManyToMany((_type) => Role, (role: Role) => role.permissions)
	@JoinColumn()
	roles!: Role;

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
