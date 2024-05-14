import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class CommandDto {
  @IsString()
  @IsNotEmpty()
  c: string;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.ex !== undefined)
  ex?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.ex !== undefined)
  s?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.ex !== undefined)
  t?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.ex !== undefined)
  ss202?: number;

  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.ex !== undefined)
  ss204?: number;
}
