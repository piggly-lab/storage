import { unlink } from 'fs/promises';

import {
	AsyncEventHandlerCallback,
	EventPayload,
	EventBus,
} from '@piggly/event-bus';

import UnlinkFileErrorEvent from '@/events/UnlinkFileErrorEvent.js';

export default class UnlinkLocalFileEvent extends EventPayload<{
	abspath: string;
}> {
	constructor(abspath: string) {
		super('UNLINK_FILE_EVENT', { abspath });
	}

	public static handler(): AsyncEventHandlerCallback<EventPayload> {
		return async event => {
			try {
				await unlink(event.data.abspath);
				return true;
			} catch (err: any) {
				UnlinkFileErrorEvent.publish(err);
				return false;
			}
		};
	}

	public static publish(abspath: string): void {
		EventBus.instance
			.publish(new UnlinkLocalFileEvent(abspath))
			.then(() => {})
			.catch(() => {});
	}
}
