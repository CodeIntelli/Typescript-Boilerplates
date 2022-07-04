import { Document } from "mongoose";

export default interface userModelInterface extends Document {
    name: string,
    email: string
    password: string,
    profile: {
        public_id: string,
        url: string,
    },
    role: string,
    createdAt: Date,
    resetPasswordToken: any,
    resetPasswordExpire: any,
    verified: any,
    status: string,
    userLocation: string,
    comparePassword(candidatePassword: string): Promise<boolean>,
    getJWTToken: any,
    getResetPasswordToken: any

} 