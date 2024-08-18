export type User = {
  id: number
  username: string
  name: string
  email: string
  location: string
}
export interface App {
  user: () => Promise<User>
}
