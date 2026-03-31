import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Sisteme kayıtlı yönetici veya çalışan e-posta adresi',
    })
    email: string;

    @ApiProperty({
        description: 'Kullanıcı şifresi',
    })
    password: string;
}