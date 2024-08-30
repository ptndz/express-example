import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { Role } from "./Role";
import { File } from "./File";
import {Device} from "./Device";
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

	@ManyToOne((_type) => Role, (role: Role) => role.users, { nullable: true })
	@JoinColumn()
	role!: Role | null;

	@OneToMany(() => File, (file) => file.user)
	files!: File[];

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
