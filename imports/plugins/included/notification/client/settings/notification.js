/* eslint-disable no-undef */
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { TwilioPackageConfig } from "../../lib/collections/schemas";
import { JusibePackageConfig } from "../../lib/collections/schemas";
import { DefaultPackageConfig } from "../../lib/collections/schemas";
import { EmailNotificationPackageConfig } from "../../lib/collections/schemas";
import { SmsMessagePackageConfig } from "../../lib/collections/schemas";
import { EmailMessagePackageConfig } from "../../lib/collections/schemas";


import "./notification.html";

// gets form package
const getPackageData = () => {
  return Packages.findOne({
    name: "notification",
    shopId: Reaction.getShopId()
  });
};


Template.notificationSettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    smsMethod: "twilioSettings"
  });
});

Template.notificationSettings.helpers({
  showSettings() {
    const template = Template.instance();
    return template.state.get("smsMethod");
  },
  EmailMessagePackageConfig() {
    return EmailMessagePackageConfig;
  },
  SmsMessagePackageConfig() {
    return SmsMessagePackageConfig;
  },
  packageData() {
    return getPackageData();
  }
});

Template.notificationSettings.events({
  "change #smsMethod"(event, template) {
    const method = event.target.value;
    if (method.length > 1) {
      template.state.set("smsMethod", method);
    }
  }
});

Template.twilioSettings.helpers({
  TwilioPackageConfig() {
    return TwilioPackageConfig;
  },
  packageData() {
    return getPackageData();
  }
});

Template.jusibeSettings.helpers({
  JusibePackageConfig() {
    return JusibePackageConfig;
  },
  packageData() {
    return getPackageData();
  }
});

Template.notificationSettings.helpers({
  DefaultPackageConfig() {
    return DefaultPackageConfig;
  },
  packageData() {
    return getPackageData();
  }
});

Template.emailNotificationSettings.helpers({
  EmailNotificationPackageConfig() {
    return EmailNotificationPackageConfig;
  },
  packageData() {
    return getPackageData();
  }
});


AutoForm.hooks({
  "twilio-update-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Twilio settings saved", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("An error occurred" + error, "danger");
    }
  }
});

AutoForm.hooks({
  "jusibe-update-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Jusibe api settings saved", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("An error occurred " + error, "danger");
    }
  }
});

AutoForm.hooks({
  "sms-update-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Sms default set", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Unable to set sms default " + error, "danger");
    }
  }
});

AutoForm.hooks({
  "email-message-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Email messages saved", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Error saving email messages " + error, "danger");
    }
  }
});

AutoForm.hooks({
  "sms-message-form": {
    onSuccess: function () {
      Alerts.removeSeen();
      return Alerts.add("Sms message saved", "success");
    },
    onError: function (operation, error) {
      Alerts.removeSeen();
      return Alerts.add("Error saving sms messages " + error, "danger");
    }
  }
});
