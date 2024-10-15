type VPCSEnvironment = 'development' | 'ci' | 'catfood' | 'production' | 'staging' | 'local';

type TypeGuard = (o: unknown) => boolean;
type VPCSGuardDictionaryType = Record<string | symbol, TypeGuard>;
const isTypeGuard: TypeGuard = (obj: unknown): obj is TypeGuard => {
  if (!(obj && typeof obj === 'function')) return false;
  try {
    return typeof obj('test') === 'boolean';
  } catch (e) {
    return false;
  }
};
const VPCSEnvironments = ['development', 'ci', 'catfood', 'production', 'staging', 'local'];
type VPCSEnvBlock = { [key: string | number]: string | number | undefined };
const isEnvironment: TypeGuard = (o: unknown): o is VPCSEnvironment =>
  typeof o === 'string' && VPCSEnvironments.includes(o);

export {
  isEnvironment,
  isTypeGuard,
  type TypeGuard,
  type VPCSEnvironment,
  type VPCSGuardDictionaryType,
  type VPCSEnvBlock,
};
