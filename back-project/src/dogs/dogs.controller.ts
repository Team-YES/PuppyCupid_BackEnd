import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import { AuthGuard } from '@nestjs/passport';
import { DogsService, CreateInfoInput } from './dogs.service';
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
    } = body;
    const dogImageUrl = file ? `/uploads/dogsImage/${file.filename}` : '';

    console.log('요청', body);

    const parsedLatitude = body.latitude ? parseFloat(body.latitude) : null;
    const parsedLongitude = body.longitude ? parseFloat(body.longitude) : null;

    return this.dogsService.createDogInfo({
      userId: req.user.id,
      name,
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
}
