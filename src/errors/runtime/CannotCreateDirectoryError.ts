import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotCreateDirectoryError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotCreateDirectoryError',
			crc32('CannotCreateDirectoryError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotCreateDirectoryError {
		switch (lang) {
			case 'ptBR':
				return CannotCreateDirectoryError.ptBR(error);
			case 'enUS':
			default:
				return CannotCreateDirectoryError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotCreateDirectoryError {
		return new CannotCreateDirectoryError(
			'Não foi possível criar o diretório.',
			'O sistema produziu um erro ao tentar criar o diretório.',
			error,
		);
	}

	public static enUS(error: Error): CannotCreateDirectoryError {
		return new CannotCreateDirectoryError(
			'Cannot create directory.',
			'The system produced an error when trying to create the directory.',
			error,
		);
	}
}
