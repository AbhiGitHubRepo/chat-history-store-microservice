import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class StartSessionDto {
  @IsString() @IsNotEmpty()
  userId!: string;

  @IsString() @IsOptional()
  title?: string;
}

export class RenameSessionDto {
  @IsString() @IsNotEmpty()
  title!: string;
}

export class ToggleFavoriteDto {
  @IsBoolean()
  favorite!: boolean;
}

export class ListSessionsQuery {
  @IsString() @IsNotEmpty()
  userId!: string;

  @IsInt() @Min(1) @IsOptional()
  page?: number;

  @IsInt() @Min(1) @IsOptional()
  pageSize?: number;
}
