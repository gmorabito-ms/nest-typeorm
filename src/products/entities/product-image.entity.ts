import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn()// autimatic increment
    id:number

    @Column('text')
    url:string

    // many imgs one product
    @ManyToOne(
        () => Product,
        (product) => product.images,
        {onDelete:'CASCADE'}
    )
    product:Product
}