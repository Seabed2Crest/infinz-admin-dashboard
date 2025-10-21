// API Configuration
const API_BASE_URL = 'http://localhost:8085/api/v1';

// Types
export interface EmploymentDetails {
  _id?: string;
  userId: string;
  netMonthlyIncome: string;
  companyOrBusinessName?: string;
  companyPinCode?: string;
  salarySlipDocument?: string;
  paymentMode?: string;
  employmentType: 'salaried' | 'self-employed' | 'business-owner' | 'unemployed' | 'other';
  createdAt?: string;
  updatedAt?: string;
}

export interface Business {
  _id?: string;
  businessType: string;
  turnover: string;
  loanAmount: string;
  mobileNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  _id?: string;
  name: string;
  city: string;
  pincode: string;
  loanType: string;
  amount: string;
  tenure: string;
  mobileNumber: string;
  status: string;
  applicationNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  pancardNumber: string;
  isVerified: boolean;
  pinCode: string;
  maritalStatus: string;
  role: 'user' | 'admin';
  authProvider: 'phone-number' | 'google' | 'apple';
  authProviderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get admin token from localStorage
    const adminToken = localStorage.getItem('adminToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Employment Details API
  async getEmploymentDetails(): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>('/employment-details/');
  }

  async updateEmploymentDetails(data: Partial<EmploymentDetails>): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>('/employment-details/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin Employment Details API
  async getEmploymentDetailsForUser(userId: string): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>(`/admin/employment-details/${userId}`);
  }

  async updateEmploymentDetailsForUser(userId: string, data: Partial<EmploymentDetails>): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>(`/admin/employment-details/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Business API
  async getAllBusinesses(): Promise<ApiResponse<Business[]>> {
    return this.request<Business[]>('/business/list');
  }

  async getBusinessById(id: string): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/business/details/${id}`);
  }

  async createBusiness(data: Omit<Business, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Business>> {
    return this.request<Business>('/business/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/business/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Leads API
  async getAllLeads(): Promise<ApiResponse<Lead[]>> {
    return this.request<Lead[]>('/leads/');
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`);
  }

  async createLead(data: Omit<Lead, '_id' | 'status' | 'applicationNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>('/leads/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLeadsByMobileNumber(mobileNumber: string): Promise<ApiResponse<Lead[]>> {
    return this.request<Lead[]>(`/leads/mobile/${mobileNumber}`);
  }

  async getLeadByApplicationNumber(applicationNumber: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/application/${applicationNumber}`);
  }

  // User API
  async getUserDetails(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/me');
  }

  async updateUser(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserHomePageData(): Promise<ApiResponse<{
    pendingLoanRequest: any[];
    completedLoanRequests: any[];
  }>> {
    return this.request<{
      pendingLoanRequest: any[];
      completedLoanRequests: any[];
    }>('/users/home');
  }

  async changePhoneNumberRequest(phoneNumber: string): Promise<ApiResponse<null>> {
    return this.request<null>('/users/change-phone', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async confirmChangePhoneNumber(phoneNumber: string, otp: string): Promise<ApiResponse<{ phoneNumber: string }>> {
    return this.request<{ phoneNumber: string }>('/users/change-phone', {
      method: 'PUT',
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  // Admin API methods
  async adminLogin(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.request<{ users: User[] }>('/admin/users');
  }

  async getAdminLoans(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/admin/loans');
  }

  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/dashboard-stats');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions for convenience
export const employmentApi = {
  get: () => apiClient.getEmploymentDetails(),
  update: (data: Partial<EmploymentDetails>) => apiClient.updateEmploymentDetails(data),
  // Admin functions
  getForUser: (userId: string) => apiClient.getEmploymentDetailsForUser(userId),
  updateForUser: (userId: string, data: Partial<EmploymentDetails>) => apiClient.updateEmploymentDetailsForUser(userId, data),
};

export const businessApi = {
  getAll: () => apiClient.getAllBusinesses(),
  getById: (id: string) => apiClient.getBusinessById(id),
  create: (data: Omit<Business, '_id' | 'createdAt' | 'updatedAt'>) => apiClient.createBusiness(data),
  update: (id: string, data: Partial<Business>) => apiClient.updateBusiness(id, data),
};

export const leadsApi = {
  getAll: () => apiClient.getAllLeads(),
  getById: (id: string) => apiClient.getLeadById(id),
  create: (data: Omit<Lead, '_id' | 'status' | 'applicationNumber' | 'createdAt' | 'updatedAt'>) => apiClient.createLead(data),
  update: (id: string, data: Partial<Lead>) => apiClient.updateLead(id, data),
  getByMobile: (mobileNumber: string) => apiClient.getLeadsByMobileNumber(mobileNumber),
  getByApplicationNumber: (applicationNumber: string) => apiClient.getLeadByApplicationNumber(applicationNumber),
};

export const userApi = {
  getDetails: () => apiClient.getUserDetails(),
  update: (data: Partial<User>) => apiClient.updateUser(data),
  getHomePageData: () => apiClient.getUserHomePageData(),
  changePhoneRequest: (phoneNumber: string) => apiClient.changePhoneNumberRequest(phoneNumber),
  confirmPhoneChange: (phoneNumber: string, otp: string) => apiClient.confirmChangePhoneNumber(phoneNumber, otp),
};

// Admin API
export const adminApi = {
  login: (email: string, password: string) => apiClient.adminLogin(email, password),
  getUsers: () => apiClient.getAdminUsers(),
  getLoans: () => apiClient.getAdminLoans(),
  getDashboardStats: () => apiClient.getAdminDashboardStats(),
};
