import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class FileNotFoundError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('FileNotFoundError', message, hint, 404);
	}

	public static lang(lang: string): FileNotFoundError {
		switch (lang) {
			case 'ptBR':
				return FileNotFoundError.ptBR();
			case 'enUS':
			default:
				return FileNotFoundError.enUS();
		}
	}

	public static ptBR(): FileNotFoundError {
		return new FileNotFoundError(
			'Arquivo não encontrado.',
			`O arquivo que você está tentando acessar não está mais disponível.`,
		);
	}

	public static enUS(): FileNotFoundError {
		return new FileNotFoundError(
			'File not found.',
			`The file you are trying to access is no longer available.`,
		);
	}
}
