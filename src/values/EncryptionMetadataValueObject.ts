import { IKeyManagerService } from '@piggly/secrets';

import AbstractMetadataValueObject from '@/values/AbstractMetadataValueObject.js';
import { EncryptionMetadataValueObjectProps } from '@/values/types/index.js';

export default class EncryptionMetadataValueObject extends AbstractMetadataValueObject<EncryptionMetadataValueObjectProps> {
	private constructor(props: EncryptionMetadataValueObjectProps) {
		super(props);
	}

	public static fromUint8Array(
		key: Uint8Array,
		version: number,
		name: string,
	) {
		if (key instanceof Uint8Array === false) {
			throw new Error('Invalid buffer data');
		}

		return new EncryptionMetadataValueObject({
			random_key: Buffer.from(key.buffer),
			key_name: name,
			version,
		});
	}

	public static fromBuffer(key: Buffer, version: number, name: string) {
		if (key instanceof Buffer === false) {
			throw new Error('Invalid buffer data');
		}

		return new EncryptionMetadataValueObject({
			random_key: key,
			key_name: name,
			version,
		});
	}

	public toObject(): Record<any, any> {
		return {
			random_key: this.randomKey,
			key_name: this.keyName,
			version: this.version,
		};
	}

	public isKeyCompatible(manager: IKeyManagerService<any>): boolean {
		return manager.name === this.keyName;
	}

	public toJSON(): Record<any, any> {
		return {
			key_name: this.keyName,
			version: this.version,
		};
	}

	public get randomKey(): Buffer {
		return this.props.random_key;
	}

	public get keyName(): string {
		return this.props.key_name;
	}

	public get version(): number {
		return this.props.version;
	}

	public get key(): string {
		return 'encryption';
	}

	public get visible(): boolean {
		return false;
	}
}
