import bcrypt from 'bcryptjs';

/**
 * Hashes a 4-digit PIN using bcrypt
 * Cost factor 10 is a good balance for mobile performance vs security
 */
export const hashPin = async (pin: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
};

/**
 * Verifies a PIN against a stored hash
 */
export const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(pin, hash);
};