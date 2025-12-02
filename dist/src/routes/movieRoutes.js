"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const movieController_1 = __importDefault(require("../controllers/movieController"));
router.get("/", movieController_1.default.getMovie);
router.get("/:id", movieController_1.default.getMovieById);
router.post("/", movieController_1.default.postMovie);
router.delete("/:id", movieController_1.default.deleteMovie);
router.put("/:id", movieController_1.default.putMovie);
exports.default = router;
//# sourceMappingURL=movieRoutes.js.map