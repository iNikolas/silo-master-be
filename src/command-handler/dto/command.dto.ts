import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateIf,
  Min,
  Max,
} from 'class-validator';

export class CommandDto {
  @IsString()
  @IsNotEmpty()
  command: string;

  @IsOptional()
  @IsNotEmpty({ message: 'State must be defined if provided' })
  state?: unknown;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.brightness !== undefined)
  @Min(0, { message: 'Brightness must be at least 0' })
  @Max(100, { message: 'Brightness must be at most 100' })
  brightness?: number;
}
