import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class UnsupportedMimetypeError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('UnsupportedMimetypeError', message, hint, 422);
	}

	public static lang(
		lang: string,
		supported: string[],
	): UnsupportedMimetypeError {
		switch (lang) {
			case 'ptBR':
				return UnsupportedMimetypeError.ptBR(supported);
			case 'enUS':
			default:
				return UnsupportedMimetypeError.enUS(supported);
		}
	}

	public static ptBR(supported: string[]): UnsupportedMimetypeError {
		return new UnsupportedMimetypeError(
			'Tipo de arquivo não suportado.',
			`Os tipos de arquivos suportados são: ${supported.join(',')}.`,
		);
	}

	public static enUS(supported: string[]): UnsupportedMimetypeError {
		return new UnsupportedMimetypeError(
			'Unsupported file type.',
			`Supported file types are: ${supported.join(',')}.`,
		);
	}
}
