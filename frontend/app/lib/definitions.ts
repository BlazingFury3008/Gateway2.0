export interface UserObject {
  uuid: string;
  username: string;
  email: string;
  image_url: string;
  discord_id: string;
  google_id: string;
}

export type AuthState = "checking" | "guest" | "authed";
