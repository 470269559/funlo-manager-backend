import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSystemMenuDto } from './dto/create-system-menu.dto';
import { UpdateSystemMenuDto } from './dto/update-system-menu.dto';
import { SystemMenusService } from './system-menus.service';

@Controller('system/menus')
export class SystemMenusController {
  constructor(private readonly menusService: SystemMenusService) {}

  @Post()
  create(@Body() dto: CreateSystemMenuDto) {
    return this.menusService.create(dto);
  }

  @Get()
  findAll() {
    return this.menusService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSystemMenuDto) {
    return this.menusService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(Number(id));
  }
}
