export interface GoogleUser {
  provider: 'google';
  id: string;
  email: string;
  name: string;
  picture: string | null;
  accessToken: string;
  refreshToken: string | null;
}
