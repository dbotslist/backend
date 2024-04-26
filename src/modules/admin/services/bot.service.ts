import { DATABASE } from '@constants/tokens';
import type { DrizzleService } from '@lib/types';
import { BotService } from '@modules/bot/services/bot.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AdminBotService {
	public constructor(
		@Inject(DATABASE) private _drizzleService: DrizzleService,
		private _botService: BotService
	) {}

	
}