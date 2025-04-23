import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GenderType, MbtiType } from '../dogs.entity';

export class CreateDogDto {
  @ApiProperty({ example: '뽀삐', description: '강아지 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3, description: '강아지 나이' })
  @IsNumber()
  age: number;

  @ApiProperty({ example: '푸들', description: '견종' })
  @IsString()
  breed: string;

  @ApiProperty({
    enum: GenderType,
    example: GenderType.MALE,
    description: '성별 (중성화 여부 포함)',
  })
  @IsEnum(GenderType)
  gender: GenderType;

  @ApiProperty({
    enum: MbtiType,
    example: MbtiType.ENFP,
    required: false,
    description: 'MBTI (선택사항)',
  })
  @IsOptional()
  @IsEnum(MbtiType)
  mbti?: MbtiType;

  @ApiProperty({
    example: '활발,사교적',
    description: '성격 (콤마로 구분된 문자열)',
  })
  @IsString()
  personality: string;

  @ApiProperty({
    example: '/uploads/dogsImage/uuid.jpg',
    description: '이미지 URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  dog_image?: string;

  @ApiProperty({ example: 37.5665, description: '위도', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 126.978, description: '경도', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateDogDto extends PartialType(CreateDogDto) {}

export class UpdateDogLocationDto {
  @ApiProperty({ example: 37.5665, description: '위도' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 126.978, description: '경도' })
  @IsNumber()
  longitude: number;
}
