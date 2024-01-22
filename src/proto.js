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
exports.initClient = void 0;
var github_1 = require("./github");
var constants_1 = require("./constants");
var core = require("@actions/core");
var github = require("@actions/github");
var ACTION_STALE = 'stale';
var ACTION_CLOSE = 'close';
function initClient(token) {
    if (token === void 0) { token = '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'; }
    return github.getOctokit(token);
}
exports.initClient = initClient;
function testor(issueNumber) {
    // eslint-disable-next-line no-console
    console.log(issueNumber || 424242);
}
function autoStaleAndClose(config) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var client, ms, now, actionsForIssues, autoStaleActions, thresholdBeforeStale_1, issuesListResponse, issuesList, _i, _c, _d, issueNumber, action;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    core.info('Starting autoStaleAndClose');
                    client = initClient();
                    ms = require('ms');
                    now = new Date();
                    actionsForIssues = {};
                    if (!((_b = (_a = config.issue) === null || _a === void 0 ? void 0 : _a.automations) === null || _b === void 0 ? void 0 : _b.autoStale)) return [3 /*break*/, 3];
                    core.info(' > Checking for Stale issues');
                    autoStaleActions = config.issue.automations.autoStale;
                    thresholdBeforeStale_1 = ms(autoStaleActions.delay) / 1000 // threshold for stale in seconds
                    ;
                    core.debug("- thresholdBeforeStale " + thresholdBeforeStale_1 + "s");
                    return [4 /*yield*/, client.issues.listForRepo({
                            owner: 'rr404',
                            repo: 'governanceTest',
                            state: 'open',
                            labels: "provide more details" //retrieve from config
                        })];
                case 1:
                    issuesListResponse = _e.sent();
                    issuesList = issuesListResponse.data;
                    // eslint-disable-next-line github/array-foreach
                    issuesList.forEach(function (issue) {
                        var issueUpdatedAt = new Date(issue.updated_at);
                        var issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime(); // Difference in seconds
                        core.debug("- " + issue.title + " inactive for " + issueInactivityPeriod + "s");
                        if (issueInactivityPeriod > thresholdBeforeStale_1) {
                            actionsForIssues[issue.number] = ACTION_STALE;
                        }
                    });
                    return [4 /*yield*/, client.issues.listForRepo({
                            owner: 'rr404',
                            repo: 'governanceTest',
                            state: 'open',
                            labels: "stale" //retrieve from config
                        })];
                case 2:
                    //LF close
                    issuesListResponse = _e.sent();
                    issuesList = issuesListResponse.data;
                    // eslint-disable-next-line github/array-foreach
                    issuesList.forEach(function (issue) {
                        var issueUpdatedAt = new Date(issue.updated_at);
                        var issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime(); // Difference in seconds
                        core.debug("- " + issue.title + " inactive for " + issueInactivityPeriod + "s");
                        if (issueInactivityPeriod > thresholdBeforeStale_1) {
                            actionsForIssues[issue.number] = ACTION_CLOSE;
                        }
                    });
                    for (_i = 0, _c = Object.entries(actionsForIssues); _i < _c.length; _i++) {
                        _d = _c[_i], issueNumber = _d[0], action = _d[1];
                        switch (action) {
                            case ACTION_CLOSE:
                                performIssueClose(parseInt(issueNumber));
                                break;
                            case ACTION_STALE:
                                performIssueStale(parseInt(issueNumber));
                                break;
                        }
                    }
                    _e.label = 3;
                case 3: return [2 /*return*/];
            }
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
var globalConfig = {
    issue: {
        automations: {
            autoStale: {
                fromTag: 'provide more details',
                delay: '3m',
                resetOn: ['issue_comment/created']
            }
        }
    },
    version: 'v1'
};
testor();
testor(12);
testor(0);
autoStaleAndClose(globalConfig);
//# sourceMappingURL=proto.js.map