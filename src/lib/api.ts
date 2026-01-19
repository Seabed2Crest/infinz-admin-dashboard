//api.ts
// API Configuration
// const API_BASE_URL = "https://backend.infinz.seabed2crest.com/api/v1";
export const API_BASE_URL = "http://localhost:8085/api/v1";
// ⭐ NEW: Testimonial Type
export interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  savedAmount: number;
  savedType: string;
  testimonial: string;
  category: "business" | "home" | "personal";
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialDictionaryTerm {
  _id?: string;
  title: string;
  slug?: string;
  category: string;
  description: string;
  example?: string;
  iconUrl: string;
  iconKey?: string;
  iconAlt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsPost {
  _id?: string;
  title: string;
  slug?: string;
  type: "news" | "press-release";
  summary: string;
  content: string;
  imageUrl: string;
  imageKey?: string;
  imageAlt?: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
// ⭐ UPDATED: UTM Link Type
}
 export interface UtmLink {
  _id?: string;

  // Sorting Priority
  priority: number;

  // Bank Info
  bankName: string;

  // Loan Details
  loanAmountMin: string;
  loanAmountMax: string;
  salary: string;
  ageMin: string;
  ageMax: string;

  // Pincode Logic
  pincodeType: "PAN INDIA" | "SHARED";
  pincodes: string[];

  // Extra Conditions
  conditions: Array<{ key: string; value: string }>;

  // UTM URL
  utmLink: string;

  // ⭐ Bank Branding
  logoImage?: string;     // S3 key only (not full URL)
  logoAlt?: string;       // SEO / Accessibility

  // System Fields
  createdAt?: string;
  updatedAt?: string;
}


export interface StatusUpdateResponse {
  _id: string;
  status: "pending" | "approved" | "rejected";
  [key: string]: any;
}

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

export interface Blog {
  metaImage: string;
  _id?: string;
  title: string;
  slug: string;
  thumbnail?: string;
  category?: string;
  // Optional custom URL defined by admin
  userDefinedUrl?: string;
  content: string;
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

export interface DownloadLog {
  _id: string;
  employeeId: string;
  employeeName: string;
  dataType: "lead" | "loanRequest";
  downloadedAt: string;
  count?: number;
  createdAt?: string;
  updatedAt?: string;
}

// export interface User {
//   _id?: string;
//   fullName: string;
//   email: string;
//   phoneNumber: string;
//   gender: string;
//   dateOfBirth: string;
//   pancardNumber: string;
//   isVerified: boolean;
//   pinCode: string;
//   maritalStatus: string;
//   role: "user" | "admin";
//   authProvider: "phone-number" | "google" | "apple";
//   authProviderId?: string;
//   platform?: string;
//   origin?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

export interface User {
  _id?: string;

  // Common fields
  mobileNumber?: string;
  platform?: string;
  source?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;

  // Business Loan Website fields
  businessType?: string;
  turnover?: string;
  loanAmount?: string;
  emiTenure?: string;

  // Personal Loan Website fields
  loanPurpose?: string;
  monthlyIncome?: string;
  loanAmountRequired?: string;

  // App fields
  userId?: string;
  employmentType?: string;
  netMonthlyIncome?: string;
  paymentMode?: string;
  companyOrBusinessName?: string;
  companyPinCode?: string;
  salarySlipDocument?: string;
  desiredAmount?: string;

  // Legacy fields (keep for backward compatibility)
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  pancardNumber?: string;
  isVerified?: boolean;
  pinCode?: string;
  maritalStatus?: string;
  role?: "user" | "admin";
  authProvider?: "phone-number" | "google" | "apple";
  authProviderId?: string;
  origin?: string;
}

// You can also create separate interfaces for better type safety
export interface BusinessLoanLead {
  _id: string;
  businessType: string;
  turnover: string;
  loanAmount: string;
  mobileNumber: string;
  emiTenure: string;
  platform: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PersonalLoanLead {
  _id: string;
  loanPurpose: string;
  monthlyIncome: string;
  loanAmountRequired: string;
  emiTenure: string;
  mobileNumber: string;
  platform: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AppLoanLead {
  _id: string;
  userId: string;
  employmentType: string;
  netMonthlyIncome: string;
  paymentMode: string;
  companyOrBusinessName: string;
  companyPinCode: string;
  salarySlipDocument: string;
  desiredAmount: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Union type for all lead types
// export type Lead = BusinessLoanLead | PersonalLoanLead | AppLoanLead;

// Type guard functions to check lead type
export function isBusinessLoanLead(lead: User): lead is BusinessLoanLead {
  return "businessType" in lead && lead.businessType !== undefined;
}

export function isPersonalLoanLead(lead: User): lead is PersonalLoanLead {
  return "loanPurpose" in lead && lead.loanPurpose !== undefined;
}

export function isAppLoanLead(lead: User): lead is AppLoanLead {
  return "employmentType" in lead && lead.employmentType !== undefined;
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

  // ⭐ NEW: Testimonials API
async getAllTestimonials(): Promise<ApiResponse<Testimonial[]>> {
  return this.request<Testimonial[]>("/testimonials");
}

async getTestimonialById(id: string): Promise<ApiResponse<Testimonial>> {
  return this.request<Testimonial>(`/testimonials/${id}`);
}

async createTestimonial(
  payload: Omit<Testimonial, "_id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<Testimonial>> {
  return this.request<Testimonial>("/testimonials", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async updateTestimonial(
  id: string,
  payload: Partial<Testimonial>
): Promise<ApiResponse<Testimonial>> {
  return this.request<Testimonial>(`/testimonials/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async deleteTestimonial(id: string): Promise<ApiResponse<{ message: string }>> {
  return this.request<{ message: string }>(`/testimonials/${id}`, {
    method: "DELETE",
  });
}

  async getAllFinancialTerms(): Promise<ApiResponse<FinancialDictionaryTerm[]>> {
    return this.request<FinancialDictionaryTerm[]>("/financial-dictionary");
  }

  async getFinancialTermById(
    id: string
  ): Promise<ApiResponse<FinancialDictionaryTerm>> {
    return this.request<FinancialDictionaryTerm>(`/financial-dictionary/${id}`);
  }

  async createFinancialTerm(
    payload: Omit<FinancialDictionaryTerm, "_id" | "slug" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<FinancialDictionaryTerm>> {
    return this.request<FinancialDictionaryTerm>("/financial-dictionary", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateFinancialTerm(
    id: string,
    payload: Partial<FinancialDictionaryTerm>
  ): Promise<ApiResponse<FinancialDictionaryTerm>> {
    return this.request<FinancialDictionaryTerm>(`/financial-dictionary/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteFinancialTerm(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/financial-dictionary/${id}`, {
      method: "DELETE",
    });
  }

  // ⭐ NEW: UTM Links API
  async getAllUtmLinks(): Promise<ApiResponse<UtmLink[]>> {
    return this.request<UtmLink[]>("/utm-links");
  }

  async getUtmLinkById(id: string): Promise<ApiResponse<UtmLink>> {
    return this.request<UtmLink>(`/utm-links/${id}`);
  }

  async createUtmLink(
    payload: Omit<UtmLink, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<UtmLink>> {
    return this.request<UtmLink>("/utm-links", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateUtmLink(
    id: string,
    payload: Partial<UtmLink>
  ): Promise<ApiResponse<UtmLink>> {
    return this.request<UtmLink>(`/utm-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteUtmLink(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/utm-links/${id}`, {
      method: "DELETE",
    });
  }

async updateLeadStatus(payload: { 
  loanId: string; 
  loanType: string; 
  status: string 
}): Promise<ApiResponse<StatusUpdateResponse>> {
  return this.request<StatusUpdateResponse>("/admin/update-lead-status", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async bulkUpdateLeadStatus(updates: Array<{ loanId: string; loanType: string; status: string }>): Promise<ApiResponse<any>> {
  return this.request<any>("/admin/bulk-update-status", {
    method: "PUT",
    body: JSON.stringify({ updates }),
  });
}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const adminToken = localStorage.getItem("adminToken");

    const config: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        ...options.headers,
      },
      credentials: "include",
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

  async exportFilteredLeads(params: Record<string, string>): Promise<Blob> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/admin/export-filtered-leads?${query}`;

    const adminToken = localStorage.getItem("adminToken");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${errorText}`);
    }

    return await response.blob();
  }

  // ✅ Get Last Downloaded Date
  async getLastDownload(): Promise<{ lastDownload: string | null }> {
    const url = `${this.baseURL}/admin/last-download`;

    const adminToken = localStorage.getItem("adminToken");

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch last download");
    }

    const data = await response.json();
    return { lastDownload: data?.lastDownload || null };
  }

  // Download Logs API
  async getDownloadLogs(params?: {
    page?: number;
    limit?: number;
    employeeName?: string;
    dataType?: "lead" | "loanRequest";
    startDate?: string;
    endDate?: string;
  }): Promise<
    ApiResponse<{ data: DownloadLog[]; total: number; pages: number }>
  > {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return this.request<{ data: DownloadLog[]; total: number; pages: number }>(
      `/admin/logs${query ? `?${query}` : ""}`
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

  async getAdminUsers(params?: Record<string, any>): Promise<
    ApiResponse<{
      users: User[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>
  > {
    const queryString = new URLSearchParams(params || {}).toString();
    return this.request<{
      users: User[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>(`/admin/leads?${queryString}`);
  }

  async getAdminLoans(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/admin/loans");
  }

  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/dashboard-stats");
  }

  // Admin Password Reset API
  async adminForgotPassword(email: string): Promise<ApiResponse<null>> {
    return this.request<null>("/admin/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async adminResetPassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ note: string }>> {
    return this.request<{ note: string }>("/admin/reset-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Employees & Permissions
  async getAllEmployees(): Promise<any[]> {
    const res = await this.request<any>("/admin/employees");
    return Array.isArray(res) ? res : res?.data ?? [];
  }

  // ✅ Fetch single employee details by ID
  async getEmployeeById(employeeId: string): Promise<any> {
    return this.request<any>(`/admin/employees/${employeeId}`);
  }

  async createEmployee(payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    permissions?: Record<string, string[]>;
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/create-employee", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // ✅ Update employee details
  async updateEmployee(
    employeeId: string,
    payload: {
      fullName: string;
      email: string;
      phoneNumber: string;
      permissions: Record<string, string[]>;
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async getAllBlogs(): Promise<ApiResponse<Blog[]>> {
    return this.request<Blog[]>("/blogs");
  }

  async getAllNews(
    params?: { search?: string; type?: "news" | "press-release" }
  ): Promise<ApiResponse<NewsPost[]>> {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== "") acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return this.request<NewsPost[]>(`/news${query ? `?${query}` : ""}`);
  }

  async getNewsById(id: string): Promise<ApiResponse<NewsPost>> {
    return this.request<NewsPost>(`/news/${id}`);
  }

  async createNews(
    payload: Omit<NewsPost, "_id" | "slug" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<NewsPost>> {
    return this.request<NewsPost>("/news", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateNews(
    id: string,
    payload: Partial<NewsPost>
  ): Promise<ApiResponse<NewsPost>> {
    return this.request<NewsPost>(`/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteNews(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/news/${id}`, {
      method: "DELETE",
    });
  }

  async getBlogById(id: string): Promise<ApiResponse<Blog>> {
    return this.request<Blog>(`/blogs/${id}`);
  }

  async getBlogBySlug(slug: string): Promise<ApiResponse<Blog>> {
    return this.request<Blog>(`/blogs/slug/${slug}`);
  }

  async createBlog(
    payload: Omit<Blog, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Blog>> {
    return this.request<Blog>("/blogs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateBlog(
    id: string,
    payload: Partial<Blog>
  ): Promise<ApiResponse<Blog>> {
    return this.request<Blog>(`/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteBlog(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/blogs/${id}`, {
      method: "DELETE",
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
  // NEW: Get all pincodes (initial page load or search)
  async getPincodes(search?: string): Promise<ApiResponse<string[]>> {
    const query = search ? `?search=${search}` : "";
    return this.request<string[]>(`/admin/pincodes${query}`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions
export const employmentApi = {
  get: () => apiClient.getEmploymentDetails(),
  update: (data: Partial<EmploymentDetails>) =>
    apiClient.updateEmploymentDetails(data),
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
  // NEW: Fetch all pincodes
  getPincodes: (search?: string) => apiClient.getPincodes(search),

  getDownloadLogs: (params?: {
    page?: number;
    limit?: number;
    employeeName?: string;
    dataType?: "lead" | "loanRequest";
    startDate?: string;
    endDate?: string;
  }) => apiClient.getDownloadLogs(params),
  exportFilteredLeads: (params: Record<string, string>) =>
    apiClient.exportFilteredLeads(params),

  getLastDownload: () => apiClient.getLastDownload(),
  login: (email: string, password: string) =>
    apiClient.adminLogin(email, password),
  getUsers: (params: Record<string, any>) => apiClient.getAdminUsers(params),

  getLoans: () => apiClient.getAdminLoans(),
  getDashboardStats: () => apiClient.getAdminDashboardStats(),
  forgotPassword: (email: string) => apiClient.adminForgotPassword(email),
  resetPassword: (oldPassword: string, newPassword: string) =>
    apiClient.adminResetPassword(oldPassword, newPassword),

  // Employees & Permissions
  getEmployees: () => apiClient.getAllEmployees(),
  getEmployeeById: (employeeId: string) =>
    apiClient.getEmployeeById(employeeId), // ✅ added
  createEmployee: (payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    permissions?: Record<string, string[]>;
  }) => apiClient.createEmployee(payload),
  updateEmployee: (
    employeeId: string,
    payload: {
      fullName: string;
      email: string;
      phoneNumber: string;
      permissions: Record<string, string[]>;
    }
  ) => apiClient.updateEmployee(employeeId, payload),
  getEmployeePermissions: (employeeId: string) =>
    apiClient.getEmployeePermissions(employeeId),
  updateEmployeePermissions: (payload: {
    id: string;
    permissions: Record<string, string[]>;
  }) => apiClient.updateEmployeePermissions(payload),

   updateLeadStatus: (payload: { loanId: string; loanType: string; status: string }) => 
    apiClient.updateLeadStatus(payload),

    bulkUpdateLeadStatus: (updates: {
    loanId: string;
    loanType: string;
    status: string;
  }[]) => apiClient.bulkUpdateLeadStatus(updates),
  
};

export const blogApi = {
  getAll: () => apiClient.getAllBlogs(),
  getById: (id: string) => apiClient.getBlogById(id),
  getBySlug: (slug: string) => apiClient.getBlogBySlug(slug),
  create: (payload: Omit<Blog, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.createBlog(payload),
  update: (id: string, data: Partial<Blog>) => apiClient.updateBlog(id, data),
  delete: (id: string) => apiClient.deleteBlog(id),
};

export const newsApi = {
  getAll: (params?: { search?: string; type?: "news" | "press-release" }) =>
    apiClient.getAllNews(params),
  getById: (id: string) => apiClient.getNewsById(id),
  create: (
    payload: Omit<NewsPost, "_id" | "slug" | "createdAt" | "updatedAt">
  ) => apiClient.createNews(payload),
  update: (id: string, data: Partial<NewsPost>) =>
    apiClient.updateNews(id, data),
  delete: (id: string) => apiClient.deleteNews(id),
};

type UploadType =
  | "blogs"
  | "testimonials"
  | "financial-dictionary"
  | "employee-salary-slip"
  | "news"
  | "news-press"
  | "news-and-press";

export const fileApi = {
  getPresigned: async (file: File, uploadType: UploadType = "blogs") => {
    const res = await fetch(`${API_BASE_URL}/presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [
          {
            fileName: file.name,
            fileType: file.type,
          },
        ],
        uploadType,
      }),
    });

    return res.json();
  },

  uploadToS3: async (url: string, file: File) => {
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  },
};


// ⭐ NEW: Testimonial API Exports
export const testimonialApi = {
  getAll: () => apiClient.getAllTestimonials(),
  getById: (id: string) => apiClient.getTestimonialById(id),
  create: (payload: Omit<Testimonial, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.createTestimonial(payload),
  update: (id: string, payload: Partial<Testimonial>) =>
    apiClient.updateTestimonial(id, payload),
  delete: (id: string) => apiClient.deleteTestimonial(id),
};

export const financialDictionaryApi = {
  getAll: () => apiClient.getAllFinancialTerms(),
  getById: (id: string) => apiClient.getFinancialTermById(id),
  create: (
    payload: Omit<FinancialDictionaryTerm, "_id" | "slug" | "createdAt" | "updatedAt">
  ) => apiClient.createFinancialTerm(payload),
  update: (id: string, payload: Partial<FinancialDictionaryTerm>) =>
    apiClient.updateFinancialTerm(id, payload),
  delete: (id: string) => apiClient.deleteFinancialTerm(id),
};

// ⭐ NEW: UTM Link API Exports
export const utmLinkApi = {
  getAll: () => apiClient.getAllUtmLinks(),
  getById: (id: string) => apiClient.getUtmLinkById(id),
  create: (payload: Omit<UtmLink, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.createUtmLink(payload),
  update: (id: string, payload: Partial<UtmLink>) =>
    apiClient.updateUtmLink(id, payload),
  delete: (id: string) => apiClient.deleteUtmLink(id),
};






