import { Template } from "meteor/templating";
import moment from "moment";
import { ReactiveDict } from "meteor/reactive-dict";

import "./notification";

const reRenderNotification = (template) => {
  const skip = template.state.get("skip");
  Meteor.call("notification/getInApp", Meteor.userId(), 3, skip, (err, notification) => {
    template.state.set("notification", notification.notifications);
  });
  Meteor.call("notification/getReadCount", (err, count) => {
    template.state.set("count", count);
  });
};


Template.notification.onCreated(function () {
  const template = this;
  template.state = new ReactiveDict();
  template.state.setDefault({
    notifications: [],
    skip: 0,
    count: 0
  });

  this.autorun(() => {
    Meteor.call("notification/getReadCount", (err, count) => {
      this.state.set("count", count);
    });

    reRenderNotification(template);
    Template.notificationMenu.events({
      "click .notification-icon"() {
        reRenderNotification(template);
      }
    });
  });
});


Template.notification.helpers({
  Notifications() {
    const template = Template.instance();
    skip = template.state.get("skip");
    Meteor.call("notification/getInApp", Meteor.userId(), 3, skip, (err, notification) => {
      template.state.set("notification", notification.notifications);
    });
    return template.state.get("notification");
  },
  hasValue(array = []) {
    return array.length <= 0 ? false : true;
  },
  getStatus(status) {
    return status ? "#f2f2f2" : "";
  },
  getUnread() {
    const template = Template.instance();
    return template.state.get("count");
  },
  getDate(date) {
    return moment(date).fromNow();
  }
});


Template.notification.events({
  "click .n-next"(event, template) {
    const skip = template.state.get("skip") + 3;
    template.state.set("skip", skip);
    Meteor.call("notification/getInApp", Meteor.userId(), 3, skip, (err, notification) => {
      template.state.set("notification", notification.notifications);
    });
  },

  "click .n-prev"(event, template) {
    let skip = template.state.get("skip") - 3;
    skip = skip < 0 ? 0 : skip;
    template.state.set("skip", skip);
    Meteor.call("notification/getInApp", Meteor.userId(), 3, skip, (err, notification) => {
      template.state.set("notification", notification.notifications);
    });
  },
  "click .delete-all"(event, template) {
    Meteor.call("notification/deleteAll",  ()=> {
      reRenderNotification(template);
    });
  },

  "click .notification"(event, template) {
    if (this._id) {
      Meteor.call("notification/markRead", this._id, ()=> {
        reRenderNotification(template);
        Meteor.call("notification/getReadCount", (err, count) => {
          template.state.set("count", count);
        });
      });
    }
  },

  "click .notification-delete"(event, template) {
    Meteor.call("notification/delete", this._id, () => {
      reRenderNotification(template);
    });
  },

  "click .read-all"(event, template) {
    Meteor.call("notification/markReadAll", () => {
      reRenderNotification(template);
    });
  }
});
