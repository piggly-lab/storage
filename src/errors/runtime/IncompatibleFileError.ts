import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class IncompatibleFileError extends RuntimeError {
	constructor(message: string, hint: string) {
		super(
			'IncompatibleFileError',
			crc32('IncompatibleFileError'),
			message,
			500,
			hint,
		);
	}

	public static lang(lang: string): IncompatibleFileError {
		switch (lang) {
			case 'ptBR':
				return IncompatibleFileError.ptBR();
			case 'enUS':
			default:
				return IncompatibleFileError.enUS();
		}
	}

	public static ptBR(): IncompatibleFileError {
		return new IncompatibleFileError(
			'Erro ao processar o arquivo.',
			`Ele não é compatível com o provedor de armazenamento utilizado.`,
		);
	}

	public static enUS(): IncompatibleFileError {
		return new IncompatibleFileError(
			'Error processing the file.',
			`It is not compatible with the storage provider used.`,
		);
	}
}
