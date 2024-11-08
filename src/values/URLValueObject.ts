import {
	BusinessRuleViolationError,
	ValueObject,
	Result,
} from '@piggly/ddd-toolkit';

export type URLValueObjectProps = {
	base: URL;
};

export default class URLValueObject extends ValueObject<URLValueObjectProps> {
	public static create(
		url: string,
	): Result<URLValueObject, BusinessRuleViolationError> {
		try {
			return Result.ok(new URLValueObject({ base: new URL(url) }));
		} catch {
			return Result.fail(
				new BusinessRuleViolationError(
					'InvalidURL',
					'URL is not valid, please fix it before continue.',
				),
			);
		}
	}

	public static createFromString(url: string) {
		return new URLValueObject({ base: new URL(url) });
	}

	public static createRaw(url: URL) {
		return new URLValueObject({ base: url });
	}

	public concat(path: Array<string> | string, query?: string): URLValueObject {
		const url = new URL(this.props.base.toString());

		if (Array.isArray(path)) {
			url.pathname += path.map(p => p.replace(/^\//, '')).join('/');
		} else {
			url.pathname += path.replace(/^\//, '');
		}

		if (query) url.search = query;
		return URLValueObject.createRaw(url);
	}

	public get string(): string {
		return this.props.base.toString();
	}

	public get url(): URL {
		return this.props.base;
	}
}
