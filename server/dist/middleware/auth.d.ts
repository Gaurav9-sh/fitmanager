import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        email: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authorizeSelf: (paramName?: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map