import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SystemDictionariesModule } from './dictionaries/system-dictionaries.module';
import { SystemMenusModule } from './menus/system-menus.module';
import { SystemRolesModule } from './roles/system-roles.module';
import { SystemUsersModule } from './users/system-users.module';

@Module({
  imports: [
    PrismaModule,
    SystemUsersModule,
    SystemRolesModule,
    SystemMenusModule,
    SystemDictionariesModule,
  ],
})
export class SystemModule {}
