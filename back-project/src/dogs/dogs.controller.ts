import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Put,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import { AuthGuard } from '@nestjs/passport';
import { DogsService, CreateInfoInput, UpdateInfoInput } from './dogs.service';
import { Express } from 'express';

interface AuthRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/dogsImage',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async createDog(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: AuthRequest,
  ) {
    const {
      name,
      age,
      breed,
      mbti,
      personality,
      latitude,
      longitude,
      dong_name,
      gender,
    } = body;
    const dogImageUrl = file ? `/uploads/dogsImage/${file.filename}` : '';

    const parsedLatitude = body.latitude ? parseFloat(body.latitude) : null;
    const parsedLongitude = body.longitude ? parseFloat(body.longitude) : null;

    return this.dogsService.createDogInfo({
      userId: req.user.id,
      name,
      gender,
      age: Number(age),
      breed,
      mbti,
      personality,
      dog_image: dogImageUrl,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      dong_name,
    });
  }

  @Post('update/:dogId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/dogsImage',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async updateDog(
    @Param('dogId') dogId: number,
    @Body() body: Omit<UpdateInfoInput, 'userId' | 'dogId'>,
    @Req() req: AuthRequest,
  ) {
    const {
      name,
      age,
      breed,
      mbti,
      personality,
      latitude,
      longitude,
      dong_name,
      gender,
      dog_image,
    } = body;

    console.log(body);

    return this.dogsService.updateDogInfo({
      dogId,
      userId: req.user.id,
      name,
      age,
      breed,
      mbti,
      personality,
      dog_image,
      latitude,
      longitude,
      dong_name,
      gender,
    });
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getDogProfile(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const dog = await this.dogsService.findDogByUserID(userId);

    if (!dog) {
      return { ok: false, error: '강아지 프로필이 존재하지 않습니다' };
    }

    return {
      ok: true,
      dog: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        personality: dog.personality,
        mbti: dog.mbti,
        gender: dog.gender,
        image: dog.dog_image,
      },
    };
  }
}
