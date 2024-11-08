import { pipeline } from 'stream/promises';
import { type Readable } from 'stream';
import crypto from 'crypto';
import path from 'path';
import zlib from 'zlib';
import fs from 'fs';

import {
	MapCollectionOfValueObjects,
	DomainError,
	TOrNullable,
	Result,
} from '@piggly/ddd-toolkit';
import { aes256 } from '@piggly/secrets';
import pump from 'pump';

import type {
	StreamCallback,
	UploadFileMeta,
	UploadOptions,
	FileMeta,
} from '@/utils/types/index.js';
import type { UploadableFileData } from '@/services/types/index.js';

import CannotCreateDirectoryError from '@/errors/runtime/CannotCreateDirectoryError.js';
import EncryptionMetadataValueObject from '@/values/EncryptionMetadataValueObject.js';
import UnavailableMimeTypeError from '@/errors/runtime/UnavailableMimetypeError.js';
import AbstractMetadataValueObject from '@/values/AbstractMetadataValueObject.js';
import CannotEncryptFileError from '@/errors/runtime/CannotEncryptFileError.js';
import { HashAndSizeTransform, MimeTypeTransform } from '@/utils/transforms.js';
import CannotCreateFileError from '@/errors/runtime/CannotCreateFileError.js';
import CannotUploadFileError from '@/errors/runtime/CannotUploadFileError.js';
import UnsupportedMimetypeError from '@/errors/UnsupportedMimetypeError.js';
import UnlinkFileErrorEvent from '@/events/UnlinkFileErrorEvent.js';
import UploadFileErrorEvent from '@/events/UploadFileErrorEvent.js';
import UnlinkLocalFileEvent from '@/events/UnlinkLocalFileEvent';
import ReadFileErrorEvent from '@/events/ReadFileErrorEvent.js';
import FileNotFoundError from '@/errors/FileNotFoundError.js';
import { getFileExtension } from '@/utils/sanitize.js';

export const getAbsolutePath = async (
	abspath: TOrNullable<string>,
): Promise<Result<string, DomainError>> => {
	if (abspath === null) {
		return Result.fail(
			FileNotFoundError.lang(process.env?.APP_LANG ?? 'enUS'),
		);
	}

	return new Promise(resolve => {
		fs.stat(abspath, (err, stats) => {
			if (err) {
				ReadFileErrorEvent.publish(err);
				return resolve(
					Result.fail(
						FileNotFoundError.lang(process.env?.APP_LANG ?? 'enUS'),
					),
				);
			}

			if (stats.isFile() === false) {
				return resolve(
					Result.fail(
						FileNotFoundError.lang(process.env?.APP_LANG ?? 'enUS'),
					),
				);
			}

			return resolve(Result.ok(abspath));
		});
	});
};

export const processFile = async (
	file: Readable,
	allows: Array<string>,
	streams: StreamCallback,
): Promise<Result<FileMeta, DomainError>> => {
	const name = crypto.randomUUID();
	let _hash = '';
	let _size = 0;
	let _mimetype: string;
	let _extension: string;

	const mimeTypeTransform = new MimeTypeTransform(4100, allows);
	const hashAndSizeTransform = new HashAndSizeTransform();

	mimeTypeTransform.on('end', () => {
		_mimetype = mimeTypeTransform.mimetype as string;
		_extension = mimeTypeTransform.extension as string;
	});

	hashAndSizeTransform.on('end', () => {
		_size = hashAndSizeTransform.size;
		_hash = hashAndSizeTransform.hash;
	});

	return new Promise((resolve, rejects) => {
		pump(
			file,
			mimeTypeTransform,
			hashAndSizeTransform,
			...streams(name),
			(err: any) => {
				if (err) {
					if (err instanceof UnsupportedMimetypeError) {
						return rejects(
							UnavailableMimeTypeError.lang(
								process.env?.APP_LANG ?? 'enUS',
								allows,
							),
						);
					}

					UploadFileErrorEvent.publish(err);
					return rejects(
						CannotUploadFileError.lang(
							process.env?.APP_LANG ?? 'enUS',
							err,
						),
					);
				}

				return resolve(
					Result.ok({
						extension: _extension,
						mimetype: _mimetype,
						hash: _hash,
						size: _size,
						name,
					}),
				);
			},
		);
	});
};

export const writeFile = async (file: Readable, abspath: string) => {
	try {
		await pipeline(file, fs.createWriteStream(abspath));
	} catch (err: any) {
		throw CannotCreateFileError.lang(process.env?.APP_LANG ?? 'enUS', err);
	}
};

export const removeFile = async (abspath: string) =>
	new Promise<void>(res => {
		fs.unlink(abspath, err => {
			if (err) {
				UnlinkFileErrorEvent.publish(err);
				return res();
			}

			return res();
		});
	});

export const unlinkFile = (abspath: string) =>
	new Promise<void>((res, rej) => {
		fs.unlink(abspath, err => {
			if (err) {
				if (err.code === 'ENOENT') {
					return res();
				}

				UnlinkFileErrorEvent.publish(err);
				return rej(err);
			}

			return res();
		});
	});

export const createDirectory = (abspath: string) => {
	try {
		if (fs.existsSync(abspath) === true) {
			return;
		}

		fs.mkdirSync(abspath, { recursive: true });
	} catch (err: any) {
		throw CannotCreateDirectoryError.lang(
			process.env?.APP_LANG ?? 'enUS',
			err,
		);
	}
};

export const uploadFile = async (
	file: UploadableFileData,
	upload_path: string,
	allowed_mimetypes: Array<string>,
	options: UploadOptions = {},
): Promise<Result<UploadFileMeta, DomainError>> => {
	const abspath = path.join(
		upload_path,
		new Date().getFullYear().toString(),
		(new Date().getMonth() + 1).toString().padStart(2, '0'),
	);

	let filepath = abspath;

	const filemeta = new MapCollectionOfValueObjects<
		string,
		AbstractMetadataValueObject<any>
	>();

	const createStreams = (name: string) => {
		filepath = path.join(
			abspath,
			`${name}.${getFileExtension(file.filename)}`,
		);

		createDirectory(abspath);
		const streams = [];

		if (options.compress === true) {
			streams.push(zlib.createGzip());
		}

		if (options.encrypt) {
			try {
				const encrypt = EncryptionMetadataValueObject.fromBuffer(
					crypto.randomBytes(32),
					options.encrypt.current_version,
					options.encrypt.name,
				);

				filemeta.add('encryption', encrypt);

				streams.push(
					aes256.encryptStream(options.encrypt.get(), [encrypt.randomKey]),
				);
			} catch (err: any) {
				throw CannotEncryptFileError.lang(
					process.env?.APP_LANG ?? 'enUS',
					err,
				);
			}
		}

		streams.push(fs.createWriteStream(filepath));
		return streams;
	};

	const metadata = await processFile(
		file.stream,
		allowed_mimetypes,
		createStreams,
	);

	if (metadata.isFailure) {
		return metadata as Result<never, DomainError>;
	}

	const { extension, mimetype, name, hash, size } = metadata.data;

	return Result.ok({
		extension,
		mimetype,
		filepath,
		filemeta,
		name,
		hash,
		size,
	});
};
