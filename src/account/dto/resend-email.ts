import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendEmailDto {
    @ApiProperty()
    accountid: number;
    @ApiProperty()
    @IsEmail()
    email:string;
}