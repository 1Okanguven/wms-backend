import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Sisteme kayıtlı yönetici veya çalışan e-posta adresi',
        default: 'okan@admin.com',
    })
    email: string;

    @ApiProperty({
        description: 'Kullanıcı şifresi',
        default: 'okansifre',
    })
    password: string;
}