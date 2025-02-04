import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/auth/entities/user.entity";
import { JwtPayload } from "./interfaces/jwt-payload"
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly useRepository:Repository<User>,

        configService:ConfigService
    ){
        super({
        secretOrKey:configService.get('JWT_SECRET',"deault-secret" ),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
}

    async validate(payload:JwtPayload):Promise<User>{
        const {email} = payload

        const user = await this.useRepository.findOneBy({email})

        if (!user){
            throw new UnauthorizedException('token not valid')
        }

        if (!user.isActive){
            throw new UnauthorizedException('inactive user. talk with an admin')
        }
        return user
    }
}