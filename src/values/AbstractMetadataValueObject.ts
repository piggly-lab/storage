import { ValueObject } from '@piggly/ddd-toolkit';

export default abstract class AbstractMetadataValueObject<
	Props,
> extends ValueObject<Props> {
	abstract toObject(): Record<any, any>;
	abstract toJSON(): Record<any, any>;
	abstract get visible(): boolean;
	abstract get key(): string;
}
