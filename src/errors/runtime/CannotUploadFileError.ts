import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotUploadFileError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotUploadFileError',
			crc32('CannotUploadFileError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotUploadFileError {
		switch (lang) {
			case 'ptBR':
				return CannotUploadFileError.ptBR(error);
			case 'enUS':
			default:
				return CannotUploadFileError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotUploadFileError {
		return new CannotUploadFileError(
			'Não foi possível fazer o upload.',
			`O sistema produziu um erro ao tentar fazer o upload do arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotUploadFileError {
		return new CannotUploadFileError(
			'Could not upload the file.',
			`The system produced an error while trying to upload the file.`,
			error,
		);
	}
}
