/**
 * Utilitário para cálculos monetários precisos
 * Evita problemas de precisão de ponto flutuante do JavaScript
 */
export class CurrencyUtil {
  /**
   * Converte valor para centavos (inteiro) para evitar problemas de ponto flutuante
   */
  private static toCents(value: number | string): number {
    const numValue = Number(value) || 0;
    return Math.round(numValue * 100);
  }

  /**
   * Converte centavos de volta para reais
   */
  private static toReais(cents: number): number {
    return cents / 100;
  }

  /**
   * Soma valores monetários com precisão
   */
  static add(...values: (number | string)[]): number {
    const totalCents = values.reduce<number>((sum, value) => {
      return sum + this.toCents(value);
    }, 0);
    return this.toReais(totalCents);
  }

  /**
   * Subtrai valores monetários com precisão
   */
  static subtract(value1: number | string, value2: number | string): number {
    const cents1 = this.toCents(value1);
    const cents2 = this.toCents(value2);
    return this.toReais(cents1 - cents2);
  }

  /**
   * Multiplica valor por quantidade com precisão
   */
  static multiply(value: number | string, quantity: number): number {
    const cents = this.toCents(value);
    const result = cents * quantity;
    return this.toReais(result);
  }

  /**
   * Formata valor para exibição (R$ 10,50)
   */
  static format(value: number | string): string {
    const numValue = Number(value) || 0;
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Garante que o valor é um número válido
   */
  static toNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Arredonda valor para 2 casas decimais
   */
  static round(value: number | string): number {
    const numValue = Number(value) || 0;
    return Math.round(numValue * 100) / 100;
  }
}
