import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class AnalyseMedicinesDto {
  @ApiProperty({
    example: ['<base64 of the image>', '<base64 of the image>'],
    description: 'List of image URLs',
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    example: ['tablet', 'pill'],
    description: 'List of categories',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
