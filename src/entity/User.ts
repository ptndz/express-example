import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	ManyToOne,
} from "typeorm";
import { Role } from "./Role";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ unique: true })
	username!: string;

	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

	@Column()
	firstName!: string;

	@Column()
	lastName!: string;

	@ManyToOne((_type) => Role, (role: Role) => role.users, { nullable: true })
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
