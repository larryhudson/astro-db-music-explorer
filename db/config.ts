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

const Bookmark = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.text({ references: () => User.columns.id }),
    url: column.text(),
    createdAt: column.date({ default: NOW }),
    note: column.text({ optional: true }),
    status: column.text({ default: 'to_check_out', enum: ['to_check_out', 'checking_out', 'archived', 'snoozed'] }),
    statusChangedAt: column.date({ default: NOW }),
    statusChangedFrom: column.text({ optional: true }),
    originalBookmarkId: column.number({ optional: true, references: () => Bookmark.columns.id })
  },
  indexes: {
    bookmarkUserId: {
      on: ['userId'],
    },
    bookmarkCreatedAt: {
      on: ['createdAt'],
    },
  }
})

const BookmarkSnooze = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    bookmarkId: column.number({ references: () => Bookmark.columns.id }),
    snoozeUntil: column.date(),
    createdAt: column.date({ default: NOW }),
    note: column.text({ optional: true }),
  },
  indexes: {
    bookmarkSnoozeBookmarkId: {
      on: ['bookmarkId'],
    },
    bookmarkSnoozeCreatedAt: {
      on: ['createdAt'],
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

const QueueItem = defineTable({
  columns: {
    userId: column.text({ references: () => User.columns.id }),
    spotifyUri: column.text(),
    createdAt: column.date({ default: NOW }),
    position: column.number(),
  },
  indexes: {
    queueItemUserId: {
      on: ['userId'],
    },
    queueItemCreatedAt: {
      on: ['createdAt'],
    },
    queueItemPosition: {
      on: ['position'],
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

// https://astro.build/db/config
export default defineDb({
  tables: {
    User,
    Session,
    Bookmark,
    BookmarkSnooze,
    Notification,
    QueueItem,
    FriendRequest,
    SpotifyToken,
    Friendship
  }
});
