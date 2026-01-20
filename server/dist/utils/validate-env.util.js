"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const env_config_1 = require("../config/env.config");
function validateEnv() {
    if (!env_config_1.env.PORT) {
        throw new Error("PORT is not found in the env");
    }
}
