import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
    FilesInterceptor('images', 5, {
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
    @UploadedFiles() files: Express.Multer.File[],
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
    const dogImageUrl = files[0]
      ? `/uploads/dogsImage/${files[0].filename}`
      : '';

    return this.dogsService.createDogInfo({
      userId: req.user.id,
      name,
      age: Number(age),
      breed,
      mbti,
      personality,
      dog_image: dogImageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      dong_name,
    });
  }
}
