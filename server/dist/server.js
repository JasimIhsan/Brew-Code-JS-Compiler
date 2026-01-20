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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const env_config_1 = require("./config/env.config");
const execute_service_1 = require("./services/execute.service");
const validate_env_util_1 = require("./utils/validate-env.util");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_config_1.env.PORT || 4000;
(0, validate_env_util_1.validateEnv)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const executorService = new execute_service_1.ExecutorService();
app.get("/", (req, res) => {
    res.send("Hello, TypeScript Backend!");
});
app.post("/run", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    if (!code) {
        res.status(400).json({ error: "Code is required" });
        return;
    }
    const result = yield executorService.execute(code);
    res.json(result);
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
