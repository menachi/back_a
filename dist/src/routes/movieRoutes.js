"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const movieController_1 = __importDefault(require("../controllers/movieController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
router.get("/", movieController_1.default.get.bind(movieController_1.default));
router.get("/:id", movieController_1.default.getById.bind(movieController_1.default));
router.post("/", authMiddleware_1.default, movieController_1.default.post.bind(movieController_1.default));
router.delete("/:id", authMiddleware_1.default, movieController_1.default.del.bind(movieController_1.default));
router.put("/:id", authMiddleware_1.default, movieController_1.default.put.bind(movieController_1.default));
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map