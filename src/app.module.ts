import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { SystemModule } from './modules/system/system.module';

@Module({
  imports: [AuthModule, SystemModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
