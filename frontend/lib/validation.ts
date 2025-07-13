import { VALIDATION_PATTERNS, VALIDATION_ERRORS } from './constants';

// Phone number validation
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: VALIDATION_ERRORS.REQUIRED_FIELD('phone') };
  }
  
  if (!VALIDATION_PATTERNS.PHONE_NUMBER.test(phone)) {
    return { isValid: false, error: VALIDATION_ERRORS.PHONE_NUMBER };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: VALIDATION_ERRORS.REQUIRED_FIELD('email') };
  }
  
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: VALIDATION_ERRORS.EMAIL };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: VALIDATION_ERRORS.REQUIRED_FIELD('name') };
  }
  
  if (!VALIDATION_PATTERNS.NAME.test(name)) {
    return { isValid: false, error: VALIDATION_ERRORS.NAME };
  }
  
  return { isValid: true };
};

// Student ID validation
export const validateStudentId = (studentId: string): { isValid: boolean; error?: string } => {
  if (!studentId) {
    return { isValid: false, error: VALIDATION_ERRORS.REQUIRED_FIELD('student ID') };
  }
  
  if (!VALIDATION_PATTERNS.STUDENT_ID.test(studentId)) {
    return { isValid: false, error: VALIDATION_ERRORS.STUDENT_ID };
  }
  
  return { isValid: true };
};

// Required field validation
export const validateRequiredField = (value: any, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: VALIDATION_ERRORS.REQUIRED_FIELD(fieldName) };
  }
  
  return { isValid: true };
};

// Multiple field validation
export const validateMultipleFields = (fields: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const validation = validateRequiredField(value, fieldName);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number formatting (optional)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Return original if not 10 digits
}; 