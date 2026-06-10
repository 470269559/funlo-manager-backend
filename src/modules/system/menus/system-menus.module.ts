import { Module } from '@nestjs/common';
import { SystemMenusController } from './system-menus.controller';
import { SystemMenusService } from './system-menus.service';

@Module({
  controllers: [SystemMenusController],
  providers: [SystemMenusService],
})
export class SystemMenusModule {}
