import crypto from "crypto";

const generateInviteCode = (length = 8): string => {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
};

export default generateInviteCode;
