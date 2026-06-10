import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemUsersService } from './system-users.service';

@Controller('system/users')
export class SystemUsersController {
  constructor(private readonly usersService: SystemUsersService) {}

  @Post()
  create(@Body() dto: CreateSystemUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSystemUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
