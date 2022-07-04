import { Document } from "mongoose";

export default interface userModelInterface extends Document {
    name: string,
    email: string
    password: string,
    avatar: {
        public_id: string,
        url: string,
    },
    role: string,
    createdAt: Date,
    resetPasswordToken: any,
    resetPasswordExpire: any,
    verified: any,
    comparePassword(candidatePassword: string): Promise<boolean>,
    getJWTToken: any,
    getResetPasswordToken: any

} 