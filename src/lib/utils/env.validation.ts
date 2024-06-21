import { plainToInstance } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsString,
	IsUrl,
	Length,
	Matches,
	Max,
	Min,
	validateSync
} from 'class-validator';
import { IsSnowflake } from './graphql/validators/isSnowflake';

export enum Environment {
	Development = 'development',
	Production = 'production',
	Test = 'test',
	Provision = 'provision'
}

/**
 * Represents the environment variables required for the application.
 */
export class EnvironmentVariables {
	/**
	 * The current environment of the application.
	 */
	@IsEnum(Environment)
	public NODE_ENV!: Environment;

	/**
	 * The port number for the API server.
	 */
	@IsNumber()
	@Min(0)
	@Max(65535)
	public API_PORT!: number;

	/**
	 * The URL for the database connection.
	 */
	@IsString()
	@Matches(
		/(postgresql|postgres):\/\/([^:@\s]*(?::[^@\s]*)?@)?(?<server>[^\/\?\s]+)\b/g,
		{
			message:
				'DATABASE_URL must be a valid PostgreSQL connection string.'
		}
	)
	public DATABASE_URL!: string;

	/**
	 * The secret key for the JWT (JSON Web Token) authentication.
	 */
	@IsString()
	@Length(32, 32)
	public JWT_SECRET_KEY!: string;

	/**
	 * The secret key for the JWT (JSON Web Token) refresh token.
	 */
	@IsString()
	@Length(32, 32)
	public JWT_REFRESH_SECRET_KEY!: string;

	/**
	 * The secret key for the JWT (JSON Web Token) apikey token.
	 */
	@IsString()
	@Length(32, 32)
	public JWT_APIKEY_SECRET_KEY!: string;

	/**
	 * The Discord client ID for the OAuth application.
	 */
	@IsSnowflake()
	public DISCORD_CLIENT_ID!: string;

	/**
	 * The Discord client secret for the OAuth application.
	 */
	@IsUrl({
		protocols: ['http', 'https'],
		require_tld: false,
		require_host: false
	})
	public DISCORD_REDIRECT_URI!: string;

	/**
	 * The Discord client secret for the OAuth application.
	 */
	@IsString()
	@Length(32, 32)
	public DISCORD_CLIENT_SECRET!: string;

	/**
	 * The Discord user token for elevated API requests
	 */
	@IsString()
	public DISCORD_USER_TOKEN!: string;

	/**
	 * Internal API key for elevated API requests
	 */
	@IsString()
	public INTERNAL_KEY!: string;

	/**
	 * Microservice for sending webhooks
	 */
	@IsUrl()
	public MS_WEBHOOK_URL!: string;

	/**
	 * Redis connection URL
	 */
	@IsString()
	@Matches(/redis:\/\/(?<password>[^@]+)@(?<host>[^:]+):(?<port>\d+)/, {
		message: 'REDIS_URL must be a valid Redis connection string.'
	})
	public REDIS_URL!: string;

	/**
	 * Discord webhook URL for logging
	 */
	@IsUrl({
		protocols: ['http', 'https'],
		require_tld: false,
		require_host: false
	})
	public DISCORD_WEBHOOK_URL!: string;

	/**
	 * Webhook microservice auth
	 */
	@IsString()
	public MS_WEBHOOK_AUTH!: string;
}

/**
 * Validates the provided configuration object against the defined environment variable types.
 *
 * @param config - The configuration object to validate.
 * @returns The validated configuration object.
 * @throws Error if there are validation errors.
 */
export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}
	return validatedConfig;
}
