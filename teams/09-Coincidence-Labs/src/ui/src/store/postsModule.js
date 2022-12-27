
export default {
    namespaced: true,
    state: {
        tagsAggregation: {},
        // store square posts, classify by tags
        allPosts: {},
        // in square page, this field stored which tag user alread chosed
        currentTagIndex: 0,
        // post detail page data
        currentShowingDetail: null,
        /**
         * this is categary by tag, contain page info and posts
         * {
         *      pageNum:0,
         *      posts: []
         * }
         */
        allPostsTagValue: {},
        allPostsTagTrend: {}
    },
    mutations: {
        saveTagsAggregation: (state, tagsAggregation) => {
            state.tagsAggregation = tagsAggregation
        },
        saveAllPosts: (state, allPosts) => {
            state.allPosts = allPosts
        },
        saveCurrentTagIndex: (state, currentTagIndex) => {
            state.currentTagIndex = currentTagIndex
        },
        saveCurrentShowingDetail: (state, currentShowingDetail) => {
            state.currentShowingDetail = currentShowingDetail
        },
        saveAllPostsTagValue: (state, allPostsTagValue) => {
            state.allPostsTagValue = allPostsTagValue
        },
        saveAllPostsTagTrend: (state, allPostsTagTrend) => {
            state.allPostsTagTrend = allPostsTagTrend
        }
    },
    getters: {
        getPostsByTag: (state) => (tag) => {
            const posts = state.allPosts[tag]
            return posts
        },
        getPostsByTagValue: (state) => (tag) => {
            return state.allPostsTagValue[tag]
        },
        getPostsByTagTrend: (state) => (tag) => {
            return state.allPostsTagTrend[tag]
        },
    }
}