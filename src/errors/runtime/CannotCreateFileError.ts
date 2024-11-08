import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotCreateFileError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotCreateFileError',
			crc32('CannotCreateFileError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotCreateFileError {
		switch (lang) {
			case 'ptBR':
				return CannotCreateFileError.ptBR(error);
			case 'enUS':
			default:
				return CannotCreateFileError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotCreateFileError {
		return new CannotCreateFileError(
			'Não foi possível salvar o arquivo.',
			`O sistema produziu um erro ao tentar salvar o arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotCreateFileError {
		return new CannotCreateFileError(
			'Could not save the file.',
			`The system produced an error while trying to save the file.`,
			error,
		);
	}
}
