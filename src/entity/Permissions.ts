import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Role } from "./Role";

@Entity()
export class Permissions extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column({ unique: true })
	role_id!: string;

	@Column({ unique: true })
	resource!: string;

	@Column({ unique: true })
	value!: string;

	@ManyToOne((_type) => Role, (role: Role) => role.permissions)
	@JoinColumn()
	role!: Role;

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
