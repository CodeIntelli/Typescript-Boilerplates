import { Document } from "mongoose";

export default interface userModelInterface extends Document {
    name: string,
    email: string
    password: string,
    profile: {
        fileName: string,
        fileSize: string,
        public_id: string,
        url: string,
    },
    role: string,
    createdAt: Date,
    mobileNumber: number,
    resetPasswordToken: any,
    resetPasswordExpire: any,
    verified: any,
    status: string,
    userLocation: string,
    reminder: Boolean,
    twostep: Boolean,
    comparePassword(candidatePassword: string): Promise<boolean>,
    getJWTToken: any,
    getResetPasswordToken: any

}