const steem = require('steem');
var utils = require('./utils');

var config = null;
var query = null;

steem.api.setOptions({ url: 'https://api.steemit.com' });

// Load the settings from the config file
config = utils.loadConfig();

startProcess();
// Schedule to run every x minutes
setInterval(startProcess, config.posting_interval * 60 * 1000);

function startProcess() {
    // Load the settings from the config file each time so we can pick up any changes
    config = utils.loadConfig();
    commentOnLatestContent();
}

function commentOnLatestContent() {
    query = {
        tag: config.tag,
        limit: 1
    };
    steem.api.getDiscussionsByCreated(query, function(err, result) {
        if (err) {
            utils.log(err);
        } else {
            postComment(result[0]);
        }
    });
}

function postComment(content) {
    if (content.author_reputation <= config.author_max_reputation) {
        var url = "http://steemit.com" + content.url;
        steem.api.getContentReplies(content.author, content.permlink, function(err, result) {
            /* Check if the post is already commented by the bot */
            var commenters = result.filter(function(comment) { return comment.author == config.account; });
            if (commenters.length > 0) {
                utils.log("Already commented on: " + content.title + " (" + url + ")")
            } else {
                // Generate the comment permlink via steemit standard convention
                var permlink = 're-' + content.author.replace(/\./g, '') + '-' + content.permlink + '-' + new Date().toISOString().replace(/-|:|\./g, '').toLowerCase();
                var comment = getRandomComment()
                                .replace(/\{author\}/g, '@' + content.author)
                                .replace(/\{botname\}/g, '@' + config.account);
                utils.log("Posting Comment: " + comment);

                // Broadcast the comment
                steem.broadcast.comment(config.posting_key, content.author, content.permlink, config.account, permlink, permlink, comment, '{"app":"greeterbot/1.0.0"}', function (err, result) {
                    if (err) {
                        utils.log(err);
                    } else {
                        utils.log("Comment posted successfully for: " + content.title + " (" + url + ")");
                    }
            });
            }
        });
    } else {
        utils.log("Author @" + content.author + " has higher reputation");
    }
}

function getRandomComment() {
    var index = utils.getRandomIndex(0, config.comments.length-1)
    return config.comments[index];
}