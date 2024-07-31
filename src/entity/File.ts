import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	UpdateDateColumn,
	CreateDateColumn,
	ManyToOne,
	BaseEntity,
} from "typeorm";
import { User } from "./User";

@Entity()
export class File extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	disk!: string;

	@Column()
	name!: string;

	@Column()
	path!: string;

	@Column()
	type!: string;

	@Column()
	size!: string;

	@Column()
	checksum!: string;

	@ManyToOne(() => User, (user) => user.files)
	user!: User;

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
