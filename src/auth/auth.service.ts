import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from 'src/strategies/interfaces/jwt-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly jwtService:JwtService
  ){}

  async createUser(createUserDto:CreateUserDto) {
    try {
      const { password, ...userData} = createUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })
      await this.userRepository.save(user)
      
      return {
        ...user,
        token: this.getJwtToken({email:user.email})
      }
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  
  async login(loginUserDto:LoginUserDto){
    const {password, email} = loginUserDto
    const user = await this.userRepository.findOne({
      where:{email},
      select: {email:true, password:true}
    })
  
    if(!user) {
      throw new UnauthorizedException('Not valid credentials (email)')
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials (password)')
    }
    return {
      ...user,
      token: this.getJwtToken({email:user.email})
    }
  }

  private getJwtToken(payload:JwtPayload){
    const token = this.jwtService.sign(payload)
    return token
  }

  private handleDBErrors(error:any):never{
    if(error.code =='23505') {
      throw new BadRequestException(error.detail)
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs')
    
  }
}
