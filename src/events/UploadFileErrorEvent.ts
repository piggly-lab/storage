import { EventPayload, EventBus } from '@piggly/event-bus';

export default class UploadFileErrorEvent extends EventPayload<{
	error: Error;
}> {
	constructor(error: Error) {
		super('FILE_UPLOAD_ERROR_EVENT', { error });
	}

	public static publish(error: Error): void {
		EventBus.instance
			.publish(new UploadFileErrorEvent(error))
			.then(() => {})
			.catch(() => {});
	}
}
