import { DomainError, Result } from '@piggly/ddd-toolkit';
import { fileTypeFromBuffer } from 'file-type';

import UnsupportedMimetypeError from '@/errors/UnsupportedMimetypeError.js';

export const calculateMimetype = async (
	chunk: Buffer,
	allows: Array<string>,
): Promise<Result<{ extension: string; mimetype: string }, DomainError>> => {
	const mime = await fileTypeFromBuffer(chunk);

	if (!mime) {
		return Result.fail(
			UnsupportedMimetypeError.lang(process.env?.APP_LANG ?? 'enUS', allows),
		);
	}

	if (allows.includes(mime.mime) === false) {
		return Result.fail(
			UnsupportedMimetypeError.lang(process.env?.APP_LANG ?? 'enUS', allows),
		);
	}

	return Result.ok({
		mimetype: mime.mime,
		extension: mime.ext,
	});
};
