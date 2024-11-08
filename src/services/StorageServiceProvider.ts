import { KeyPairManagerService, SecretManagerService } from '@piggly/secrets';

import { IStorageService, IFileEntity } from '@/services/types/index.js';

import LocalStorageService from './LocalStorageService.js';

export default class StorageServiceProvider {
	private readonly keypairs: KeyPairManagerService;

	private readonly secrets: SecretManagerService;

	private available_mimetypes: Array<string>;

	private default_provider: string;

	private bucket_name: string;

	private directory: string;

	public constructor(
		directory: string,
		bucket_name: string,
		available_mimetypes: Array<string>,
		secrets: SecretManagerService,
		keypairs: KeyPairManagerService,
		default_provider?: string,
	) {
		this.directory = directory;
		this.bucket_name = bucket_name;
		this.available_mimetypes = available_mimetypes;
		this.secrets = secrets;
		this.keypairs = keypairs;
		this.default_provider = default_provider || 'local';
	}

	public byProvider(provider?: string): IStorageService {
		switch (provider || this.default_provider) {
			case 'local':
				return new LocalStorageService(
					this.directory,
					this.bucket_name,
					this.available_mimetypes,
					this.secrets,
					this.keypairs,
				);
			default:
				throw new Error('Storage provider not implemented');
		}
	}

	public byFile(file: IFileEntity): IStorageService {
		return this.byProvider(file.provider);
	}
}
