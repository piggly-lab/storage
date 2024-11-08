import { Hmac } from 'crypto';
import fs from 'fs';

import { IKeyManagerService, ed25519, aes256 } from '@piggly/secrets';
import EventBus, { LocalEventDriver } from '@piggly/event-bus';
import { toMoment, Result } from '@piggly/ddd-toolkit';
import { jest } from '@jest/globals';

import type { IFileEntity } from '@/services/types/index.js';

import CannotEvaluateSignatureError from '@/errors/runtime/CannotEvaluateSignatureError.js';
import AbstractMetadataValueObject from '@/values/AbstractMetadataValueObject';
import IncompatibleFileError from '@/errors/runtime/IncompatibleFileError.js';
import URLInvalidSignatureError from '@/errors/URLInvalidSignatureError.js';
import LocalStorageService from '@/services/LocalStorageService.js';
import FileNotFoundError from '@/errors/FileNotFoundError.js';
import URLExpiredError from '@/errors/URLExpiredError.js';
import URLValueObject from '@/values/URLValueObject.js';
import * as fileUtils from '@/utils/file.js';

jest.mock('fs');

class SimpleFileEntity implements IFileEntity {
	createdAt: moment.Moment = toMoment('2023-01-01T00:00:00Z');
	updatedAt: moment.Moment = toMoment('2023-01-01T00:00:00Z');
	metadata: Array<AbstractMetadataValueObject<any>> = [];
	absolutePath: string | null = '/path/to/file.zip';
	mimetype: string = 'application/zip';
	originalFilename: string = 'uuid';
	caption: string | null = null;
	compressed: boolean = false;
	bucketName: string = 'main';
	encrypted: boolean = false;
	provider: string = 'local';
	schemaVersion: number = 1;
	extension: string = 'zip';
	filename: string = 'uuid';
	readable: boolean = true;
	region: string = 'local';
	fileid: string = '12345';
	filesize: number = 1024;
	uriPath: string = '/l';
	public: boolean = true;
	hash: string = 'hash';

	constructor(provider: string) {
		this.provider = provider;
	}

	removeMeta(key: string): boolean {
		const initialLength = this.metadata.length;
		this.metadata = this.metadata.filter(meta => meta.key !== key);
		return this.metadata.length < initialLength;
	}

	getMeta<Metadata extends AbstractMetadataValueObject<any>>(
		key: string,
	): undefined | Metadata {
		return this.metadata.find(meta => meta.key === key) as
			| undefined
			| Metadata;
	}

	addMeta(metadata: AbstractMetadataValueObject<any>): boolean {
		this.metadata.push(metadata);
		return true;
	}

	hasMeta(key: string): boolean {
		return this.metadata.some(meta => meta.key === key);
	}

	isModified(): boolean {
		return this.updatedAt.isAfter(this.createdAt);
	}

	sameHash(hash: string): boolean {
		return this.hash === hash;
	}
}

export default SimpleFileEntity;

describe('core -> modules -> storage -> services -> LocalStorageService -> logic', () => {
	const directory = 'test-directory';
	const bucket_name = 'test-bucket';
	const available_mimetypes = ['application/zip', 'image/jpeg', 'image/png'];

	const SecretManagerService: IKeyManagerService<Buffer> = {
		name: 'SecretManagerService',
		load: jest.fn() as any,
		get: jest.fn() as any,
		current_version: 1,
	};

	const KeyPairManagerService: IKeyManagerService<{ sk: Buffer; pk: Buffer }> =
		{
			name: 'KeyPairManagerService',
			load: jest.fn() as any,
			get: jest.fn() as any,
			current_version: 1,
		};

	const service = new LocalStorageService(
		directory,
		bucket_name,
		available_mimetypes,
		SecretManagerService,
		KeyPairManagerService,
	);

	beforeAll(() => {
		const seed = Buffer.from('secret-key-32bits-sample-for-signature');
		const keys = ed25519.generateKeyPair(seed);
		const secret = aes256.generateSecret(seed);

		SecretManagerService.get = jest.fn().mockReturnValue(secret) as any;

		KeyPairManagerService.get = jest.fn().mockReturnValue({
			sk: keys.sk,
			pk: keys.pk,
		}) as any;
	});

	beforeEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	const entity = new SimpleFileEntity('local');

	describe('download() method', () => {
		it('should download file successfully', async () => {
			const mockStream = {};

			jest
				.spyOn(fileUtils, 'getAbsolutePath')
				.mockResolvedValue(Result.ok('abspath'));

			const createReadStreamFn = jest
				.fn()
				.mockReturnValue(mockStream as any) as any;

			jest
				.spyOn(fs, 'createReadStream')
				.mockImplementation(createReadStreamFn);

			const result = await service.download(entity);

			expect(createReadStreamFn).toHaveBeenCalledWith('abspath');
			expect(result.isSuccess).toBe(true);
			expect(result.data).toEqual({
				stream: mockStream as fs.ReadStream,
				mimetype: 'application/zip',
				filename: 'uuid.zip',
			});
		});

		it('should throw IncompatibleFileError for incompatible file', async () => {
			jest.spyOn(service, 'isCompatible').mockReturnValue(false);

			await expect(service.download(entity)).rejects.toThrow(
				IncompatibleFileError,
			);
		});

		it('should return error when abspath retrieval fails', async () => {
			jest
				.spyOn(fileUtils, 'getAbsolutePath')
				.mockResolvedValue(Result.fail(FileNotFoundError.ptBR()));

			const result = await service.download(entity);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(FileNotFoundError);
		});
	});

	describe('delete() method', () => {
		it('should throw an error if file entity is not compatible', async () => {
			await expect(
				service.delete(new SimpleFileEntity('another')),
			).rejects.toThrow(IncompatibleFileError);
		});
	});

	describe('sign() method', () => {
		it('should throw an error if file entity is not compatible', async () => {
			await expect(
				service.sign(
					new SimpleFileEntity('another'),
					URLValueObject.createFromString('http://localhost:3000/'),
					60,
				),
			).rejects.toThrow(IncompatibleFileError);
		});

		it('should return signed payload', async () => {
			jest.spyOn(Date, 'now').mockReturnValue(1712757878660);

			jest
				.spyOn(Hmac.prototype, 'digest')
				.mockReturnValue(
					'7eaa65d56db73530c497f3e4c655afb2a57c07b18e51b0bd811dba62cebea159',
				);

			const result = await service.sign(
				entity,
				URLValueObject.createFromString('http://localhost:3000/'),
				60,
			);

			expect(
				result.download.startsWith(
					`http://localhost:3000/download/l/f/uuid/e/zip/12345?s=`,
				),
			).toBe(true);
			expect(
				result.view.startsWith(
					`http://localhost:3000/view/l/f/uuid/e/zip/12345?s=`,
				),
			).toBe(true);
		});
	});

	describe('checkSignature() method', () => {
		it('should fails if payload is not base64 encoded', async () => {
			await expect(() =>
				service.checkSignature(
					entity,
					'invalid-signature', // invalid-signature
				),
			).rejects.toThrow(CannotEvaluateSignatureError);
		});

		it('should fails if payload is invalid', async () => {
			const result = await service.checkSignature(
				entity,
				'aW52YWxpZC1zaWduYXR1cmU', // invalid-signature
			);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(URLInvalidSignatureError);
		});

		it('should fails if signature is expired', async () => {
			jest.spyOn(Date, 'now').mockReturnValue(1712759878960);

			const result = await service.checkSignature(
				entity,
				'MTcxMjc1NzkzODoppbnZhbGlkLXNpZ25hdHVyZQ', // '1712757938:invalid-signature'
			);

			expect(result.isFailure).toBe(true);
			expect(result.error).toBeInstanceOf(URLExpiredError);
		});

		it('should fails if signature is invalid', async () => {
			jest.spyOn(Date, 'now').mockReturnValue(1712757878660);

			await expect(() =>
				service.checkSignature(
					entity,
					'MTcxMjc1NzkzODppbnZhbGlkLXNpZ25hdHVyZQ', // 1712757938:invalid-signature
				),
			).rejects.toThrow(CannotEvaluateSignatureError);
		});

		it('should return true if signature is valid', async () => {
			jest.spyOn(Date, 'now').mockReturnValue(1712757878660);

			const signature = await service.sign(
				entity,
				URLValueObject.createFromString('http://localhost:3000/'),
				60,
			);

			const result = await service.checkSignature(
				entity,
				signature.download.split('?s=')[1],
			);

			expect(result.isSuccess).toBe(true);
			expect(result.data).toBe(true);
		});
	});
});
