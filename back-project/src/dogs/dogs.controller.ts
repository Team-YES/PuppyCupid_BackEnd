import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import { AuthGuard } from '@nestjs/passport';
import { DogsService } from './dogs.service';
import { Express } from 'express';

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';

import {
  CreateDogDto,
  UpdateDogDto,
  UpdateDogLocationDto,
} from './dto/dogs.dto';

interface AuthRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}
@ApiTags('강아지')
@Controller('dogs')
@UseGuards(AuthGuard('jwt'))
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Post('register')
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
  @ApiOperation({
    summary: '강아지 등록',
    description: '강아지 프로필을 등록합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDogDto })
  async createDog(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDogDto,
    @Req() req: AuthRequest,
  ) {
    const { name, age, breed, mbti, personality, gender } = body;

    const parsedPersonality = Array.isArray(personality)
      ? personality.join(',')
      : personality;

    const dogImageUrl = file ? `/uploads/dogsImage/${file.filename}` : '';

    const parsedLatitude = body.latitude
      ? parseFloat(String(body.latitude))
      : null;
    const parsedLongitude = body.longitude
      ? parseFloat(String(body.longitude))
      : null;

    return this.dogsService.createDogInfo({
      userId: req.user.id,
      name,
      gender,
      age: Number(age),
      breed,
      mbti,
      personality: parsedPersonality,
      dog_image: dogImageUrl,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    });
  }

  @Post('update/:dogId')
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
  @ApiOperation({
    summary: '강아지 수정',
    description: '기존 강아지 프로필을 수정합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'dogId', type: Number, description: '강아지 ID' })
  @ApiBody({ type: UpdateDogDto })
  async updateDog(
    @Param('dogId') dogId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateDogDto,
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
      gender,
      dog_image,
    } = body;

    const parsedPersonality = Array.isArray(personality)
      ? personality.join(',')
      : personality;

    const existingDog = await this.dogsService.findDogByUserID(req.user.id);

    if (!existingDog) {
      return { ok: false, error: '강아지 정보를 찾을 수 없습니다.' };
    }

    const dogImageUrl = file
      ? `/uploads/dogsImage/${file.filename}`
      : dog_image && dog_image !== 'null' && dog_image !== ''
        ? dog_image
        : existingDog?.dog_image || '';

    return this.dogsService.updateDogInfo({
      dogId,
      userId: req.user.id,
      name: name ?? existingDog.name,
      age: age ?? existingDog.age,
      breed: breed ?? existingDog.breed,
      mbti: mbti ?? existingDog.mbti,
      personality: parsedPersonality ?? existingDog.personality,
      dog_image: dogImageUrl,
      latitude: latitude ?? existingDog.latitude,
      longitude: longitude ?? existingDog.longitude,
      gender: gender ?? existingDog.gender,
    });
  }

  @Post(':dogId/location')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강아지 위치 저장 및 주변 강아지 조회',
    description:
      '강아지 위치를 저장하고, 반경 3km 이내의 다른 강아지 정보를 반환합니다.',
  })
  @ApiParam({ name: 'dogId', type: Number, description: '강아지 ID' })
  @ApiBody({ type: UpdateDogLocationDto })
  async setDogLocation(
    @Param('dogId') dogId: number,
    @Body() body: UpdateDogLocationDto,
    @Req() req: AuthRequest,
  ) {
    const { latitude, longitude } = body;
    const userId = req.user.id;
    await this.dogsService.updateLocation(userId, dogId, latitude, longitude);
    const nearbyDogs = await this.dogsService.findNearbyDogs(dogId);

    const dogsInfo = nearbyDogs.map((dog) => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      personality: dog.personality,
      mbti: dog.mbti,
      gender: dog.gender,
      image: dog.dog_image,
      latitude: dog.latitude,
      longitude: dog.longitude,
      userId: dog.user?.id ?? null,
    }));

    return {
      ok: true,
      dogs: dogsInfo,
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '강아지 프로필 조회',
    description: '내 강아지 프로필을 조회합니다.',
  })
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
        userId: dog.user.id,
      },
    };
  }
}
