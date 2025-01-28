"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const https_proxy_agent_1 = require("https-proxy-agent");
const ws_1 = __importDefault(require("ws"));
class WebSocketManager {
    constructor(accountManager, proxyManager) {
        this.accountManager = accountManager;
        this.proxyManager = proxyManager;
        this.sockets = [];
        this.lastUpdateds = [];
        this.emails = [];
        this.messages = [];
        this.userIds = [];
        this.browserIds = [];
        this.accessTokens = [];
    }
    initialize(useProxy) {
        for (let i = 0; i < this.accountManager.accounts.length; i++) {
            this.sockets[i] = [];
            this.lastUpdateds[i] = [];
            this.messages[i] = [];
            this.browserIds[i] = [];
            for (let j = 0; j < this.proxyManager.proxies.length; j++) {
                this.getUserId(i, j, useProxy);
            }
        }
    }
    generateBrowserId() {
        const characters = 'abcdef0123456789';
        let browserId = '';
        for (let i = 0; i < 32; i++) {
            browserId += characters[Math.floor(Math.random() * characters.length)];
        }
        return browserId;
    }
    getUserId(accountIndex, proxyIndex, useProxy) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginUrl = "https://api.allstream.ai/web/v1/auth/emailLogin";
            const proxy = this.proxyManager.proxies[proxyIndex];
            const agent = useProxy && proxy
                ? new https_proxy_agent_1.HttpsProxyAgent(this.proxyManager.normalizeProxyUrl(proxy))
                : undefined;
            try {
                const response = yield axios_1.default.post(loginUrl, {
                    email: this.accountManager.accounts[accountIndex].email,
                    password: this.accountManager.accounts[accountIndex].password,
                }, {
                    httpsAgent: agent,
                    headers: {
                        Authorization: `Bearer ${this.accessTokens[accountIndex]}`,
                        "Content-Type": "application/json",
                    },
                });
                const { data } = response.data;
                this.emails[accountIndex] = data.user.email;
                this.userIds[accountIndex] = data.user.uuid;
                this.accessTokens[accountIndex] = data.token;
                this.browserIds[accountIndex][proxyIndex] = this.generateBrowserId();
                this.messages[accountIndex][proxyIndex] = "Connected successfully";
                console.log(`Account ${accountIndex + 1} connected successfully with proxy ${proxyIndex + 1}`);
                yield this.connectWebSocket(accountIndex, proxyIndex, useProxy);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}:`, error.message);
                }
                else {
                    console.error("An unknown error occurred:", error);
                }
            }
        });
    }
    connectWebSocket(accountIndex, proxyIndex, useProxy) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sockets[accountIndex][proxyIndex])
                return;
            const url = "wss://gw0.streamapp365.com/connect";
            const proxy = this.proxyManager.proxies[proxyIndex];
            const agent = useProxy && proxy
                ? new https_proxy_agent_1.HttpsProxyAgent(this.proxyManager.normalizeProxyUrl(proxy))
                : undefined;
            const wsOptions = agent ? { agent } : {};
            this.sockets[accountIndex][proxyIndex] = new ws_1.default(url, wsOptions);
            this.sockets[accountIndex][proxyIndex].onopen = () => __awaiter(this, void 0, void 0, function* () {
                this.lastUpdateds[accountIndex][proxyIndex] = new Date().toISOString();
                console.log(`Account ${accountIndex + 1} Connected with proxy ${proxyIndex + 1}`, this.lastUpdateds[accountIndex][proxyIndex]);
                this.sendRegisterMessage(accountIndex, proxyIndex);
                this.startPinging(accountIndex, proxyIndex, useProxy);
            });
            this.sockets[accountIndex][proxyIndex].onmessage = (event) => __awaiter(this, void 0, void 0, function* () {
                let rawData = event.data.toString();
                if (rawData.startsWith("{") && rawData.endsWith("}")) {
                    try {
                        const message = JSON.parse(rawData);
                        yield this.handleMessage(accountIndex, proxyIndex, message);
                    }
                    catch (error) {
                        console.error(`Error parsing JSON:`, error);
                    }
                }
            });
            this.sockets[accountIndex][proxyIndex].onclose = () => {
                console.log(`Account ${accountIndex + 1} Disconnected with proxy ${proxyIndex + 1}`);
                this.reconnectWebSocket(accountIndex, proxyIndex, useProxy);
            };
            this.sockets[accountIndex][proxyIndex].onerror = (error) => {
                console.error(`WebSocket error for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}:`, error);
            };
        });
    }
    reconnectWebSocket(accountIndex, proxyIndex, useProxy) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "wss://gw0.streamapp365.com/connect";
            const proxy = this.proxyManager.proxies[proxyIndex];
            const agent = useProxy && proxy
                ? new https_proxy_agent_1.HttpsProxyAgent(this.proxyManager.normalizeProxyUrl(proxy))
                : undefined;
            if (this.sockets[accountIndex][proxyIndex]) {
                this.sockets[accountIndex][proxyIndex].removeAllListeners();
            }
            const wsOptions = agent ? { agent } : {};
            this.sockets[accountIndex][proxyIndex] = new ws_1.default(url, wsOptions);
            this.sockets[accountIndex][proxyIndex].onopen = () => __awaiter(this, void 0, void 0, function* () {
                this.lastUpdateds[accountIndex][proxyIndex] = new Date().toISOString();
                console.log(`Account ${accountIndex + 1} Reconnected with proxy ${proxyIndex + 1}`, this.lastUpdateds[accountIndex][proxyIndex]);
                this.sendRegisterMessage(accountIndex, proxyIndex);
                this.startPinging(accountIndex, proxyIndex, useProxy);
            });
            this.sockets[accountIndex][proxyIndex].onclose = () => {
                console.log(`Account ${accountIndex + 1} Disconnected again with proxy ${proxyIndex + 1}`);
                setTimeout(() => {
                    this.reconnectWebSocket(accountIndex, proxyIndex, useProxy);
                }, 5000);
            };
            this.sockets[accountIndex][proxyIndex].onerror = (error) => {
                console.error(`WebSocket error for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}:`, error);
            };
        });
    }
    sendRegisterMessage(accountIndex, proxyIndex) {
        if (this.sockets[accountIndex][proxyIndex] && this.sockets[accountIndex][proxyIndex].readyState === ws_1.default.OPEN) {
            const message = {
                type: "register",
                user: this.userIds[accountIndex],
                dev: this.browserIds[accountIndex][proxyIndex],
            };
            this.sockets[accountIndex][proxyIndex].send(JSON.stringify(message));
            console.log(chalk_1.default.green(`Successfully registered browser for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}, ID: ${this.browserIds[accountIndex][proxyIndex]}, continuing to ping socket...\n`));
        }
        else {
            console.error(`WebSocket not open for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}. Unable to send message.`);
        }
    }
    handleMessage(accountIndex, proxyIndex, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.type === "request") {
                const { taskid, data } = message;
                const { method, url, headers, body, timeout } = data;
                try {
                    const response = yield fetch(url, {
                        method,
                        headers,
                        body: method === "POST" ? body : undefined,
                        signal: AbortSignal.timeout(timeout),
                    });
                    this.sockets[accountIndex][proxyIndex].send(JSON.stringify({
                        type: "response",
                        taskid,
                        result: {
                            parsed: "",
                            html: "JTdCJTIyY291bnRyeSUyMiUzQSUyMklEJTIyJTJDJTIyYXNuJTIyJTNBJTdCJTIyYXNudW0lMjIlM0E5MzQxJTJDJTIyb3JnX25hbWUlMjIlM0ElMjJQVCUyMElORE9ORVNJQSUyMENPTU5FVFMlMjBQTFVTJTIyJTdEJTJDJTIyZ2VvJTIyJTNBJTdCJTIyY2l0eSUyMiUzQSUyMiUyMiUyQyUyMnJlZ2lvbiUyMiUzQSUyMiUyMiUyQyUyMnJlZ2lvbl9uYW1lJTIyJTNBJTIyJTIyJTJDJTIycG9zdGFsX2NvZGUlMjIlM0ElMjIlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQS02LjE3NSUyQyUyMmxvbmdpdHVkZSUyMiUzQTEwNi44Mjg2JTJDJTIydHolMjIlM0ElMjJBc2lhJTJGSmFrYXJ0YSUyMiU3RCU3RA==",
                            rawStatus: response.status,
                        },
                    }));
                }
                catch (error) {
                    this.sockets[accountIndex][proxyIndex].send(JSON.stringify({
                        type: "error",
                        taskid,
                        error: error.message,
                        errorCode: 50000001,
                        rawStatus: 500,
                    }));
                }
            }
            else {
                console.log(`Account ${accountIndex + 1} with proxy ${proxyIndex + 1} - Unhandled message type:`, message.type);
            }
        });
    }
    startPinging(accountIndex, proxyIndex, useProxy) {
        const pingServer = () => __awaiter(this, void 0, void 0, function* () {
            if (this.sockets[accountIndex][proxyIndex] && this.sockets[accountIndex][proxyIndex].readyState === ws_1.default.OPEN) {
                const proxy = this.proxyManager.proxies[proxyIndex];
                const agent = useProxy && proxy
                    ? new https_proxy_agent_1.HttpsProxyAgent(this.proxyManager.normalizeProxyUrl(proxy))
                    : undefined;
                this.sockets[accountIndex][proxyIndex].send(JSON.stringify({ type: "ping" }));
                yield this.getPoint(accountIndex, proxyIndex, useProxy);
            }
            setTimeout(pingServer, 60000);
        });
        pingServer();
    }
    getPoint(accountIndex, proxyIndex, useProxy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const pointUrl = `https://api.allstream.ai/web/v1/dashBoard/info`;
            const proxy = this.proxyManager.proxies[proxyIndex];
            const agent = useProxy && proxy
                ? new https_proxy_agent_1.HttpsProxyAgent(this.proxyManager.normalizeProxyUrl(proxy))
                : undefined;
            try {
                const response = yield axios_1.default.get(pointUrl, {
                    httpsAgent: agent,
                    headers: {
                        Authorization: `Bearer ${this.accessTokens[accountIndex]}`,
                        "Content-Type": "application/json",
                    },
                });
                const { data } = response.data;
                this.messages[accountIndex][proxyIndex] = `Successfully retrieved data: Total Points = ${(_a = data.totalScore) !== null && _a !== void 0 ? _a : 0}, Today Points = ${(_b = data.todayScore) !== null && _b !== void 0 ? _b : 0}`;
                console.log(chalk_1.default.green(`Account ${accountIndex + 1} with proxy ${proxyIndex + 1} - Successfully PING the Server:\n`) +
                    this.messages[accountIndex][proxyIndex]);
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Error for Account ${accountIndex + 1} with proxy ${proxyIndex + 1}:`, error.message);
                }
                else {
                    console.error("An unknown error occurred:", error);
                }
            }
        });
    }
}
exports.WebSocketManager = WebSocketManager;
