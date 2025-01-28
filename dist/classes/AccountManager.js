"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;
const fs_1 = __importDefault(require("fs"));
class AccountManager {
    constructor() {
        this.accounts = [];
    }
    loadAccounts() {
        if (!fs_1.default.existsSync("accounts.txt")) {
            console.error("accounts.txt not found. Please add the file with token data.");
            process.exit(1);
        }
        try {
            const data = fs_1.default.readFileSync("accounts.txt", "utf8");
            this.accounts = data
                .split("\n")
                .map((line) => {
                const [email, password] = line.split(":");
                if (email && password) {
                    return { email: email.trim(), password: password.trim() };
                }
                return null;
            })
                .filter((account) => account !== null);
        }
        catch (err) {
            console.error("Failed to load accounts:", err);
        }
    }
}
exports.AccountManager = AccountManager;
