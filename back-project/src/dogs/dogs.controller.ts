import { Body, Controller, Post } from '@nestjs/common';
import { CreateInfoInput, DogsService } from './dogs.service';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post('register')
  async createDog(@Body() body: CreateInfoInput) {
    return await this.dogsService.createDogInfo(body);
  }
}
