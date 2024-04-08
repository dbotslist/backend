import { ErrorMessages } from '@constants/errors';
import { DATABASE } from '@constants/tokens';
import { botToTag, tags } from '@database/tables';
import type { DrizzleService } from '@lib/types';
import {
	Inject,
	Injectable,
	NotFoundException,
	type OnModuleInit
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { ConnectBotTagsToBotInput } from '../inputs/tag/connect.input';
import type { CreateBotTagInput } from '../inputs/tag/create.input';
import type { BotTagObject } from '../objects/tag/tag.object';
import { BotService } from './bot.service';

/**
 * Service class for handling bot tag-related operations.
 */
@Injectable()
export class BotTagService implements OnModuleInit {
	/**
	 * The injected BotService instance.
	 */
	private _botService!: BotService;

	/**
	 * Constructs a new instance of the BotTagService class.
	 * @param _drizzleService The injected DrizzleService instance.
	 * @param _moduleRef The injected ModuleRef instance.
	 */
	public constructor(
		@Inject(DATABASE) private _drizzleService: DrizzleService,
		private _moduleRef: ModuleRef
	) {}

	/**
	 * Lifecycle hook that runs after the module has been initialized.
	 */
	public onModuleInit() {
		this._botService = this._moduleRef.get(BotService, { strict: false });
	}

	/**
	 * Creates a new tag.
	 * @param input - The input data for creating the tag.
	 * @returns A promise that resolves to the created tag object.
	 * @throws NotFoundException if the tag already exists.
	 */
	public async createTag(input: CreateBotTagInput): Promise<BotTagObject> {
		// Format the tag name.
		const name = this.formatTagName(input.name);
		// Create the tag if it does exist throws an error.
		const [tag] = await this._drizzleService
			.insert(tags)
			.values({
				name,
				displayName: input.name
			})
			.returning()
			.catch(() => {
				// If the tag already exists, throw an error.
				throw new NotFoundException(ErrorMessages.TAG_ALREADY_EXISTS);
			});

		return tag;
	}

	/**
	 * Assigns a tag to a bot.
	 *
	 * @param input - The input object containing the tag name and bot ID.
	 * @returns The assigned tag.
	 */
	public async assignTagsToBot(input: ConnectBotTagsToBotInput) {
		// Check if the tag exists and the bot exists.
		const tags = await this.ensureTagsExists(input.tagNames);
		await this._botService.getBot(input.botId);

		// Assign the tags to the bot.
		for (const tag of tags) {
			await this._drizzleService.insert(botToTag).values({
				a: input.botId,
				b: tag.name
			});
		}

		return tags;
	}

	/**
	 * Retrieves the tags associated with a bot.
	 * @param id The ID of the bot.
	 * @returns A promise that resolves to an array of BotTagObject.
	 * @throws NotFoundException if no tags are found for the bot.
	 */
	public async getBotTags(id: string): Promise<BotTagObject[]> {
		const response = await this._drizzleService.query.botToTag
			.findMany({
				where: (table, { eq }) => eq(table.a, id),
				with: { tag: true }
			})
			.execute();

		if (!response.length) {
			throw new NotFoundException(ErrorMessages.TAGS_NOT_FOUND);
		}

		return response.map((table) => table.tag);
	}

	/**
	 * Retrieves tags based on the provided names.
	 * @param names - An array of tag names.
	 * @returns A promise that resolves to an array of BotTagObject.
	 * @throws NotFoundException if no tags are found.
	 */
	public async getTags(names: string[]): Promise<BotTagObject[]> {
		names = names.map((name) => this.formatTagName(name));
		const tags = await this._drizzleService.query.tags.findMany({
			where: (table, { inArray }) => inArray(table.name, names)
		});

		if (!tags.length) {
			throw new NotFoundException(ErrorMessages.TAGS_NOT_FOUND);
		}

		return tags;
	}

	/**
	 * Retrieves a tag by its name.
	 * @param name - The name of the tag.
	 * @returns A promise that resolves to the found tag.
	 * @throws NotFoundException if the tag does not exist.
	 */
	public async getTag(name: string): Promise<BotTagObject> {
		// Format the tag name.
		const tag = await this._drizzleService.query.tags.findFirst({
			where: (table, { eq }) => eq(table.name, name)
		});

		// If the tag does not exist, throw an error.
		if (!tag) {
			throw new NotFoundException(ErrorMessages.TAG_NOT_FOUND);
		}

		return tag;
	}

	/**
	 * Ensures that the specified tags exist in the system.
	 * If a tag does not exist, it will be created.
	 *
	 * @param names - An array of tag names to ensure existence for.
	 * @returns A promise that resolves to an array of `BotTagObject` representing the existing or newly created tags.
	 */
	public async ensureTagsExists(names: string[]): Promise<BotTagObject[]> {
		return this.getTags(names).catch(async () => {
			const tags = [];
			for (const tag of names) {
				const actualTag = await this.createTag({ name: tag }).catch(
					() => null
				);

				if (actualTag) tags.push(actualTag);
			}

			return tags;
		});
	}

	/**
	 * The format is as follows:
	 * - All characters are converted to lowercase.
	 * - All spaces are replaced with hyphen.
	 * - All characters that are not alphanumeric or hyphen are removed.
	 * - The tag name is truncated to 20 characters.
	 * @param name - The name of the tag to format.
	 * @returns
	 */
	private formatTagName(name: string): string {
		return name
			.toLowerCase()
			.replace(/ /g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.slice(0, 20);
	}
}
