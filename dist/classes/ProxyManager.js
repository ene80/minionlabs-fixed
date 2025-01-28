"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyManager = void 0;
const fs_1 = __importDefault(require("fs"));
class ProxyManager {
    constructor() {
        this.proxies = [];
    }
    loadProxies() {
        if (!fs_1.default.existsSync("proxy.txt")) {
            console.error("proxy.txt not found. Please add the file with proxy data.");
            process.exit(1);
        }
        try {
            const data = fs_1.default.readFileSync("proxy.txt", "utf8");
            this.proxies = data
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line);
        }
        catch (err) {
            console.error("Failed to load proxies:", err);
        }
    }
    normalizeProxyUrl(proxy) {
        if (!proxy.startsWith("http://") && !proxy.startsWith("https://")) {
            proxy = "http://" + proxy;
        }
        return proxy;
    }
}
exports.ProxyManager = ProxyManager;
