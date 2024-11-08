import { EventPayload, EventBus } from '@piggly/event-bus';

export default class ReadFileErrorEvent extends EventPayload<{
	error: Error;
}> {
	constructor(error: Error) {
		super('FILE_READ_ERROR_EVENT', { error });
	}

	public static publish(error: Error): void {
		EventBus.instance
			.publish(new ReadFileErrorEvent(error))
			.then(() => {})
			.catch(() => {});
	}
}
