// helpers/generateResetToken.ts
import crypto from "crypto";

export function generateResetToken() {
    const rawToken = crypto.randomBytes(32).toString("hex"); // 64 hex chars ~ 256 bits token...
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    return { rawToken, tokenHash };
}
