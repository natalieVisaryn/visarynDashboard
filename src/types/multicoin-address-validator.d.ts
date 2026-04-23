declare module "multicoin-address-validator" {
  const WAValidator: {
    validate(address: string, currencyNameOrSymbol: string, opts?: unknown): boolean;
  };
  export default WAValidator;
}
