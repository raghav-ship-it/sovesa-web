// API Response Status Messages
export const API_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  INTERNAL_SERVER_ERROR: "Internal server error",
  MISSING_REQUIRED_FIELDS: "Missing required fields",
  VALIDATION_ERROR: "Validation error",
  NOT_FOUND: "Not found",
  ALREADY_EXISTS: "Already exists",
  SUCCESS: "Success",
} as const;

// Validation Patterns
export const VALIDATION_PATTERNS = {
  PHONE_NUMBER: /^\d{10}$/,
  EMAIL: /^[^\s@]+@pilani\.bits-pilani\.ac\.in$/,
  STUDENT_ID: /^(2017|2018|2019|2020|2021|2022|2023|2024|2025)(A[1-9]|B[1-5]|AA|AB)PS\d{4}(P|G|H)$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
} as const;

// Validation Error Messages
export const VALIDATION_ERRORS = {
  PHONE_NUMBER: "Phone number must be 10 digits",
  EMAIL: "Please use your BITS Pilani email address (@pilani.bits-pilani.ac.in)",
  STUDENT_ID: "Student ID must be in format: YYYYBCPS####(P|G|H) (e.g., 2024A4PS1234P)",
  NAME: "Name must be 2-50 characters with only letters and spaces",
  REQUIRED_FIELD: (fieldName: string) => `Missing required field: ${fieldName}`,
} as const;

// Database Table Names
export const DB_TABLES = {
  PARTICIPANTS: 'participants',
  VOLUNTEERS: 'volunteers',
  VOLUNTEER_APPLICATIONS: 'volunteer_applications',
  SCAN_LOGS: 'scan_logs',
  GIFT_LOGS: 'gift_logs',
  USERS: 'users',
} as const;

// Event Constants
export const EVENT_CONSTANTS = {
  DEFAULT_EVENT: 'Janmashtami 2025',
  STATUS: {
    REGISTERED: 'registered',
    SCANNED: 'scanned',
    CHECKED_IN: 'checked-in',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  PARTICIPANTS: '/api/participants',
  VOLUNTEERS: '/api/volunteers',
  VOLUNTEER_APPLICATIONS: '/api/volunteer-applications',
  SCAN: '/api/scan',
  USERS: '/api/users',
} as const; 