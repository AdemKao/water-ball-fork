'use client';

import { useCallback } from 'react';

export function usePayment() {
  const validateCreditCard = useCallback((cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;
    let sum = 0;
    for (let i = 0; i < 16; i++) {
      let digit = parseInt(cleaned[i], 10);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }, []);

  const formatCardNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }, []);

  const formatExpiryDate = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  }, []);

  const isExpired = useCallback((expiryDate: string): boolean => {
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || !year) return true;
    const now = new Date();
    const expiry = new Date(2000 + year, month - 1);
    return expiry < now;
  }, []);

  return { validateCreditCard, formatCardNumber, formatExpiryDate, isExpired };
}
