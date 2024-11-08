import zlib from 'zlib';
import path from 'path';
import fs from 'fs';

import { IKeyManagerService, ed25519, aes256 } from '@piggly/secrets';
import { DomainError, Result } from '@piggly/ddd-toolkit';
import moment from 'moment-timezone';

import type {
	StorageUploadOptions,
	UploadableFileData,
	DownlableFileData,
	IStorageService,
	SignedFileURL,
	IFileEntity,
} from '@/services/types/index.js';

import CannotEvaluateSignatureError from '@/errors/runtime/CannotEvaluateSignatureError.js';
import EncryptionMetadataValueObject from '@/values/EncryptionMetadataValueObject.js';
import CannotDecryptFileError from '@/errors/runtime/CannotDecryptFileError.js';
import CannotSignFileURLError from '@/errors/runtime/CannotSignFileURLError.js';
import IncompatibleFileError from '@/errors/runtime/IncompatibleFileError.js';
import URLInvalidSignatureError from '@/errors/URLInvalidSignatureError.js';
import { getAbsolutePath, unlinkFile, uploadFile } from '@/utils/file.js';
import AbstractStorageService from '@/services/AbstractStorageService.js';
import URLExpiredError from '@/errors/URLExpiredError.js';
import URLValueObject from '@/values/URLValueObject.js';
import { UploadFileMeta } from '@/utils/types/index.js';

export default class LocalStorageService
	extends AbstractStorageService
	implements IStorageService
{
	private readonly keypairs: IKeyManagerService<{ sk: Buffer; pk: Buffer }>;

	private readonly secrets: IKeyManagerService<Buffer>;

	private readonly bucket_name: string;

	private readonly directory: string;

	constructor(
		directory: string,
		bucket_name: string,
		available_mimetypes: Array<string>,
		secrets: IKeyManagerService<Buffer>,
		keypairs: IKeyManagerService<{ sk: Buffer; pk: Buffer }>,
	) {
		super(available_mimetypes);

		this.directory = directory;
		this.bucket_name = bucket_name;
		this.secrets = secrets;
		this.keypairs = keypairs;
	}

	public async download(
		file: IFileEntity,
	): Promise<Result<DownlableFileData, DomainError>> {
		if (this.isCompatible(file) === false) {
			throw IncompatibleFileError.lang(process.env?.APP_LANG ?? 'enUS');
		}

		const abspath = await getAbsolutePath(file.absolutePath);

		if (abspath.isFailure) {
			return abspath as Result<never, DomainError>;
		}

		let stream: any = fs.createReadStream(abspath.data);

		try {
			if (file.encrypted) {
				const encryption =
					file.getMeta<EncryptionMetadataValueObject>('encryption');

				if (
					!encryption ||
					encryption.isKeyCompatible(this.secrets) === false
				) {
					throw CannotDecryptFileError.lang(
						process.env?.APP_LANG ?? 'enUS',
						new Error('Invalid key for file.'),
					);
				}

				stream = stream.pipe(
					aes256.decryptStream(this.secrets.get(encryption.version), [
						encryption.randomKey,
					]),
				);
			}

			if (file.compressed) {
				stream = stream.pipe(zlib.createUnzip());
			}
		} catch (err: any) {
			throw CannotDecryptFileError.lang(
				process.env?.APP_LANG ?? 'enUS',
				err,
			);
		}

		return Result.ok({
			filename: `${file.originalFilename}.${file.extension}`,
			mimetype: file.mimetype,
			stream,
		});
	}

	public async checkSignature(
		file: IFileEntity,
		payload: string,
	): Promise<Result<true, DomainError>> {
		if (this.isCompatible(file) === false) {
			throw IncompatibleFileError.lang(process.env?.APP_LANG ?? 'enUS');
		}

		try {
			const [expires = undefined, signature = undefined] =
				atob(payload).split(':');

			if (expires === undefined || signature === undefined) {
				return Result.fail(
					URLInvalidSignatureError.lang(process.env?.APP_LANG ?? 'enUS'),
				);
			}

			if (moment().unix() > parseInt(expires, 10)) {
				return Result.fail(
					URLExpiredError.lang(process.env?.APP_LANG ?? 'enUS'),
				);
			}

			const check = ed25519.verify(
				Buffer.from(`${file.fileid}:${file.filename}:${expires}`, 'utf-8'),
				Buffer.from(signature, 'hex'),
				this.keypairs.get().pk,
			);

			if (check === false) {
				return Result.fail(
					URLInvalidSignatureError.lang(process.env?.APP_LANG ?? 'enUS'),
				);
			}

			return Result.ok(true);
		} catch (err: any) {
			throw CannotEvaluateSignatureError.lang(
				process.env?.APP_LANG ?? 'enUS',
				err,
			);
		}
	}

	public async sign(
		file: IFileEntity,
		download_url: URLValueObject,
		expires: number,
	): Promise<SignedFileURL> {
		if (this.isCompatible(file) === false) {
			throw IncompatibleFileError.lang(process.env?.APP_LANG ?? 'enUS');
		}
		try {
			const future = moment().unix() + expires;
			const payload = `${file.fileid}:${file.filename}:${future}`;
			const signature = ed25519
				.signFromString(payload, this.keypairs.get().sk)
				.toString('hex');

			const signed = `${future}:${signature}`;

			return {
				download: download_url.concat(
					[
						'download',
						file.uriPath,
						'f',
						file.filename,
						'e',
						file.extension,
						file.fileid,
					],
					`s=${btoa(signed).replace(/=/g, '')}`,
				).string,
				view: download_url.concat(
					[
						'view',
						file.uriPath,
						'f',
						file.filename,
						'e',
						file.extension,
						file.fileid,
					],
					`s=${btoa(signed).replace(/=/g, '')}`,
				).string,
			};
		} catch (err: any) {
			throw CannotSignFileURLError.lang(
				process.env?.APP_LANG ?? 'enUS',
				err,
			);
		}
	}

	public async upload(
		file: UploadableFileData,
		options: StorageUploadOptions = {},
	): Promise<
		Result<
			{
				options: StorageUploadOptions;
				metadata: UploadFileMeta;
				bucket_name: string;
				provider: string;
				filename: string;
			},
			DomainError
		>
	> {
		const metadata = await uploadFile(
			file,
			path.join(this.directory, this.bucket_name),
			this.available_mimetypes,
			{
				encrypt: options.encrypt ? this.secrets : undefined,
				compress: options.compress,
				caption: options.caption,
			},
		);

		if (metadata.isFailure) {
			return metadata as Result<never, DomainError>;
		}

		return Result.ok({
			bucket_name: this.bucket_name,
			provider: this.provider,
			filename: file.filename,
			metadata: metadata.data,
			options: options,
		});
	}

	public async delete(
		file: IFileEntity,
		afterUnlink?: (entity: IFileEntity) => Promise<void>,
	): Promise<Result<boolean, never>> {
		if (this.isCompatible(file) === false) {
			throw IncompatibleFileError.lang(process.env?.APP_LANG ?? 'enUS');
		}

		const { absolutePath } = file;

		if (absolutePath === null) {
			return Result.ok(false);
		}

		try {
			await unlinkFile(absolutePath);

			if (afterUnlink) {
				await afterUnlink(file);
			}
		} catch {
			return Result.ok(false);
		}

		return Result.ok(true);
	}

	public get provider(): string {
		return 'local';
	}
}
