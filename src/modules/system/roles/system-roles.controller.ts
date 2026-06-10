import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSystemRoleDto } from './dto/create-system-role.dto';
import { UpdateSystemRoleDto } from './dto/update-system-role.dto';
import { SystemRolesService } from './system-roles.service';

@Controller('system/roles')
export class SystemRolesController {
  constructor(private readonly rolesService: SystemRolesService) {}

  @Post()
  create(@Body() dto: CreateSystemRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSystemRoleDto) {
    return this.rolesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(Number(id));
  }
}
