import { get, post } from '@/lib/api/client';
import { AuthResponse, LoginResponse, UserResponse } from '@/lib/api/types';
import { clearAccessToken, setAccessToken } from '@/lib/auth/token-storage';

export const auth = {
  login(email: string, password: string): Promise<LoginResponse> {
    return post<LoginResponse>('/auth/login', { email, password }, { auth: false }).then((response) => {
      setAccessToken(response.access_token);
      return response;
    });
  },

  me(): Promise<AuthResponse<UserResponse>> {
    return get<AuthResponse<UserResponse>>('/auth/me');
  },

  logout(): Promise<AuthResponse<null>> {
    return post<AuthResponse<null>>('/auth/logout').finally(() => {
      clearAccessToken();
    });
  },
};
