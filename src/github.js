"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.hasReleaseByTag = exports.commitStatus = exports.requestReviewers = exports.assign = exports.patchIssue = exports.postComment = exports.removeLabels = exports.addLabels = exports.getLabels = exports.getNumber = exports.getBotUserId = exports.initClient = void 0;
var github = require("@actions/github");
var core = require("@actions/core");
function initClient(token) {
    if (token === void 0) { token = core.getInput('github-token'); }
    return github.getOctokit(token);
}
exports.initClient = initClient;
function getBotUserId() {
    return __awaiter(this, void 0, void 0, function () {
        var client, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    core.info('github-client: getBotUserId');
                    client = initClient();
                    return [4 /*yield*/, client.users.getAuthenticated()];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, user.data.id];
            }
        });
    });
}
exports.getBotUserId = getBotUserId;
function getNumber() {
    var _a, _b;
    return (((_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number) || ((_b = github.context.payload.issue) === null || _b === void 0 ? void 0 : _b.number));
}
exports.getNumber = getNumber;
function getLabels() {
    var _a;
    var contents = github.context.payload.pull_request || github.context.payload.issue;
    return ((_a = contents === null || contents === void 0 ? void 0 : contents.labels) === null || _a === void 0 ? void 0 : _a.map(function (_a) {
        var name = _a.name;
        return name;
    })) || [];
}
exports.getLabels = getLabels;
function addLabels(labels, issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!labels.length)
                        return [2 /*return*/];
                    core.info('github-client: addLabels');
                    client = initClient();
                    return [4 /*yield*/, client.issues.addLabels({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: issueNumber || getNumber(),
                            labels: labels
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.addLabels = addLabels;
function removeLabels(labels) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!labels.length)
                        return [2 /*return*/];
                    core.info('github-client: removeLabels');
                    client = initClient();
                    return [4 /*yield*/, Promise.all(labels.map(function (name) {
                            return client.issues.removeLabel({
                                owner: github.context.repo.owner,
                                repo: github.context.repo.repo,
                                issue_number: getNumber(),
                                name: name
                            });
                        }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeLabels = removeLabels;
/**
 * Comment details.
 */
function getDetails() {
    var repository = github.context.payload.repository;
    var configPath = core.getInput('config-path', { required: true });
    var repoUrl = repository === null || repository === void 0 ? void 0 : repository.html_url;
    var owner = repository === null || repository === void 0 ? void 0 : repository.owner;
    var branch = repository === null || repository === void 0 ? void 0 : repository.default_branch;
    var details = '';
    details += '\n';
    details += '<details><summary>Details</summary>';
    details += '\n\n';
    if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'Organization') {
        details += "I am a bot created to help the [" + (owner === null || owner === void 0 ? void 0 : owner.login) + "](" + (owner === null || owner === void 0 ? void 0 : owner.html_url) + ") developers manage community feedback and contributions.";
    }
    else {
        details += "I am a bot created to help [" + (owner === null || owner === void 0 ? void 0 : owner.login) + "](" + (owner === null || owner === void 0 ? void 0 : owner.html_url) + ") manage community feedback and contributions.";
    }
    details += ' ';
    details += "You can check out my [manifest file](" + repoUrl + "/blob/" + branch + "/" + configPath + ") to understand my behavior and what I can do.";
    details += ' ';
    details +=
        'If you want to use this for your project, you can check out the forked project [rr404/oss-governance-bot](https://github.com/rr404/oss-governance-bot) repository.';
    details += '\n\n';
    details += '</details>';
    return details;
}
function getIssueUserLogin() {
    var _a, _b;
    if (github.context.payload.issue) {
        return (_a = github.context.payload.issue.user) === null || _a === void 0 ? void 0 : _a.login;
    }
    if (github.context.payload.pull_request) {
        return (_b = github.context.payload.pull_request.user) === null || _b === void 0 ? void 0 : _b.login;
    }
}
/**
 * Comment to post with added details.
 *
 * @param body comment
 */
function postComment(body, issueNumber) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    core.info('github-client: postComment');
                    client = initClient();
                    body = body.replace('$AUTHOR', (_a = github.context.payload.sender) === null || _a === void 0 ? void 0 : _a.login);
                    body = body.replace('$ISSUE_AUTHOR', getIssueUserLogin());
                    body += getDetails();
                    return [4 /*yield*/, client.issues.createComment({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: issueNumber || getNumber(),
                            body: body
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.postComment = postComment;
function patchIssue(changes, issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    core.info('github-client: patchIssue');
                    client = initClient();
                    return [4 /*yield*/, client.issues.update(__assign({ owner: github.context.repo.owner, repo: github.context.repo.repo, issue_number: issueNumber || getNumber() }, changes))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.patchIssue = patchIssue;
function assign(assignees) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!assignees.length)
                        return [2 /*return*/];
                    core.info('github-client: assign');
                    client = initClient();
                    return [4 /*yield*/, client.issues.addAssignees({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: getNumber(),
                            assignees: assignees
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.assign = assign;
function requestReviewers(reviewers) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!reviewers.length)
                        return [2 /*return*/];
                    core.info('github-client: requestReviewers');
                    client = initClient();
                    return [4 /*yield*/, client.pulls.requestReviewers({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            pull_number: getNumber(),
                            reviewers: reviewers
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.requestReviewers = requestReviewers;
function commitStatus(context, state, description, url) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        function sendStatus(sha) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, client.repos.createCommitStatus({
                                owner: github.context.repo.owner,
                                repo: github.context.repo.repo,
                                sha: sha,
                                context: context,
                                state: state,
                                description: description,
                                target_url: url
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var client, response;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    core.info('github-client: commitStatus');
                    client = initClient();
                    if (!github.context.payload.pull_request) return [3 /*break*/, 2];
                    return [4 /*yield*/, sendStatus((_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.head.sha)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
                case 2:
                    if (!(github.context.payload.comment && ((_b = github.context.payload.issue) === null || _b === void 0 ? void 0 : _b.pull_request))) return [3 /*break*/, 5];
                    return [4 /*yield*/, client.pulls.get({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            pull_number: getNumber()
                        })];
                case 3:
                    response = _c.sent();
                    return [4 /*yield*/, sendStatus(response.data.head.sha)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.commitStatus = commitStatus;
function hasReleaseByTag(tag) {
    return __awaiter(this, void 0, void 0, function () {
        var client, release;
        return __generator(this, function (_a) {
            core.info('github-client: getReleaseByTag');
            client = initClient();
            release = client.repos.getReleaseByTag({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                tag: tag
            });
            return [2 /*return*/, release.then(function () { return true; })["catch"](function () { return false; })];
        });
    });
}
exports.hasReleaseByTag = hasReleaseByTag;
//# sourceMappingURL=github.js.map