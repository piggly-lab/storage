import { RuntimeError } from '@piggly/ddd-toolkit';
import { crc32 } from 'crc';

export default class CannotEvaluateSignatureError extends RuntimeError {
	constructor(message: string, hint: string, error: Error) {
		super(
			'CannotEvaluateSignatureError',
			crc32('CannotEvaluateSignatureError'),
			message,
			500,
			hint,
			error,
		);
	}

	public static ptBR(error: Error): CannotEvaluateSignatureError {
		return new CannotEvaluateSignatureError(
			'Não foi possível verificar a assinatura da URL do arquivo.',
			`O sistema produziu um erro ao tentar verificar a assinatura da URL do arquivo.`,
			error,
		);
	}

	public static enUS(error: Error): CannotEvaluateSignatureError {
		return new CannotEvaluateSignatureError(
			'Could not verify the signature of the file URL.',
			`The system produced an error while trying to verify the signature of the file URL.`,
			error,
		);
	}

	public static lang(
		lang: string,
		error: Error,
	): CannotEvaluateSignatureError {
		switch (lang) {
			case 'ptBR':
				return CannotEvaluateSignatureError.ptBR(error);
			case 'enUS':
			default:
				return CannotEvaluateSignatureError.enUS(error);
		}
	}
}
