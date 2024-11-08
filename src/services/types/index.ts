import type {
	TOrUndefined,
	DomainError,
	TOrNullable,
	Result,
} from '@piggly/ddd-toolkit';
import type { ReadStream } from 'fs';

import { type Readable } from 'stream';

import type AbstractMetadataValueObject from '@/values/AbstractMetadataValueObject.js';
import type URLValueObject from '@/values/URLValueObject.js';

import { UploadFileMeta } from '@/utils/types/index.js';

export interface IFileEntity {
	getMeta<Metadata extends AbstractMetadataValueObject<any>>(
		key: string,
	): TOrUndefined<Metadata>;
	addMeta(metadata: AbstractMetadataValueObject<any>): boolean;
	metadata: Array<AbstractMetadataValueObject<any>>;
	absolutePath: TOrNullable<string>;
	removeMeta(key: string): boolean;
	sameHash(hash: string): boolean;
	hasMeta(key: string): boolean;
	caption: TOrNullable<string>;
	originalFilename: string;
	createdAt: moment.Moment;
	updatedAt: moment.Moment;
	schemaVersion: number;
	isModified(): boolean;
	compressed: boolean;
	bucketName: string;
	encrypted: boolean;
	extension: string;
	readable: boolean;
	provider: string;
	mimetype: string;
	filename: string;
	filesize: number;
	uriPath: string;
	public: boolean;
	region: string;
	fileid: string;
	hash: string;
}

export type UploadableFileData = {
	stream: Readable;
	filename: string;
	mimetype: string;
	encoding: string;
};

export type DownlableFileData = {
	stream: ReadStream;
	filename: string;
	mimetype: string;
};

export type SignedFileURL = { download: string; view: string };

export type StorageUploadOptions = Partial<{
	compress: boolean;
	encrypt: boolean;
	caption: string;
	public: boolean;
}>;

export interface IStorageService {
	upload(
		file: UploadableFileData,
		options: StorageUploadOptions,
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
	>;

	sign(
		file: IFileEntity,
		download_url: URLValueObject,
		expires: number,
	): Promise<SignedFileURL>;

	checkSignature(
		file: IFileEntity,
		payload: string,
	): Promise<Result<true, DomainError>>;

	download(file: IFileEntity): Promise<Result<DownlableFileData, DomainError>>;

	delete(file: IFileEntity): Promise<Result<boolean, DomainError>>;

	isCompatible(file: IFileEntity): boolean;

	get provider(): string;
}
