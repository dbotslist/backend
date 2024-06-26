import { Throttlers } from '@constants/throttler';
import { User } from '@modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt.guard';
import type { JwtPayload } from '@modules/auth/interfaces/payload.interface';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { ValidationTypes } from 'class-validator';
import { BotOwnerPermissions } from '../decorators/permissions.decorator';
import { BotOwnershipGuard } from '../guards/ownership.guard';
import { BotOwnerPermissionsGuard } from '../guards/permissions.guard';
import { CreateWebhookInput } from '../inputs/webhook/create.input';
import { GetWebhookInput } from '../inputs/webhook/get.input';
import { UpdateWebhookInput } from '../inputs/webhook/update.input';
import { WebhookObject } from '../objects/webhook/webhook.object';
import { BotOwnerPermissionsFlag } from '../permissions/owner.permissions';
import { BotWebhookService } from '../services/webhook.service';

/**
 * Resolver for managing webhooks of the bot.
 */
@Resolver(() => WebhookObject)
@UseGuards(JwtAuthGuard, BotOwnershipGuard, BotOwnerPermissionsGuard)
@UsePipes(ValidationTypes, ValidationPipe)
@SkipThrottle({ [Throttlers.RESOURCE]: true })
export class BotWebhookResolver {
	/**
	 * Creates an instance of `BotWebhookResolver`.
	 * @param _webhookService - The webhook service.
	 */
	public constructor(private _webhookService: BotWebhookService) {}

	/**
	 * Retrieves a webhook based on the provided input.
	 * @param input - The input object containing the webhook ID.
	 * @param user - The user payload.
	 * @returns A Promise that resolves to the retrieved webhook.
	 */
	@Query(() => WebhookObject, {
		name: 'getWebhook',
		description: 'Get the webhook of the bot'
	})
	@BotOwnerPermissions([BotOwnerPermissionsFlag.ManageWebhook])
	public async get(@Args('input') input: GetWebhookInput) {
		return this._webhookService.getWebhook(input.id);
	}

	/**
	 * Creates a webhook.
	 *
	 * @param input - The input data for creating the webhook.
	 * @param user - The user payload.
	 * @returns A Promise that resolves to the created webhook.
	 */
	@Mutation(() => WebhookObject, {
		name: 'createWebhook',
		description: 'Create a webhook for the bot'
	})
	@BotOwnerPermissions([BotOwnerPermissionsFlag.ManageWebhook])
	public async create(
		@Args('input') input: CreateWebhookInput,
		@User() user: JwtPayload
	) {
		return this._webhookService.createWebhook(input, user);
	}

	/**
	 * Updates a webhook.
	 * @param input - The input data for updating the webhook.
	 * @param user - The user payload.
	 * @returns A Promise that resolves to the updated webhook.
	 */
	@Mutation(() => WebhookObject, {
		name: 'updateWebhook',
		description: 'Update the webhook of the bot'
	})
	@BotOwnerPermissions([BotOwnerPermissionsFlag.ManageWebhook])
	public async update(@Args('input') input: UpdateWebhookInput) {
		return this._webhookService.updateWebhook(input);
	}

	/**
	 * Deletes a webhook.
	 * @param input - The input object containing the webhook ID.
	 * @param user - The user payload.
	 * @returns A Promise that resolves to the result of the webhook deletion.
	 */
	@Mutation(() => WebhookObject, {
		name: 'deleteWebhook',
		description: 'Delete the webhook of the bot'
	})
	@BotOwnerPermissions([BotOwnerPermissionsFlag.ManageWebhook])
	public async delete(@Args('input') input: GetWebhookInput) {
		return this._webhookService.deleteWebhook(input.id);
	}
}
