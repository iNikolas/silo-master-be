import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CommandDto {
  @IsString()
  @IsNotEmpty()
  command: string;

  @IsOptional()
  @IsNotEmpty({ message: 'State must be defined if provided' })
  state?: unknown;
}
