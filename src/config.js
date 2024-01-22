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
exports.getConfig = void 0;
var js_yaml_1 = require("js-yaml");
var t = require("io-ts");
var io_ts_reporters_1 = require("io-ts-reporters");
var Either_1 = require("fp-ts/Either");
var github = require("@actions/github");
var AuthorAssociation = t.partial({
    // Author of issue or pull_request
    author: t.boolean,
    // Author has been invited to collaborate on the repository.
    collaborator: t.boolean,
    // Author has previously committed to the repository.
    contributor: t.boolean,
    // Author has not previously committed to GitHub.
    first_timer: t.boolean,
    // Author has not previously committed to the repository.
    first_time_contributor: t.boolean,
    // Author is a placeholder for an unclaimed user.
    mannequin: t.boolean,
    // Author is a member of the organization that owns the repository.
    member: t.boolean,
    // Author has no association with the repository.
    none: t.boolean,
    // Author is the owner of the repository.
    owner: t.boolean
});
var Label = t.intersection([
    t.type({
        prefix: t.string,
        list: t.array(t.string)
    }),
    t.partial({
        multiple: t.boolean,
        author_association: AuthorAssociation,
        needs: t.union([
            t.boolean,
            t.partial({
                comment: t.string,
                status: t.intersection([
                    t.type({
                        context: t.string
                    }),
                    t.partial({
                        url: t.string,
                        description: t.union([
                            t.string,
                            t.partial({
                                success: t.string,
                                failure: t.string
                            })
                        ])
                    })
                ])
            })
        ])
    })
]);
var Capture = t.intersection([
    t.type({
        regex: t.string,
        label: t.string
    }),
    t.partial({
        author_association: AuthorAssociation,
        ignore_case: t.boolean,
        github_release: t.boolean
    })
]);
var CommentChatOps = t.intersection([
    t.type({
        cmd: t.string,
        type: t.literal('comment'),
        comment: t.string
    }),
    t.partial({
        author_association: AuthorAssociation
    })
]);
var LabelChatOps = t.intersection([
    t.type({
        cmd: t.string,
        type: t.literal('label'),
        label: t.partial({
            add: t.union([t.string, t.array(t.string)]),
            remove: t.union([t.string, t.array(t.string)])
        })
    }),
    t.partial({
        author_association: AuthorAssociation
    })
]);
var GenericChatOps = t.intersection([
    t.type({
        cmd: t.string,
        type: t.keyof({
            close: null,
            none: null,
            assign: null,
            review: null
        })
    }),
    t.partial({
        author_association: AuthorAssociation
    })
]);
var ChatOps = t.union([GenericChatOps, LabelChatOps, CommentChatOps]);
var CollaboratorAliasList = t.array(t.string);
var DelayedActionOnTag = t.type({
    fromTag: t.string,
    delay: t.string,
    resetOn: t.union([t.array(t.string), t.undefined])
});
var AutoStale = DelayedActionOnTag;
var AutoClose = DelayedActionOnTag;
var Automations = t.partial({
    autoAssignAnyFrom: CollaboratorAliasList,
    autoStale: AutoStale,
    autoClose: AutoClose
});
var Governance = t.partial({
    labels: t.array(Label),
    captures: t.array(Capture),
    chat_ops: t.array(ChatOps),
    automations: Automations
});
var Config = t.intersection([
    t.type({
        version: t.literal('v1')
    }),
    t.partial({
        issue: Governance,
        pull_request: Governance
    })
]);
function parse(content) {
    var config = js_yaml_1.load(content);
    var decoded = Config.decode(config);
    if (Either_1.isRight(decoded)) {
        return decoded.right;
    }
    else {
        throw new Error("Config parse error:\\n" + io_ts_reporters_1["default"].report(decoded).join('\\n'));
    }
}
/**
 * @param client used to get governance config from
 * @param configPath location of the config file
 */
function getConfig(client, configPath) {
    return __awaiter(this, void 0, void 0, function () {
        var response, content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.repos.getContent({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        ref: github.context.sha,
                        path: configPath
                    })];
                case 1:
                    response = _a.sent();
                    content = Buffer.from(response.data.content, response.data.encoding).toString();
                    return [2 /*return*/, parse(content)];
            }
        });
    });
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map