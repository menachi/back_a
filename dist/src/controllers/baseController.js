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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(dataModel) {
        this.model = dataModel;
    }
    get(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = req.query;
            try {
                if (filter) {
                    const data = yield this.model.find(filter);
                    res.json(data);
                }
                else {
                    const data = yield this.model.find();
                    res.json(data);
                }
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
    ;
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const data = yield this.model.findById(id);
                if (!data) {
                    return res.status(404).json({ error: "Data not found" });
                }
                else {
                    res.json(data);
                }
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
    ;
    post(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = req.body;
            try {
                const response = yield this.model.create(obj);
                res.status(201).json(response);
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
    ;
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const response = yield this.model.findByIdAndDelete(id);
                res.send(response);
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
    ;
    put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const obj = req.body;
            try {
                const response = yield this.model.findByIdAndUpdate(id, obj, { new: true });
                res.json(response);
            }
            catch (error) {
                res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
            }
        });
    }
    ;
}
;
exports.default = BaseController;
//# sourceMappingURL=baseController.js.map