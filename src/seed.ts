import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder/seeder.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);
  try {
    await seederService.seed();
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding failed!', error);
  } finally {
    await app.close();
  }
}
void bootstrap();
