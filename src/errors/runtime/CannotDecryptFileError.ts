import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotDecryptFileError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotDecryptFileError',
			crc32('CannotDecryptFileError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotDecryptFileError {
		switch (lang) {
			case 'ptBR':
				return CannotDecryptFileError.ptBR(error);
			case 'enUS':
			default:
				return CannotDecryptFileError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotDecryptFileError {
		return new CannotDecryptFileError(
			'Não foi possível descriptografar o arquivo.',
			`O sistema produziu um erro ao tentar descriptografar o arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotDecryptFileError {
		return new CannotDecryptFileError(
			'Could not decrypt the file.',
			`The system produced an error while trying to decrypt the file.`,
			error,
		);
	}
}
