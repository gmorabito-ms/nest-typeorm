import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ok } from 'assert';
import { RawHeaders } from 'src/auth/decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtectd } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  
  ) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser('roles') user:User,
    @RawHeaders() rawHeaders:string[]
  ){
    return {
      ok: true,
      message: 'hola',
      user,
      rawHeaders
    }
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user']) not common
  @RoleProtectd(ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard) //auth, autorization
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user,
      
    }
  }

  @Get('private3')
  @Auth(ValidRoles.superUser)
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user,
      
    }
  }
}
