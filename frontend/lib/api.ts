/**
 * API Service for handling HTTP requests to backend endpoints
 * Provides standardized response format and error handling
 */

export interface UserData {
  name: string;
  email: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  student_id: string;
  tripId: string;
}

export interface UserStorageData {
  name: string;
  email: string;
  profile_photo?: string;
}

export interface UserUpdateData {
  email: string;
  name?: string;
  phone?: string;
  student_id?: string;
}

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  student_id: string;
  courses?: string[];
  trips?: string[];
  volunteer?: string[];
}

/**
 * Standard API response format used throughout the application
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Main API service class for handling HTTP requests
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    // Use relative URLs for API calls (same domain)
    this.baseUrl = '/api';
  }

  /**
   * Generic method for making HTTP requests to API endpoints
   * Handles response parsing and error handling
   * @param endpoint - API endpoint path (e.g., '/users', '/participants')
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Promise<ApiResponse<T>> - Standardized response format
   */
  public async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `HTTP error! Status: ${response.status}`,
        };
      }

      // Check if the response follows the { success: true, data: ... } format
      if (responseData.success !== undefined && responseData.data !== undefined) {
        return {
          success: responseData.success,
          data: responseData.data,
          message: responseData.message,
          error: responseData.error,
        };
      }

      // Fallback for APIs that return data directly
      return {
        success: true,
        data: responseData,
        message: responseData.message,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Store new user data in the database
   * @param userData - User information to store
   * @returns Promise<ApiResponse> - Success/failure response
   */
  async storeUser(userData: UserStorageData): Promise<ApiResponse> {
    if (!userData.name || !userData.email) {
      return {
        success: false,
        error: 'Name and email are required',
      };
    }

    return this.fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Retrieve user data by email address
   * @param email - User's email address
   * @returns Promise<ApiResponse> - User data or error
   */
  async getUserByEmail(email: string): Promise<ApiResponse> {
    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }
    return this.fetchApi(`/users/${encodeURIComponent(email)}`);
  }

  /**
   * Get user profile information including courses and trips
   * @param email - User's email address
   * @returns Promise<ApiResponse<UserProfileData>> - User profile data
   */
  async getUserProfile(email: string): Promise<ApiResponse<UserProfileData>> {
    if (!email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }
    return this.fetchApi(`/users/${encodeURIComponent(email)}`);
  }

  /**
   * Update user profile information
   * @param userData - Updated user data
   * @returns Promise<ApiResponse> - Success/failure response
   */
  async updateUser(userData: UserUpdateData): Promise<ApiResponse> {
    if (!userData.email) {
      return {
        success: false,
        error: 'Email is required',
      };
    }
    return this.fetchApi('/users/update', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Register user for a course
   * @param registrationData - Course registration information
   * @param isAuthenticated - Whether user is logged in
   * @returns Promise<ApiResponse> - Registration result
   */
  async registerCourse(registrationData: RegistrationData, isAuthenticated = false): Promise<ApiResponse> {
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'You must be logged in to register for courses',
      };
    }
    if (!registrationData.name || !registrationData.email || !registrationData.phone || !registrationData.student_id) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }
    return this.fetchApi('/courses-registration', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  /**
   * Register user for a trip
   * @param registrationData - Trip registration information
   * @param isAuthenticated - Whether user is logged in
   * @returns Promise<ApiResponse> - Registration result
   */
  async registerTrip(registrationData: RegistrationData, isAuthenticated = false): Promise<ApiResponse> {
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'You must be logged in to register for trips',
      };
    }
    if (!registrationData.name || !registrationData.email || !registrationData.phone || !registrationData.student_id) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }
    return this.fetchApi('/trips-registration', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  /**
   * Get all available courses
   * @returns Promise<ApiResponse> - List of courses
   */
  async getCourses(): Promise<ApiResponse> {
    return this.fetchApi('/courses');
  }

  /**
   * Get all available trips
   * @returns Promise<ApiResponse> - List of trips
   */
  async getTrips(): Promise<ApiResponse> {
    return this.fetchApi('/trips');
  }

  /**
   * Check if user is registered for a specific course
   * @param email - User's email address
   * @param courseId - Course ID to check
   * @returns Promise<ApiResponse<boolean>> - Registration status
   */
  async isUserRegisteredForCourse(email: string, courseId: string): Promise<ApiResponse<boolean>> {
    if (!email || !courseId) {
      return {
        success: false,
        error: 'Email and courseId are required',
      };
    }
    try {
      const userProfile = await this.getUserProfile(email);
      if (!userProfile.success || !userProfile.data) {
        return {
          success: false,
          error: 'Failed to fetch user profile',
        };
      }
      const userData = userProfile.data as UserProfileData;
      const isRegistered = userData.courses?.includes(courseId) || false;
      return {
        success: true,
        data: isRegistered,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to check registration status',
      };
    }
  }
}

// Create singleton instance of API service
export const apiService = new ApiService();

/**
 * Utility functions for API operations
 */
export const apiUtils = {
  /**
   * Generic function to fetch data from any endpoint
   * @param endpoint - API endpoint path
   * @returns Promise<ApiResponse<T>> - Fetched data or error
   */
  async fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const result = await apiService.fetchApi<T>(endpoint);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

/**
 * Volunteer API functions for managing volunteer data
 */
export const volunteerApi = {
  /**
   * Get all volunteers
   * @returns Promise<ApiResponse<any[]>> - List of volunteers
   */
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiService.fetchApi<any[]>('/volunteers');
  },

  /**
   * Create a new volunteer
   * @param volunteerData - Volunteer information
   * @returns Promise<ApiResponse<any>> - Created volunteer data
   */
  async create(volunteerData: any): Promise<ApiResponse<any>> {
    return apiService.fetchApi<any>('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteerData),
    });
  },
};

/**
 * Participant API functions for managing participant data
 */
export const participantApi = {
  /**
   * Get all participants
   * @returns Promise<ApiResponse<any[]>> - List of participants
   */
  async getAll(): Promise<ApiResponse<any[]>> {
    return apiService.fetchApi<any[]>('/participants');
  },

  /**
   * Create a new participant
   * @param participantData - Participant information
   * @returns Promise<ApiResponse<any>> - Created participant data
   */
  async create(participantData: any): Promise<ApiResponse<any>> {
    return apiService.fetchApi<any>('/participants', {
      method: 'POST',
      body: JSON.stringify(participantData),
    });
  },
};

/**
 * Scan API functions for QR code scanning operations
 */
export const scanApi = {
  /**
   * Process a QR code scan
   * @param qrCode - QR code data to process
   * @param volunteerId - ID of the volunteer performing the scan
   * @returns Promise<ApiResponse<any>> - Scan result
   */
  async processScan(qrCode: string, volunteerId?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode, volunteerId }),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to process scan' };
    }
  },

  /**
   * Process attendance QR code scan
   * @param qrData - QR code data containing attendance information
   * @param volunteerId - ID of the volunteer performing the scan
   * @returns Promise<ApiResponse<any>> - Attendance scan result
   */
  async processAttendanceScan(qrData: string, volunteerId?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/scan/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData, volunteerId }),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to process attendance scan' };
    }
  },

  /**
   * Process gift QR code scan
   * @param qrData - QR code data containing gift information
   * @param volunteerId - ID of the volunteer performing the scan
   * @returns Promise<ApiResponse<any>> - Gift scan result
   */
  async processGiftScan(qrData: string, volunteerId?: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/scan/gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData, volunteerId }),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Failed to process gift scan' };
    }
  },

  /**
   * Get scanning statistics
   * @returns Promise<ApiResponse<any>> - Scan statistics
   */
  async getStats(): Promise<ApiResponse<any>> {
    return apiService.fetchApi<any>('/scan');
  },
};