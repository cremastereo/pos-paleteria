export interface PosSession {
  id: string
  name: string
  username: string
}

export type LoginResult = { ok: true; user: PosSession } | { ok: false; message: string }

export interface AuthApi {
  login: (username: string, password: string) => Promise<LoginResult>
}
