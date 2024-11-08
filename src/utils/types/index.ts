import type { MapCollectionOfValueObjects } from '@piggly/ddd-toolkit';
import type { IKeyManagerService } from '@piggly/secrets';
import type pump from 'pump';

import type AbstractMetadataValueObject from '@/values/AbstractMetadataValueObject.js';

export type GetMimeTypeCallback = () => Partial<{
	extension: string;
	mimetype: string;
}>;

export type StreamCallback = (name: string) => Array<pump.Stream>;

export type FileMime = { extension: string; mimetype: string };

export type FileMeta = {
	extension: string;
	mimetype: string;
	name: string;
	hash: string;
	size: number;
};

export type UploadOptions = Partial<{
	encrypt: IKeyManagerService<Buffer>;
	compress: boolean;
	caption: string;
}>;

export type UploadFileMeta = {
	filemeta: MapCollectionOfValueObjects<
		string,
		AbstractMetadataValueObject<any>
	>;
	extension: string;
	mimetype: string;
	filepath: string;
	name: string;
	hash: string;
	size: number;
};
