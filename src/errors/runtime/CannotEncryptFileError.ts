import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotEncryptFileError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotEncryptFileError',
			crc32('CannotEncryptFileError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotEncryptFileError {
		switch (lang) {
			case 'ptBR':
				return CannotEncryptFileError.ptBR(error);
			case 'enUS':
			default:
				return CannotEncryptFileError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotEncryptFileError {
		return new CannotEncryptFileError(
			'Não foi possível criptografar o arquivo.',
			`O sistema produziu um erro ao tentar criptografar o arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotEncryptFileError {
		return new CannotEncryptFileError(
			'Could not encrypt the file.',
			`The system produced an error while trying to encrypt the file.`,
			error,
		);
	}
}
