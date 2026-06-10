import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateDictionaryItemDto } from './dto/create-dictionary-item.dto';
import { CreateDictionaryTypeDto } from './dto/create-dictionary-type.dto';
import { UpdateDictionaryItemDto } from './dto/update-dictionary-item.dto';
import { UpdateDictionaryTypeDto } from './dto/update-dictionary-type.dto';
import { SystemDictionariesService } from './system-dictionaries.service';

@Controller('system/dictionaries')
export class SystemDictionariesController {
  constructor(private readonly dictionariesService: SystemDictionariesService) { }

  @Post('types')
  createType(@Body() dto: CreateDictionaryTypeDto) {
    return this.dictionariesService.createType(dto);
  }

  @Get('types')
  findTypes() {
    return this.dictionariesService.findTypes();
  }

  @Get('types/:id')
  findType(@Param('id') id: string) {
    return this.dictionariesService.findType(Number(id));
  }

  @Patch('types/:id')
  updateType(@Param('id') id: string, @Body() dto: UpdateDictionaryTypeDto) {
    return this.dictionariesService.updateType(Number(id), dto);
  }

  @Delete('types/:id')
  removeType(@Param('id') id: string) {
    return this.dictionariesService.removeType(Number(id));
  }

  @Post('types/:typeId/items')
  createItem(
    @Param('typeId') typeId: string,
    @Body() dto: CreateDictionaryItemDto,
  ) {
    return this.dictionariesService.createItem(Number(typeId), dto);
  }

  @Get('types/:typeId/items')
  findItems(@Param('typeId') typeId: string) {
    return this.dictionariesService.findItems(Number(typeId));
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateDictionaryItemDto,
  ) {
    return this.dictionariesService.updateItem(Number(itemId), dto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.dictionariesService.removeItem(Number(itemId));
  }
}
