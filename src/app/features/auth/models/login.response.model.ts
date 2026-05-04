import { User } from "./profile.response.model";

export interface LoginResponse {
  token: string;
  profile: User ;
}