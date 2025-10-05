import jwt from "jsonwebtoken";
export declare const jwtAuthen: {
    (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
    unless: typeof import("express-unless").unless;
};
export declare function generateToken(payload: any): string;
export declare function verifyToken(token: string): {
    valid: boolean;
    decoded: string | jwt.JwtPayload;
    error?: never;
} | {
    valid: boolean;
    error: string;
    decoded?: never;
};
//# sourceMappingURL=jwtAuth.d.ts.map