import { BotStatus } from '@database/enums';
import type { schema } from '@database/schema';
import { Paginated } from '@gql/pagination';
import type { OmitType } from '@lib/types/utils';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import type { InferSelectModel } from 'drizzle-orm';

/**
 * Represents a bot object.
 */
@ObjectType({
	description: 'A bot object.'
})
export class BotObject
	implements OmitType<InferSelectModel<typeof schema.bots>, 'apikey'>
{
	/**
	 * The unique identifier of the bot.
	 */
	@Field(() => ID, {
		description: 'The unique identifier of the bot.'
	})
	public id!: string;

	/**
	 * The avatar image URL of the bot.
	 */
	@Field(() => String, {
		description: 'The avatar image URL of the bot.',
		nullable: true
	})
	public avatar!: string | null;

	/**
	 * The banner image URL of the bot.
	 */
	@Field(() => String, {
		description: 'The banner image URL of the bot.',
		nullable: true
	})
	public banner!: string | null;

	/**
	 * The username of the bot.
	 */
	@Field(() => String, {
		description: 'The username of the bot.'
	})
	public name!: string;

	/**
	 * Indicates whether the bot is certified.
	 */
	@Field(() => Boolean, {
		description: 'Indicates whether the bot is certified.',
		defaultValue: false
	})
	public certified!: boolean;

	/**
	 * The current status of the bot.
	 */
	@Field(() => BotStatus, {
		description: 'The current status of the bot.'
	})
	public status!: BotStatus;

	/**
	 * The detailed description of the bot.
	 */
	@Field(() => String, {
		description: 'The detailed description of the bot.'
	})
	public description!: string;

	/**
	 * The short description of the bot.
	 */
	@Field(() => String, {
		description: 'The short description of the bot.'
	})
	public shortDescription!: string;

	/**
	 * The command prefix used by the bot.
	 */
	@Field(() => String, {
		description: 'The command prefix used by the bot.',
		nullable: true
	})
	public prefix!: string | null;

	/**
	 * The creation date of the bot.
	 */
	@Field(() => String, {
		description: 'The creation date of the bot.'
	})
	public createdAt!: string;

	/**
	 * The last update date of the bot.
	 */
	@Field(() => String, {
		description: 'The last update date of the bot.'
	})
	public updatedAt!: string;

	/**
	 * The GitHub repository URL of the bot.
	 */
	@Field(() => String, {
		description: 'The GitHub repository URL of the bot.',
		nullable: true
	})
	public github!: string | null;

	/**
	 * The invite link for adding the bot to a server.
	 */
	@Field(() => String, {
		description: 'The invite link for adding the bot to a server.',
		nullable: true
	})
	public inviteLink!: string | null;

	/**
	 * The support server or community for the bot.
	 */
	@Field(() => String, {
		description: 'The support server or community for the bot.',
		nullable: true
	})
	public supportServer!: string | null;

	/**
	 * The official website of the bot.
	 */
	@Field(() => String, {
		description: 'The official website of the bot.',
		nullable: true
	})
	public website!: string | null;

	/**
	 * The number of guilds (servers) the bot is currently in.
	 */
	@Field(() => Int, {
		description: 'The number of guilds (servers) the bot is currently in.'
	})
	public guildCount!: number;

	/**
	 * The source from which the bot was imported.
	 */
	@Field(() => String, {
		description: 'The source from which the bot was imported.',
		nullable: true
	})
	public importedFrom!: string | null;
}
/**
 * A paginated list of bot objects.
 */
@ObjectType({
	description: 'A paginated list of bot objects.'
})
export class BotsConnection extends Paginated(BotObject) {}
