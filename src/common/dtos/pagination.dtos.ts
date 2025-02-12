import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {
    @ApiProperty({
        default:10,
        description:'how many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) // transforms strings to numbers
    limit?:number
    

    @ApiProperty({
        default:10,
        description:'how many rows do you want to skip'
    })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    offset?:number
}