import store from '@/store'
import { checkAccessToken } from '@/utils/account'
import { getTweetsById as gtbi, getTweetById as getbi, userFollowing as uf,
     userLike as ul, getSapceBySpaceId, getUserInfoFromTwitter as guibu,
    userTweet as ut } from '@/api/api'
import { logout } from '@/utils/account'
import { errCode } from '@/config'

export const getTweetsById = async (tweetIds) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId
    try {
        const tweets = await gtbi(twitterId, tweetIds)
        return tweets;
    }catch(e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
    }
}

export const getTweetById = async (tweetId) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId;
    try {
        const tweet = await getbi(twitterId, tweetId);
        return tweet;
    }catch(e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
    }
}

export const getSpaceById = async (spaceId) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId;
    try {
        const space = await getSapceBySpaceId(twitterId, spaceId);
        return space;
    }catch(e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
    }
}

export const getUserInfoByUserId = async (userid) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId;
    try{
        const user = await guibu(twitterId, userid);
        return user;
    }catch(e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
    }
}

/**
 * check if user followed the author
 * @param {*} authorId 
 */
export const userFollowing = async (authorId) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId
    try {
        const f = await uf(twitterId, authorId)
        return f;
    }catch(e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
    }
}

export const userLike = async (tweetId) => {
    await checkAccessToken();
    const twitterId = store.getters.getAccountInfo.twitterId;
    try {
        const r = await ul(twitterId, tweetId);
        console.log('like result', r);
        if (r && r.liked) {
            return true
        }
        return false
    }catch (e) {
        if (e === 401) {
            await logout(twitterId)
            throw 'log out'
        }
        if (e === errCode.TWEET_NOT_FOUND) {
            throw e
        }
    }
}

export const userTweet = async (text) => {
    await checkAccessToken();
    try {
        const twitterId = store.getters.getAccountInfo.twitterId;
        const r = await ut(twitterId, text)
        if(r) {
            return r.id
        }
    }catch(e) {
        if (e === 401) {
            throw 'log out'
        }
    }
}