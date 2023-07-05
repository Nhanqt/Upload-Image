import { ApiProperty } from "@nestjs/swagger";

export class FirstLoginDto{
    @ApiProperty()
    newPassword: string;
    @ApiProperty()
    isChange: boolean;
}