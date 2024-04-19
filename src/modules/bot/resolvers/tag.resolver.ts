import { PaginationInput } from '@gql/pagination';
import { JwtAuthGuard } from '@modules/auth/guards/jwt.guard';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateBotTagInput } from '../inputs/tag/create.input';
import { FiltersBotTagInput } from '../inputs/tag/filters.input';
import { GetBotTagInput } from '../inputs/tag/get.input';
import { BotTagObject, BotTagsConnection } from '../objects/tag/tag.object';
import { BotTagService } from '../services/tag.service';

/**
 * Resolver class for handling tag-related operations.
 */
@Resolver(() => BotTagObject)
@UsePipes(ValidationPipe)
export class BotTagResolver {
	/**
	 * Constructs a new instance of the TagResolver class.
	 * @param _tagService The BotTagService instance to be injected.
	 */
	public constructor(private _tagService: BotTagService) {}

	/**
	 * Retrieves a paginated list of tags based on the provided filters.
	 *
	 * @param pagination - The pagination options for the query.
	 * @param input - The filters to apply to the tags.
	 * @returns A paginated list of tags.
	 */
	@Query(() => BotTagsConnection, {
		description: 'Fetches a list of tags.'
	})
	public async tags(
		@Args('pagination', { nullable: true }) pagination: PaginationInput,
		@Args('input', { nullable: true }) input: FiltersBotTagInput
	) {
		return this._tagService.paginateTags(input, pagination);
	}

	/**
	 * Resolver for fetching a tag by name.
	 * @param input - The input object containing the tag name.
	 * @returns A promise that resolves to the fetched tag.
	 */
	@Query(() => BotTagObject, {
		name: 'getTag',
		description: 'Fetches a tag by name.'
	})
	public async get(@Args('input') input: GetBotTagInput) {
		console.log('input', input);
		return this._tagService.getTag(input.name);
	}

	/**
	 * Creates a new bot tag.
	 * @param input - The input data for creating the bot tag.
	 * @returns A Promise that resolves to the created bot tag.
	 */
	@Mutation(() => BotTagObject, {
		name: 'createTag',
		description: 'Creates a new tag.'
	})
	@UseGuards(JwtAuthGuard)
	public async create(@Args('input') input: CreateBotTagInput) {
		return this._tagService.createTag(input.name);
	}
}
