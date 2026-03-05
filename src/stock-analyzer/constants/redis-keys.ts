export const REDIS_PREFIX = {
  QUOTE: 'stock:quote',
  ALERT_LOCK: 'stock:alert:lock',
  WISHLIST: 'stock:wishlist'
} as const;

export const buildRedisKey = {
  quote: (symbol: string) => `${REDIS_PREFIX.QUOTE}:${symbol.toUpperCase()}`,
  alertLock: (userId: string, symbol: string) => 
    `${REDIS_PREFIX.ALERT_LOCK}:${userId}:${symbol.toUpperCase()}`,
  wishlist: (userId: string) => `${REDIS_PREFIX.WISHLIST}:${userId}`
};
