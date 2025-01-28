"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    static logMessage(accountNum = null, total = null, message = "", messageType = "info") {
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
        const accountStatus = accountNum && total ? `${accountNum}/${total}` : "";
        const colors = {
            info: chalk_1.default.white,
            success: chalk_1.default.green,
            error: chalk_1.default.red,
            warning: chalk_1.default.yellow,
            process: chalk_1.default.cyan,
            debug: chalk_1.default.magenta,
        };
        const logColor = colors[messageType] || chalk_1.default.white;
        console.log(`${chalk_1.default.white("[")}${chalk_1.default.dim(timestamp)}${chalk_1.default.white("]")} ` +
            `${chalk_1.default.white("[")}${chalk_1.default.yellow(accountStatus)}${chalk_1.default.white("]")} ` +
            `${logColor(message)}`);
    }
}
exports.Logger = Logger;
