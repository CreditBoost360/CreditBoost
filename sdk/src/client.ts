import axios, { AxiosInstance } from 'axios';
import { CreditBoostConfig, AuthResponse, UserProfile, NotificationSettings, ErrorResponse } from './types';

export class CreditBoostClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(config: CreditBoostConfig = {}) {
    const baseURL = config.baseURL || 'http://localhost:3000/api';
    
    this.client = axios.create({
      baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey })
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  private setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private handleError(error: any): never {
    const errorResponse: ErrorResponse = {
      error: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR'
    };

    if (error.response) {
      errorResponse.error = error.response.data.error || error.response.statusText;
      errorResponse.details = error.response.data.details;
      errorResponse.code = error.response.status.toString();
    } else if (error.request) {
      errorResponse.error = 'Network error';
      errorResponse.code = 'NETWORK_ERROR';
    }

    throw errorResponse;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', userData);
    this.setToken(response.data.token);
    return response.data;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<{ profile: UserProfile }>('/settings/profile');
    return response.data.profile;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put<{ profile: UserProfile }>('/settings/profile', profile);
    return response.data.profile;
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await this.client.get<{ notifications: NotificationSettings }>('/settings/notifications');
    return response.data.notifications;
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await this.client.put<{ notifications: NotificationSettings }>('/settings/notifications', settings);
    return response.data.notifications;
  }

  logout() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }
}