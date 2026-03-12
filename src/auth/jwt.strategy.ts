import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // Token'ı isteğin "Authorization: Bearer <token>" başlığından (Header) al
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Süresi dolmuş yaka kartlarını kabul etme
            // DÜZELTME BURADA: Sona eklenen "!" işareti TypeScript'e "Bu değer asla boş gelmeyecek, bana güven" der.
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    // Token geçerliyse, içindeki bilgileri (ID, email, rol) alıp request.user içine koyar
    async validate(payload: any) {
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}