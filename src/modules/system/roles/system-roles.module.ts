import { Module } from '@nestjs/common';
import { SystemRolesController } from './system-roles.controller';
import { SystemRolesService } from './system-roles.service';

@Module({
  controllers: [SystemRolesController],
  providers: [SystemRolesService],
})
export class SystemRolesModule {}
