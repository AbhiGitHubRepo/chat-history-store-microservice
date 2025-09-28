import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, validateSync } from 'class-validator';

class EnvVars {
  @IsInt() @Min(1) PORT!: number;
  @IsString() @IsOptional() ALLOWED_ORIGINS?: string;
  @IsString() @IsOptional() API_KEY?: string;
  @IsString() POSTGRES_USER!: string;
  @IsString() POSTGRES_PASSWORD!: string;
  @IsString() POSTGRES_DB!: string;
  @IsString() POSTGRES_HOST!: string;
  @IsInt() POSTGRES_PORT!: number;
  @IsString() DATABASE_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const v = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(v, { skipMissingProperties: false });
  if (errors.length) throw new Error('Config validation error: ' + JSON.stringify(errors));
  return v as unknown as Record<string, unknown>;
}
