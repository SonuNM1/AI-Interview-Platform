import bcrypt from "bcrypt"

export class AuthService {
    async hashPassword(password: string) {
        return bcrypt.hash(password, 10) ; // converts plain password into a secure hash
    }

    async comparePassword(password: string, hash: string) {
        return bcrypt.compare(password, hash) ; // checks whether the entered password matches the stored hash 
    }
}

export const authService = new AuthService() ; 