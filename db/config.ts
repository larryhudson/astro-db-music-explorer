import { defineDb, defineTable, column, NOW, FriendRequest } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    username: column.text({ unique: true }),
    hashedPassword: column.text(),
    createdAt: column.date({ default: NOW }),
    isAdmin: column.boolean({ default: false }),
    isApproved: column.boolean({ default: false }),
  },
  indexes: {
    userCreatedAt: {
      on: ['createdAt'],
    },
    userIsAdmin: {
      on: ['isAdmin'],
    },
    userIsApproved: {
      on: ['isApproved'],
    },
  }
})

const Feedback = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    feedback: column.text(),
    pageUrl: column.text(),
    createdAt: column.date({ default: NOW }),
  },
  indexes: {
    feedbackUserId: {
      on: ['userId'],
    },
    feedbackCreatedAt: {
      on: ['createdAt'],
    },
  }
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    expiresAt: column.date(),
    userId: column.text({ references: () => User.columns.id }),
  }
})

const SpotifyToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    accessToken: column.text(),
    refreshToken: column.text(),
    expiresAt: column.date(),
    userId: column.text({ references: () => User.columns.id }),
  }
})

const MusicItem = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    url: column.text(),
    createdAt: column.date({ default: NOW }),
    title: column.text(),
    note: column.text({ optional: true }),
    status: column.text({ default: 'to_check_out', enum: ['to_check_out', 'checking_out', 'archived', 'snoozed'] }),
    statusChangedAt: column.date({ default: NOW }),
    statusChangedFrom: column.text({ optional: true }),
    originalMusicItemId: column.number({ optional: true, references: () => MusicItem.columns.id }),
  },
})

const Article = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    url: column.text(),
    createdAt: column.date({ default: NOW }),
    title: column.text(),
    originalArticleId: column.number({ optional: true, references: () => Article.columns.id }),
    sourceId: column.number({ optional: true, references: () => Source.columns.id }),
    note: column.text({ optional: true }),
    status: column.text({ default: 'to_check_out', enum: ['to_read', 'read', 'archived', 'snoozed'] }),
    statusChangedAt: column.date({ default: NOW }),
    statusChangedFrom: column.text({ optional: true }),
  },
  indexes: {
    musicItemUserId: {
      on: ['userId'],
    },
    musicItemCreatedAt: {
      on: ['createdAt'],
    },
  }
})


const MusicItemArticle = defineTable({
  columns: {
    musicItemId: column.number({ references: () => MusicItem.columns.id }),
    articleId: column.number({ references: () => Article.columns.id }),
  },
  indexes: {
    musicItemArticleMusicItemId: {
      on: ['musicItemId'],
    },
    musicItemArticleArticleId: {
      on: ['articleId'],
    },
  }
})

const MusicItemSnooze = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    musicItemId: column.number({ references: () => MusicItem.columns.id }),
    snoozeUntil: column.date(),
    createdAt: column.date({ default: NOW }),
    note: column.text({ optional: true }),
  },
  indexes: {
    musicItemSnoozeMusicItemId: {
      on: ['musicItemId'],
    },
    musicItemSnoozeCreatedAt: {
      on: ['createdAt'],
    },
  }
})

const Tag = defineTable({
  columns: {
    slug: column.text({ unique: true }),
    name: column.text(),
    createdAt: column.date({ default: NOW }),
  },
  indexes: {
    tagCreatedAt: {
      on: ['createdAt'],
    },
  }
})

const MusicItemTag = defineTable({
  columns: {
    musicItemId: column.number({ references: () => MusicItem.columns.id }),
    tagSlug: column.text({ references: () => Tag.columns.slug }),
  },
  indexes: {
    musicItemTagMusicItemId: {
      on: ['musicItemId'],
    },
    musicItemTagTagSlug: {
      on: ['tagSlug'],
    },
  }
})

const Notification = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    type: column.text(),
    createdAt: column.date({ default: NOW }),
    readAt: column.date({ optional: true }),
    data: column.json(),
  },
  indexes: {
    notificationUserId: {
      on: ['userId'],
    },
    notificationCreatedAt: {
      on: ['createdAt'],
    },
    notificationReadAt: {
      on: ['readAt'],
    },
  }
})

const FriendRequest = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    fromUserId: column.text({ references: () => User.columns.id }),
    toUserId: column.text({ references: () => User.columns.id }),
    createdAt: column.date({ default: NOW }),
    acceptedAt: column.date({ optional: true }),
    declinedAt: column.date({ optional: true }),
  },
  indexes: {
    uniqueFriendRequest: {
      on: ['fromUserId', 'toUserId'],
      unique: true,
    },
    friendRequestFromUser: {
      on: ['fromUserId'],
    },
    friendRequestToUser: {
      on: ['toUserId'],
    },
    acceptedFriendRequest: {
      on: ['fromUserId', 'toUserId', 'acceptedAt'],
    },
  }
})

const Friendship = defineTable({
  columns: {
    userId: column.text({ references: () => User.columns.id }),
    friendId: column.text({ references: () => User.columns.id }),
    createdAt: column.date({ default: NOW }),
    friendRequestId: column.text({ references: () => FriendRequest.columns.id }),
  },
  indexes: {
    friendshipUserId: {
      on: ['userId'],
    },
    friendshipFriendId: {
      on: ['friendId'],
    },
    friendshipCreatedAt: {
      on: ['createdAt'],
    },
  }
})

const Source = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    title: column.text(),
    url: column.text(),
    note: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
  },
  indexes: {
    sourceCreatedAt: {
      on: ['createdAt'],
    },
  }
})

const SourceTag = defineTable({
  columns: {
    sourceId: column.number({ references: () => Source.columns.id }),
    tagSlug: column.text({ references: () => Tag.columns.slug }),
  },
  indexes: {
    sourceTagSourceId: {
      on: ['sourceId'],
    },
    sourceTagTagSlug: {
      on: ['tagSlug'],
    },
  }
})


// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Feedback,
    Session,
    Article,
    MusicItem,
    MusicItemArticle,
    MusicItemSnooze,
    Notification,
    FriendRequest,
    SpotifyToken,
    Friendship,
    Source,
    Tag,
    MusicItemTag,
    SourceTag,
  }
});
