import { Entity, PrimaryGeneratedColumn, Column, ManyToOne ,CreateDateColumn } from "typeorm";
import { Bot } from "./Bot";
@Entity()
export class CallbackQuery {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    update_id!: number;

    @ManyToOne(() => Bot)
    bot!: Bot;

    @Column()
    fromUserId!: number;

    @Column()
    data!: string;

    @Column()
    message_id!: number;

    @Column()
    chat_id!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
