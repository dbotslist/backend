import '@gql/registers/enum.register';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ErrorHttpStatusCode, getErrorStatus } from '@constants/errors';
import { Throttlers } from '@constants/throttler';
import { DATABASE } from '@constants/tokens';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule, minutes } from '@nestjs/throttler';
import { GqlThrottlerGuard } from '@utils/guards/throttler.guard';
import { validate } from '@utils/index';
import type { Request, Response } from 'express';
import { schema } from './database/schema';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotModule } from './modules/bot/bot.module';
import { VanityModule } from './modules/vanity/vanity.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			validate
		}),

		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				errorMessage:
					'You are being rate limited. Please try again later.',
				throttlers: [
					{
						name: Throttlers.DEFAULT,
						ttl: configService.get<number>(
							'THROTTLER_TTL',
							minutes(30)
						),
						limit: configService.get<number>('THROTTLER_LIMIT', 100)
					},
					{
						name: Throttlers.RESOURCE,
						ttl: configService.get<number>(
							'THROTTLER_RESOURCE_TTL',
							minutes(30)
						),
						limit: configService.get<number>(
							'THROTTLER_RESOURCE_LIMIT',
							60
						)
					}
				]
			})
		}),

		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			playground: false,
			autoSchemaFile: true,
			introspection: true,
			fieldResolverEnhancers: ['guards'],
			cache: 'bounded',
			context: ({ req, res }: { req: Request; res: Response }) => ({
				req,
				res
			}),
			formatError: (error) => {
				let errorMessage =
					'An unknown error occurred. Please try again.';
				const originalError = (error.extensions?.originalError ||
					error.message) as { message: string } | string | string[];
				const isProd = process.env.NODE_ENV === 'production';

				const commonErrors: Record<string, string> = {
					BAD_USER_INPUT: 'Invalid input provided. Please try again.',
					INTERNAL_SERVER_ERROR:
						'An internal server error occurred. Please try again later.',
					UNAUTHENTICATED:
						'You are not authenticated to perform this action.'
				};

				const {
					stacktrace,
					status,
					code: _code = commonErrors.INTERNAL_SERVER_ERROR
				}: {
					stacktrace?: string;
					status?: keyof typeof ErrorHttpStatusCode;
					code?: string | number;
				} = error.extensions || {};
				const commonError = commonErrors[_code];

				if (commonError) {
					errorMessage = commonError;
				}

				if (typeof originalError === 'string') {
					errorMessage = originalError;
				} else if (typeof originalError === 'object') {
					errorMessage = Object.values(originalError)[0];
				}

				const [code, face] = getErrorStatus(status || _code);

				return {
					message: errorMessage,
					extensions: {
						code,
						face,
						originalError,
						stacktrace: !isProd ? stacktrace : undefined,
						status,
						path: error.path
					}
				};
			},
			plugins: [ApolloServerPluginLandingPageLocalDefault()]
		}),

		DrizzlePostgresModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			tag: DATABASE,
			useFactory: async (configService: ConfigService) => ({
				postgres: {
					url: configService.getOrThrow('DATABASE_URL')
				},
				config: { schema }
			})
		}),

		RedisModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (_configService: ConfigService) => ({
				type: 'single',
				url: _configService.getOrThrow('REDIS_URL')
			})
		}),

		BotModule,
		AuthModule,
		VanityModule,
		AdminModule
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: GqlThrottlerGuard
		}
	]
})
export class AppModule {}
