import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Bot {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ unique: true})
    username!: string;

    @Column({ unique: true })
    token!: string;

    @ManyToOne(() => User, user => user.bots)
    owner!: User;

    @Column({ nullable: true })
    webhook_url!: string;

    @OneToMany(() => Message, msg => msg.bot)
    messages!: Message[];
}
