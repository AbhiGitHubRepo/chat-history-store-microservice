import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddMessageDto {
  @IsString() @IsNotEmpty()
  sessionId!: string;

  @IsIn(['user','assistant','system'])
  role!: 'user'|'assistant'|'system';

  @IsString() @IsNotEmpty()
  content!: string;
}

export class ListMessagesQuery {
  @IsString() @IsNotEmpty()
  sessionId!: string;

  @IsInt() @Min(1) @IsOptional()
  page?: number;

  @IsInt() @Min(1) @IsOptional()
  pageSize?: number;
}
