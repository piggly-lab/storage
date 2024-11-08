import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class URLExpiredError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('URLExpiredError', message, hint, 404);
	}

	public static lang(lang: string): URLExpiredError {
		switch (lang) {
			case 'ptBR':
				return URLExpiredError.ptBR();
			case 'enUS':
			default:
				return URLExpiredError.enUS();
		}
	}

	public static enUS(): URLExpiredError {
		return new URLExpiredError(
			'Expired URL.',
			`The link to the file has expired and can no longer be accessed.`,
		);
	}

	public static ptBR(): URLExpiredError {
		return new URLExpiredError(
			'URL expirada.',
			`O link para o arquivo expirou e não pode mais ser acessado.`,
		);
	}
}
