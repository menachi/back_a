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
const commentModel_1 = __importDefault(require("../model/commentModel"));
const baseController_1 = __importDefault(require("./baseController"));
class CommentController extends baseController_1.default {
    constructor() {
        super(commentModel_1.default);
    }
    post(req, res) {
        const _super = Object.create(null, {
            post: { get: () => super.post }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            req.body.writerId = userId;
            return _super.post.call(this, req, res);
        });
    }
    put(req, res) {
        const _super = Object.create(null, {
            put: { get: () => super.put }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const comment = yield commentModel_1.default.findById(req.params.id);
            if ((comment === null || comment === void 0 ? void 0 : comment.writerId.toString()) !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return _super.put.call(this, req, res);
        });
    }
    del(req, res) {
        const _super = Object.create(null, {
            del: { get: () => super.del }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const comment = yield commentModel_1.default.findById(req.params.id);
            if ((comment === null || comment === void 0 ? void 0 : comment.writerId.toString()) !== userId) {
                res.status(403).json({ error: "Forbidden" });
                return;
            }
            return _super.del.call(this, req, res);
        });
    }
}
exports.default = new CommentController();
//# sourceMappingURL=commentController.js.map