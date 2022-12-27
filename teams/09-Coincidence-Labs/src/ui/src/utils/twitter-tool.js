/**
 * Parse twitter data
 */

const SpaceRex = /https:\/\/twitter\.com\/i\/spaces\/([0-9a-z-A-Z]+)/
const regex_hive_tag = /#hive-[0-9]{4,7}/

export const getSpaceIdFromUrls = (urls) => {
    if (!urls || urls.length === 0) return null;
    for (let url of urls) {
        if (url.expanded_url === url.unwound_url) {
            const group = url.expanded_url.match(SpaceRex);
            if (group) {
                const spaceId = group[1]
                return spaceId;
            }
        }
    }
}

export function getAuthor(tweet) {
    if ("includes" in tweet && "users" in tweet.includes) {
        return tweet.includes.users.find((user) => tweet.data.author_id == user.id);
    }
    return null;
}

export function getTags(tweet) {
    // get hive tag
    const hive = tweet.data.text.match(regex_hive_tag);
    let hivetag = null;
    if (hive && hive.length > 0) {
        try {
            hivetag = hive[0].trim().substring(1)
        } catch (e) { }
    }
    if ("data" in tweet && "entities" in tweet.data && "hashtags" in tweet.data.entities) {
        let tags = [];
        for (let i in tweet.data.entities.hashtags) {
            if (tweet.data.entities.hashtags[i].tag === 'hive' && hivetag) {
                tags.push(hivetag)
                continue;
            }
            tags.push(tweet.data.entities.hashtags[i].tag);
        }
        if (tags.length > 0) return [...new Set(tags)];// JSON.stringify(tags);
        return ["iweb3"];
    }
    return ["iweb3"];
}

/**
 * tweet content contains the url which is redirect url transformed by twitter, we change them back to original page
 * @param {*} tweet 
 */
 export function showOriginalUrl(tweet) {
    if ("data" in tweet && "entities" in tweet.data && "urls" in tweet.data.entities) {
        for (let url of tweet.data.entities.urls) {
            if (url.expanded_url.startsWith('https://twitter.com/') || (url.unwound_url && url.unwound_url.startsWith('https://twitter.com/'))) {

            } else {
                tweet.data.text = tweet.data.text.replace(url.url, url.unwound_url ?? url.expanded_url)
                const u = url.unwound_url ?? url.expanded_url;
            }
        }
    }
    return tweet;
}

export function delSelfUrl(tweet) {
    if (tweet.data && tweet.data.entities && tweet.data.entities.urls) {
        for (let u of tweet.data.entities.urls) {
            if (u.expanded_url.indexOf(tweet.data.id) !== -1) {
                tweet.data.text = tweet.data.text.replace(u.url, '')
                return tweet
            }
        }
    }
    return tweet
}

export function parseTweet(tweet) {
    try {
    tweet = delSelfUrl(tweet);
    tweet = showOriginalUrl(tweet);
    let tags = getTags(tweet);
    let user = getAuthor(tweet);
    let content = tweet.data.text.trim();
    let post = {
        parentTweetId: tweet.data.conversation_id,
        postId: tweet.data.id,
        twitterId: tweet.data.author_id,
        name: user.name,
        username: user.username,
        profileImg: user.profile_image_url.replace('normal', '200x200'),
        verified: user.verified,
        followers: user.public_metrics.followers_count,
        following: user.public_metrics.following_count,
        content,
        postTime: tweet.data.created_at,
        tags: JSON.stringify(tags)
    }

    if ("includes" in tweet && "media" in tweet.includes) {
        for (let index in tweet.includes.media) {
            let media = tweet.includes.media[index];
            post.content += "\n" + (media.url ?? media.preview_image_url);
        }
    }
    return post
}catch(e) {
    console.log(661, e);
}
}