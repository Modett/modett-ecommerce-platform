export const config = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001/api/v1/catalog',
  apiTimeout: 30000,
} as const;
