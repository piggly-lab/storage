import { DomainError, Result } from '@piggly/ddd-toolkit';

import type {
	StorageUploadOptions,
	UploadableFileData,
	DownlableFileData,
	IStorageService,
	SignedFileURL,
	IFileEntity,
} from '@/services/types/index.js';
import type { UploadFileMeta } from '@/utils/types/index.js';
import type URLValueObject from '@/values/URLValueObject.js';

export default abstract class AbstractStorageService
	implements IStorageService
{
	protected available_mimetypes: Array<string> = [];

	constructor(available_mimetypes: Array<string>) {
		this.available_mimetypes = available_mimetypes;
	}

	public abstract upload(
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

	public abstract sign(
		file: IFileEntity,
		download_url: URLValueObject,
		expires: number,
	): Promise<SignedFileURL>;

	public abstract checkSignature(
		file: IFileEntity,
		payload: string,
	): Promise<Result<true, DomainError>>;

	public abstract download(
		file: IFileEntity,
	): Promise<Result<DownlableFileData, DomainError>>;

	public isCompatible(file: IFileEntity): boolean {
		return file.provider === this.provider;
	}

	public abstract delete(
		file: IFileEntity,
	): Promise<Result<boolean, DomainError>>;

	public abstract get provider(): string;
}
