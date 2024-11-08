import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotSignFileURLError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotSignFileURLError',
			crc32('CannotSignFileURLError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(lang: string, error: Error): CannotSignFileURLError {
		switch (lang) {
			case 'ptBR':
				return CannotSignFileURLError.ptBR(error);
			case 'enUS':
			default:
				return CannotSignFileURLError.enUS(error);
		}
	}

	public static ptBR(error: Error): CannotSignFileURLError {
		return new CannotSignFileURLError(
			'Não foi possível assinar a URL do arquivo.',
			`O sistema produziu um erro ao tentar assinar a URL do arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotSignFileURLError {
		return new CannotSignFileURLError(
			'Could not sign the file URL.',
			`The system produced an error while trying to sign the file URL.`,
			error,
		);
	}
}
