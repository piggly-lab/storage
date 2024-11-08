import { BusinessRuleViolationError } from '@piggly/ddd-toolkit';

export default class FileNotSentError extends BusinessRuleViolationError {
	constructor(message: string, hint: string) {
		super('FileNotSentError', message, hint, 422);
	}

	public static lang(lang: string): FileNotSentError {
		switch (lang) {
			case 'ptBR':
				return FileNotSentError.ptBR();
			case 'enUS':
			default:
				return FileNotSentError.enUS();
		}
	}

	public static ptBR(): FileNotSentError {
		return new FileNotSentError(
			'Arquivo não enviado.',
			`Nenhum arquivo foi enviado para processamento.`,
		);
	}

	public static enUS(): FileNotSentError {
		return new FileNotSentError(
			'File not sent.',
			`No file was sent for processing.`,
		);
	}
}
