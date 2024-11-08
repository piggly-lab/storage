import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class URLInvalidSignatureError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('URLInvalidSignatureError', message, hint, 404);
	}

	public static lang(lang: string): URLInvalidSignatureError {
		switch (lang) {
			case 'ptBR':
				return URLInvalidSignatureError.ptBR();
			case 'enUS':
			default:
				return URLInvalidSignatureError.enUS();
		}
	}

	public static ptBR(): URLInvalidSignatureError {
		return new URLInvalidSignatureError(
			'URL com assinatura inválida.',
			`A URL que você está tentando acessar não é mais válida.`,
		);
	}

	public static enUS(): URLInvalidSignatureError {
		return new URLInvalidSignatureError(
			'URL with invalid signature.',
			`The URL you are trying to access is no longer valid.`,
		);
	}
}
