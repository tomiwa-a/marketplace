import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingModule } from './messaging/messaging.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MessagingModule, 
    ConfigModule.forRoot({
        isGlobal: true
      }),
      MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://root:root@localhost:27017/marketplace_messaging?authSource=admin'),
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}
