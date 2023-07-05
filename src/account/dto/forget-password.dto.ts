import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, isEmail } from "class-validator";

export class ForgetPassWordDto{
    password: string;
    @ApiProperty()
    @IsEmail()
    email: string;
}