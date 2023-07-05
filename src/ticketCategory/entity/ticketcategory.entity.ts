import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TicketEntity } from 'src/ticket/entity/ticket.entity';

@Entity('ticketCategory')
export class TicketCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    category: string;
    @Column()
    isRelativeToContract: boolean;
    @OneToMany(() => TicketEntity, (ticket) => ticket.id)
    ticket: TicketEntity[];
}