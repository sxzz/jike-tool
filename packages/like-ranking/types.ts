export interface Post {
  actionTime: string
  id: string
  type: string
  content: string
  urlsInText: string[]
  status: string
  isCommentForbidden: boolean
  likeCount: number
  commentCount: number
  repostCount: number
  shareCount: number

  topic: {
    id: string
    type: string
    content: string
    subscribersCount: number
    squarePicture: {
      format: string
      picUrl: string
      middlePicUrl: string
      smallPicUrl: string
      thumbnailUrl: string
      watermarkPicUrl: string
      cropperPosX: number
      cropperPosY: number
      frameNumber: number
      width: number
      height: number
      livePhoto: string | null
    }
    briefIntro: string
    topicType: string
    operateStatus: string
    isValid: boolean
    isVerified: boolean
    topicId: number
    isSearchable: boolean
    likeIcon: string
    messagePrefix: string
    internalTags: unknown[]
    customTags: unknown[]
    auditStatus: string
    newCategory: unknown[]
    involvedUsers: null
    entryTab: string
    tabs: unknown[]
    rectanglePicture: unknown | null
    pictureUrl: string
    thumbnailUrl: string
    subscribedStatusRawValue: number
    subscribedAt: string
    ref: string
    isDreamTopic: boolean
    isAnonymous: boolean
    enablePictureComments: boolean
    enablePictureWatermark: boolean
    timeForRank: string
    lastMessagePostTime: string
    createdAt: string
    updatedAt: string
    subscribersTextSuffix: string
    subscribersName: string
    friendsAlsoSubscribe: string
    maintainer: null
    isUserTopicAdmin: boolean
    activitySection: null
    activitySections: unknown[]
    tips: {
      inDraft: string
      inComment: string
    }
    toppingArea: unknown | null
    inShortcuts: boolean
    preferSection: string
    relatedHashtags: unknown[]
    intro: string
    squarePostUpdateTime: string
    subscribersAction: string
    approximateSubscribersCount: string
    subscribersDescription: string
    isCommentForbidden: boolean
    botCount: number
    recentPost: string
    source: string
  }
  pictures: unknown[]
  collected: boolean
  collectTime: unknown | null
  user: {
    id: string
    username: string
    screenName: string
    createdAt: string
    updatedAt: string
    isVerified: boolean
    verifyMessage: string
    briefIntro: string
    avatarImage: {
      thumbnailUrl: string
      smallPicUrl: string
      middlePicUrl: string
      picUrl: string
      format: string
      campaignDecorationUrl: string
    }
    profileImageUrl: string
    statsCount: {
      topicSubscribed: number
      topicCreated: number
      followedCount: number
      followingCount: number
      highlightedPersonalUpdates: number
      liked: number
      respectedCount: number
    }
    isBannedForever: boolean
    isSponsor: boolean
    backgroundImage: {
      picUrl: string
    }
    bio: string
    gender: string
    city: string
    country: string
    province: string
    refRemark: {
      type: string
      refId: string
    }
    following: boolean
  }
  createdAt: string
  isFeatured: boolean
  enablePictureComments: boolean
  repostable: boolean
  rollouts: {
    wmpShare: {
      id: string
      path: string
    }
  }
  scrollingSubtitles: {
    text: string
    type: string
  }[]
  pinned: {
    personalUpdate: boolean
  }
}

export interface PostRequest {
  username: string
  limit: number
  loadMoreKey?: {}
}

export interface PostResponse {
  success: boolean
  data: Post[]
  loadMoreKey?: {
    lastId: string
  }
}

export interface User {
  id: string
  username: string
  screenName: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
  verifyMessage: string
  briefIntro: string
  avatarImage: {
    thumbnailUrl: string
    smallPicUrl: string
    middlePicUrl: string
    picUrl: string
    format: string
    campaignDecorationUrl: string
  }
  profileImageUrl: string
  statsCount: {
    topicSubscribed: number
    topicCreated: number
    followedCount: number
    followingCount: number
    highlightedPersonalUpdates: number
    liked: number
    respectedCount: number
  }
  isBannedForever: boolean
  isSponsor: boolean
  backgroundImage: {
    picUrl: string
  }
  bio: string
  gender: string
  storyStatus: string
  following: boolean
  ref: string
}

export interface LikedUsersRequest {
  id: string
  limit: number
  loadMoreKey?: string
}

export interface LikedUsersResponse {
  data: User[]
  loadMoreKey?: string
}
