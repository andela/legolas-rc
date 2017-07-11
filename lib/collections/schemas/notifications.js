import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Notifications = new SimpleSchema({
  userId: {
    type: String,
    optional: false
  },

  type: {
    type: String
  },

  message: {
    type: String
  },
  read: {
    type: Boolean,
    optional: false,
    defaultValue: false
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    defaultValue: new Date
  }
});
