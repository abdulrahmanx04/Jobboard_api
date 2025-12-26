
export interface UserPayLoad {
    id: string,
    name: string
    role: string
}
export interface AuthRequest {
    user?: UserPayLoad
}

