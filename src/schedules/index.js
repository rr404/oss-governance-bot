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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var github_1 = require("../github");
var constants_1 = require("../constants");
var core = require("@actions/core");
var github = require("@actions/github");
var ACTION_STALE = 'stale';
var ACTION_CLOSE = 'close';
function autoStaleAndClose(config) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var client;
        var _this = this;
        return __generator(this, function (_e) {
            core.info('Starting autoStaleAndClose');
            client = github_1.initClient();
            if (((_b = (_a = config.issue) === null || _a === void 0 ? void 0 : _a.automations) === null || _b === void 0 ? void 0 : _b.autoStale) || ((_d = (_c = config.issue) === null || _c === void 0 ? void 0 : _c.automations) === null || _d === void 0 ? void 0 : _d.autoClose)) {
                core.info(' > Handling issue');
                client.issues
                    .listForRepo({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    state: 'open',
                    labels: 'provide more details, stale'
                })
                    // eslint-disable-next-line github/no-then
                    .then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                    var issues, ms, now, actionsForIssues;
                    return __generator(this, function (_a) {
                        issues = response.data;
                        ms = require('ms');
                        now = new Date();
                        actionsForIssues = {};
                        // eslint-disable-next-line github/array-foreach
                        issues.forEach(function (issue) {
                            var _a, _b, _c, _d, _e, _f;
                            core.debug("- " + issue.title);
                            var issueUpdatedAt = new Date(issue.updated_at);
                            var issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime(); // Difference in seconds
                            if ((_b = (_a = config.issue) === null || _a === void 0 ? void 0 : _a.automations) === null || _b === void 0 ? void 0 : _b.autoStale) {
                                var autoStaleActions = config.issue.automations.autoStale;
                                var labelsForClose_1 = autoStaleActions.fromTag.split(',');
                                var hasTagOnIssue = (_c = issue.labels) === null || _c === void 0 ? void 0 : _c.some(function (label) { return labelsForClose_1.indexOf(label === null || label === void 0 ? void 0 : label.name) !== -1; });
                                if (hasTagOnIssue) {
                                    var thresholdBeforeStale = ms(autoStaleActions.delay) / 1000; // threshold for stale in seconds
                                    if (issueInactivityPeriod > thresholdBeforeStale) {
                                        actionsForIssues[issue.number] = ACTION_STALE;
                                    }
                                }
                            }
                            if ((_e = (_d = config.issue) === null || _d === void 0 ? void 0 : _d.automations) === null || _e === void 0 ? void 0 : _e.autoClose) {
                                var autoCloseActions = config.issue.automations.autoClose;
                                var labelsForClose_2 = autoCloseActions.fromTag.split(',');
                                var hasTagOnIssue = (_f = issue.labels) === null || _f === void 0 ? void 0 : _f.some(function (label) { return labelsForClose_2.indexOf(label === null || label === void 0 ? void 0 : label.name) !== -1; });
                                if (hasTagOnIssue) {
                                    var thresholdBeforeStale = ms(autoCloseActions.delay) / 1000; // threshold for stale in seconds
                                    if (issueInactivityPeriod > thresholdBeforeStale) {
                                        actionsForIssues[issue.number] = ACTION_CLOSE;
                                    }
                                }
                            }
                            for (var _i = 0, _g = Object.entries(actionsForIssues); _i < _g.length; _i++) {
                                var _h = _g[_i], issueNumber = _h[0], action = _h[1];
                                switch (action) {
                                    case ACTION_CLOSE:
                                        performIssueClose(parseInt(issueNumber));
                                        break;
                                    case ACTION_STALE:
                                        performIssueStale(parseInt(issueNumber));
                                        break;
                                }
                            }
                        });
                        return [2 /*return*/, true];
                    });
                }); })["catch"](function (error) {
                    core.error(error);
                    core.setFailed(error);
                });
            }
            return [2 /*return*/];
        });
    });
}
function performIssueStale(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, github_1.postComment("@AUTHOR: This issue has been tagged 'stale', you might need to perform an action to make the issue go forward.")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, github_1.addLabels([constants_1.LABEL_STALE], issueNumber)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function performIssueClose(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, github_1.postComment('@AUTHOR: This issue will be closed as it has been stale for a while')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, github_1.patchIssue({ state: 'closed' }, issueNumber)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function default_1(config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, autoStaleAndClose(config)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports["default"] = default_1;
//# sourceMappingURL=index.js.map