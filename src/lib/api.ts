// API Configuration
const API_BASE_URL = "https://backend.infinz.seabed2crest.com/api/v1";
// const API_BASE_URL = "http://localhost:8085/api/v1";

// Types
export interface EmploymentDetails {
  _id?: string;
  userId: string;
  netMonthlyIncome: string;
  companyOrBusinessName?: string;
  companyPinCode?: string;
  salarySlipDocument?: string;
  paymentMode?: string;
  employmentType:
    | "salaried"
    | "self-employed"
    | "business-owner"
    | "unemployed"
    | "other";
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
  platformOrigin?: string;
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
  role: "user" | "admin";
  authProvider: "phone-number" | "google" | "apple";
  authProviderId?: string;
  platform?: string;
  origin?: string;
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
    const adminToken = localStorage.getItem("adminToken");

    const config: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        ...options.headers,
      },
      credentials: "include", // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Employment Details API
  async getEmploymentDetails(): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>("/employment-details/");
  }

  async updateEmploymentDetails(
    data: Partial<EmploymentDetails>
  ): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>("/employment-details/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin Employment Details API
  async getEmploymentDetailsForUser(
    userId: string
  ): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>(
      `/admin/employment-details/${userId}`
    );
  }

  async updateEmploymentDetailsForUser(
    userId: string,
    data: Partial<EmploymentDetails>
  ): Promise<ApiResponse<EmploymentDetails>> {
    return this.request<EmploymentDetails>(
      `/admin/employment-details/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // Business API
  async getAllBusinesses(): Promise<ApiResponse<Business[]>> {
    return this.request<Business[]>("/business/list");
  }

  async getBusinessById(id: string): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/business/details/${id}`);
  }

  async createBusiness(
    data: Omit<Business, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Business>> {
    return this.request<Business>("/business/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBusiness(
    id: string,
    data: Partial<Business>
  ): Promise<ApiResponse<Business>> {
    return this.request<Business>(`/business/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Leads API
  async getAllLeads(): Promise<ApiResponse<Lead[]>> {
    return this.request<Lead[]>("/leads/");
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`);
  }

  async createLead(
    data: Omit<
      Lead,
      "_id" | "status" | "applicationNumber" | "createdAt" | "updatedAt"
    >
  ): Promise<ApiResponse<Lead>> {
    return this.request<Lead>("/leads/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLead(
    id: string,
    data: Partial<Lead>
  ): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getLeadsByMobileNumber(
    mobileNumber: string
  ): Promise<ApiResponse<Lead[]>> {
    return this.request<Lead[]>(`/leads/mobile/${mobileNumber}`);
  }

  async getLeadByApplicationNumber(
    applicationNumber: string
  ): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/application/${applicationNumber}`);
  }

  // User API
  async getUserDetails(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/users/me");
  }

  async updateUser(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getUserHomePageData(): Promise<
    ApiResponse<{
      pendingLoanRequest: any[];
      completedLoanRequests: any[];
    }>
  > {
    return this.request<{
      pendingLoanRequest: any[];
      completedLoanRequests: any[];
    }>("/users/home");
  }

  async changePhoneNumberRequest(
    phoneNumber: string
  ): Promise<ApiResponse<null>> {
    return this.request<null>("/users/change-phone", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    });
  }

  async confirmChangePhoneNumber(
    phoneNumber: string,
    otp: string
  ): Promise<ApiResponse<{ phoneNumber: string }>> {
    return this.request<{ phoneNumber: string }>("/users/change-phone", {
      method: "PUT",
      body: JSON.stringify({ phoneNumber, otp }),
    });
  }

  // Admin API methods
  async adminLogin(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      token: string;
      accessLevel: string;
      permissions: Record<string, string[]>;
    }>
  > {
    return this.request<{
      token: string;
      accessLevel: string;
      permissions: Record<string, string[]>;
    }>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return this.request<{ users: User[] }>("/admin/leads");
  }

  async getAdminLoans(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/admin/loans");
  }

  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/dashboard-stats");
  }

  // Admin Password Reset API
  async adminForgotPassword(email: string): Promise<ApiResponse<null>> {
    const body = JSON.stringify({ email });
    console.log("Forgot password request body:", body);
    return this.request<null>("/admin/forgot-password", {
      method: "POST",
      body: body,
    });
  }

  async adminResetPassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ note: string }>> {
    const body = JSON.stringify({ oldPassword, newPassword });
    console.log("Reset password request body:", body);
    return this.request<{ note: string }>("/admin/reset-password", {
      method: "POST",
      body: body,
    });
  }

  // Employees & Permissions
  async getAllEmployees(): Promise<any[]> {
    const res = await this.request<any>("/admin/employees");
    return Array.isArray(res) ? res : res?.data ?? [];
  }

  async createEmployee(payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/create-employee", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getEmployeePermissions(
    employeeId: string
  ): Promise<ApiResponse<{ permissions: Record<string, string[]> }>> {
    return this.request<{ permissions: Record<string, string[]> }>(
      `/admin/employee/${employeeId}/permissions`
    );
  }

  async updateEmployeePermissions(payload: {
    id: string;
    permissions: Record<string, string[]>;
  }): Promise<ApiResponse<{ permissions: Record<string, string[]> }>> {
    return this.request<{ permissions: Record<string, string[]> }>(
      `/admin/update-employee-permissions/${payload.id}`,
      {
        method: "PUT",
        body: JSON.stringify({ permissions: payload.permissions }),
      }
    );
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions for convenience
export const employmentApi = {
  get: () => apiClient.getEmploymentDetails(),
  update: (data: Partial<EmploymentDetails>) =>
    apiClient.updateEmploymentDetails(data),
  // Admin functions
  getForUser: (userId: string) => apiClient.getEmploymentDetailsForUser(userId),
  updateForUser: (userId: string, data: Partial<EmploymentDetails>) =>
    apiClient.updateEmploymentDetailsForUser(userId, data),
};

export const businessApi = {
  getAll: () => apiClient.getAllBusinesses(),
  getById: (id: string) => apiClient.getBusinessById(id),
  create: (data: Omit<Business, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.createBusiness(data),
  update: (id: string, data: Partial<Business>) =>
    apiClient.updateBusiness(id, data),
};

export const leadsApi = {
  getAll: () => apiClient.getAllLeads(),
  getById: (id: string) => apiClient.getLeadById(id),
  create: (
    data: Omit<
      Lead,
      "_id" | "status" | "applicationNumber" | "createdAt" | "updatedAt"
    >
  ) => apiClient.createLead(data),
  update: (id: string, data: Partial<Lead>) => apiClient.updateLead(id, data),
  getByMobile: (mobileNumber: string) =>
    apiClient.getLeadsByMobileNumber(mobileNumber),
  getByApplicationNumber: (applicationNumber: string) =>
    apiClient.getLeadByApplicationNumber(applicationNumber),
};

export const userApi = {
  getDetails: () => apiClient.getUserDetails(),
  update: (data: Partial<User>) => apiClient.updateUser(data),
  getHomePageData: () => apiClient.getUserHomePageData(),
  changePhoneRequest: (phoneNumber: string) =>
    apiClient.changePhoneNumberRequest(phoneNumber),
  confirmPhoneChange: (phoneNumber: string, otp: string) =>
    apiClient.confirmChangePhoneNumber(phoneNumber, otp),
};

// Admin API
export const adminApi = {
  login: (email: string, password: string) =>
    apiClient.adminLogin(email, password),
  getUsers: () => apiClient.getAdminUsers(),
  getLoans: () => apiClient.getAdminLoans(),
  getDashboardStats: () => apiClient.getAdminDashboardStats(),
  forgotPassword: (email: string) => apiClient.adminForgotPassword(email),
  resetPassword: (oldPassword: string, newPassword: string) =>
    apiClient.adminResetPassword(oldPassword, newPassword),
  // Employees & Permissions
  getEmployees: () => apiClient.getAllEmployees(),
  createEmployee: (payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    permissions?: Record<string, string[]>;
  }) => apiClient.createEmployee(payload),
  getEmployeePermissions: (employeeId: string) =>
    apiClient.getEmployeePermissions(employeeId),
  updateEmployeePermissions: (payload: {
    id: string;
    permissions: Record<string, string[]>;
  }) => apiClient.updateEmployeePermissions(payload),
};
