import { Entity, PrimaryGeneratedColumn, Column, ManyToOne ,CreateDateColumn } from "typeorm";
import { Bot } from "./Bot";

@Entity()
export class Message {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    update_id!: number;

    @Column()
    fromUserId!: number;

    @Column()
    toUserId!: number;

    @Column()
    text!: string;

    @Column({ type: 'enum', enum: ['user->bot', 'bot->user'] })
    direction!: 'user->bot' | 'bot->user';

    @ManyToOne(() => Bot, bot => bot.messages)
    bot!: Bot;

    @CreateDateColumn()
    createdAt!: Date;
}

