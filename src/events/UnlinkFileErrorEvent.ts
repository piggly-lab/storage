import { EventPayload, EventBus } from '@piggly/event-bus';

export default class UnlinkFileErrorEvent extends EventPayload<{
	error: Error;
}> {
	constructor(error: Error) {
		super('FILE_UNLINK_ERROR_EVENT', { error });
	}

	public static publish(error: Error): void {
		EventBus.instance
			.publish(new UnlinkFileErrorEvent(error))
			.then(() => {})
			.catch(() => {});
	}
}
