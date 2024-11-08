import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class UnavailableMimeTypeError extends RuntimeError {
	constructor(message: string, hint: string, error?: Error) {
		super(
			'UnavailableMimeTypeError',
			crc32('UnavailableMimeTypeError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static lang(
		lang: string,
		supported: string[],
		error?: Error,
	): UnavailableMimeTypeError {
		switch (lang) {
			case 'ptBR':
				return UnavailableMimeTypeError.ptBR(supported, error);
			case 'enUS':
			default:
				return UnavailableMimeTypeError.enUS(supported, error);
		}
	}

	public static ptBR(
		supported: string[],
		error?: Error,
	): UnavailableMimeTypeError {
		return new UnavailableMimeTypeError(
			'Tipo de arquivo não suportado.',
			`Os tipos de arquivos suportados são: ${supported.join(',')}.`,
			error,
		);
	}

	public static enUS(
		supported: string[],
		error?: Error,
	): UnavailableMimeTypeError {
		return new UnavailableMimeTypeError(
			'Unsupported file type.',
			`Supported file types are: ${supported.join(',')}.`,
			error,
		);
	}
}
