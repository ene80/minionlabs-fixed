"use strict";
const chalk = require("chalk");
const readline = require("readline");
const { AccountManager } = require("./classes/AccountManager");
const { ProxyManager } = require("./classes/ProxyManager");
const { WebSocketManager } = require("./classes/WebSocketManager");

class AirdropBot {
    constructor() {
        this.accountManager = new AccountManager();
        this.proxyManager = new ProxyManager();
        this.webSocketManager = new WebSocketManager(this.accountManager, this.proxyManager);
        this.MAX_NODES = 100; // Numero massimo di connessioni
    }

    async initialize() {
        try {
            this.displayHeader();
            console.log("[Debug] Starting account and proxy loading...");

            // Caricamento degli account e dei proxy
            await this.accountManager.loadAccounts();
            console.log("[Debug] Accounts loaded successfully.");

            await this.proxyManager.loadProxies();
            console.log("[Debug] Proxies loaded successfully.");

            const useProxy = await this.promptUseProxy();
            console.log(`[Debug] User chose to ${useProxy ? "use" : "not use"} proxies.`);

            if (useProxy && this.proxyManager.proxies.length < this.accountManager.accounts.length) {
                console.error("\n[Error] Not enough proxies for the number of accounts. Please add more proxies.");
                return;
            }

            console.log("[Debug] Initializing WebSocketManager...");

            // Monitoraggio memoria prima dell'inizializzazione
            this.logMemoryUsage("Before WebSocketManager initialization");

            await this.webSocketManager.initialize(useProxy, this.MAX_NODES);

            // Monitoraggio memoria dopo l'inizializzazione
            this.logMemoryUsage("After WebSocketManager initialization");

            console.log("[Debug] WebSocketManager initialized successfully.");

            // Mantieni il processo vivo con un'operazione attiva
            this.keepAlive();
        } catch (error) {
            console.error("\n[Critical Error]", error.message);
        }
    }

    logMemoryUsage(stage) {
        const memoryUsage = process.memoryUsage();
        console.log(`[Memory Debug - ${stage}] RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB, Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB, Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    }

    keepAlive() {
        console.log("[Debug] Keeping the process alive...");
        setInterval(() => {
            console.log("[Debug] Process is still running...");
        }, 60000); // Log ogni 60 secondi
    }

    displayHeader() {
        console.clear();
        const header = `
▓█████ ██▓        ██▓███   █    ██   █████   █    ██   ██████     
▓█   ▀▓██▒       ▓██░  ██  ██  ▓██▒▒██▓  ██  ██  ▓██▒▒██    ▒     
▒███  ▒██░       ▓██░ ██▓▒▓██  ▒██░▒██▒  ██░▓██  ▒██░░ ▓██▄       
▒▓█  ▄▒██░       ▒██▄█▓▒ ▒▓▓█  ░██░░██  █▀ ░▓▓█  ░██░  ▒   ██▒    
░▒████░██████    ▒██▒ ░  ░▒▒█████▓ ░▒███▒█▄ ▒▒█████▓ ▒██████▒▒    
░░ ▒░ ░ ▒░▓      ▒▓▒░ ░  ░ ▒▓▒ ▒ ▒ ░░ ▒▒░ ▒  ▒▓▒ ▒ ▒ ▒ ▒▓▒ ▒ ░    
 ░ ░  ░ ░ ▒      ░▒ ░      ░▒░ ░ ░  ░ ▒░  ░  ░▒░ ░ ░ ░ ░▒  ░      
   ░    ░ ░      ░░         ░░ ░ ░    ░   ░   ░░ ░ ░ ░  ░  ░      
   ░      ░                  ░         ░       ░           ░      

                   MinionLabs Autorun Bot                           
                    github.com/ahlulmukh                            
        `;
        console.log(chalk.blueBright(header));
    }

    promptUseProxy() {
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const askQuestion = () => {
                rl.question("\nDo you want to use a proxy? (y/n): ", (answer) => {
                    const normalized = answer.trim().toLowerCase();
                    if (normalized === "y" || normalized === "n") {
                        rl.close();
                        resolve(normalized === "y");
                    } else {
                        console.log("\n[Invalid Input] Please type 'y' or 'n'.");
                        askQuestion();
                    }
                });
            };

            askQuestion();
        });
    }
}

const bot = new AirdropBot();
bot.initialize();