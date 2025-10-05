import { RowDataPacket } from "mysql2";
export interface User extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    phone: string;
    role_id: number;
}
//# sourceMappingURL=user.d.ts.map