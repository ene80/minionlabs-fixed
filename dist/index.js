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
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const AccountManager_1 = require("./classes/AccountManager");
const ProxyManager_1 = require("./classes/ProxyManager");
const WebSocketManager_1 = require("./classes/WebSocketManager");
class AirdropBot {
    constructor() {
        this.accountManager = new AccountManager_1.AccountManager();
        this.proxyManager = new ProxyManager_1.ProxyManager();
        this.webSocketManager = new WebSocketManager_1.WebSocketManager(this.accountManager, this.proxyManager);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayHeader();
            this.accountManager.loadAccounts();
            this.proxyManager.loadProxies();
            const useProxy = yield this.promptUseProxy();
            if (useProxy && this.proxyManager.proxies.length < this.accountManager.accounts.length) {
                console.error("Not enough proxies for the number of accounts. Please add more proxies.");
                process.exit(1);
            }
            this.webSocketManager.initialize(useProxy);
        });
    }
    displayHeader() {
        console.clear();
        console.log(chalk_1.default.blueBright(`▓█████ ██▓        ██▓███   █    ██   █████   █    ██   ██████     
▓█   ▀▓██▒       ▓██░  ██  ██  ▓██▒▒██▓  ██  ██  ▓██▒▒██    ▒     
▒███  ▒██░       ▓██░ ██▓▒▓██  ▒██░▒██▒  ██░▓██  ▒██░░ ▓██▄       
▒▓█  ▄▒██░       ▒██▄█▓▒ ▒▓▓█  ░██░░██  █▀ ░▓▓█  ░██░  ▒   ██▒    
░▒████░██████    ▒██▒ ░  ░▒▒█████▓ ░▒███▒█▄ ▒▒█████▓ ▒██████▒▒    
░░ ▒░ ░ ▒░▓      ▒▓▒░ ░  ░ ▒▓▒ ▒ ▒ ░░ ▒▒░ ▒  ▒▓▒ ▒ ▒ ▒ ▒▓▒ ▒ ░    
 ░ ░  ░ ░ ▒      ░▒ ░      ░▒░ ░ ░  ░ ▒░  ░  ░▒░ ░ ░ ░ ░▒  ░      
   ░    ░ ░      ░░         ░░ ░ ░    ░   ░   ░░ ░ ░ ░  ░  ░      
   ░      ░                  ░         ░       ░           ░      

`));
        console.log(chalk_1.default.blueBright("                   MinionLabs Autorun Bot                           "));
        console.log(chalk_1.default.blueBright("                    github.com/ahlulmukh                            "));
    }
    promptUseProxy() {
        return __awaiter(this, void 0, void 0, function* () {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            return new Promise((resolve) => {
                rl.question("Do you want to use a proxy? (y/n): ", (answer) => {
                    rl.close();
                    resolve(answer.toLowerCase() === "y");
                });
            });
        });
    }
}
const bot = new AirdropBot();
bot.initialize();
