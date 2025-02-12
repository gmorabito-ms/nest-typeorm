import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '026a7919-b003-475d-aa9a-c90ce0d187c1',
    description:' Product ID',
    uniqueItems:true
  }) // documentation
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example:"Men's Raven Lightweight Hoodie",
    description:'Product Title',
    uniqueItems:true
  })
  @Column('text', {
    unique: true,
  })
  title: string;

  @ApiProperty({
    example:0,
    description:'Product price'
  })
  @Column('float', {
    default: 0, // default value
  })
  price: number;
  
  @ApiProperty({
    example:"Lorem ipsum",
    description:'Product description'
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example:"men'_rave_lightweigh_hoodie",
    description:'Product slug',
    uniqueItems:true
  })
  @Column({
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example:10,
    description:'Product stock',
    default:0
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example:['S', 'M', 'L', 'XL'],
    description:'Product sizes'
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example:'women',
    description:'Product gender'
  })
  @Column('text')
  gender: string;

  @Column({
    type: 'text',
    array: true,
    default: []
  })
  tags: string[]


  // one product many imgs
  @ApiProperty()
  @OneToMany( // relation
    () => ProductImage,
    (producImage) => producImage.product,
    {
      cascade: true, // any operation related will affect
      eager: true
    } // will also bring all related data
  )
  images?: ProductImage[]

  @ApiProperty()
  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true } //relation with userid
  )
  user: User

  @BeforeInsert()
  checkSlugInsert() {
    // automatic slug
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
