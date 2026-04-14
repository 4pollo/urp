import { IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(['active', 'frozen'])
  status: 'active' | 'frozen';
}
