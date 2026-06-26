// src/data/database/uuid.ts

// Generador de IDs únicos sin dependencias externas
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 8);
  const random2 = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random1}-${random2}`;
}