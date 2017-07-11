import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Nodemailer from "nodemailer";
import SmtpTransport from "nodemailer-smtp-transport";
import * as Collections from "/lib/collections";
import { Reaction } from "/server/api";
import Twilio from "twilio";
import request from "request";
import { Logger } from "/server/api";

  /**
   *message/parser
   * @description takes in a string a parses
   * it base om the data passed into it.
   * the passer searches the test for specific keywords
   * and replaces it with the appropriate value
   * @param {String} message - message passed into it
   * @param {Object} data - data to render
   * @return {String} parsed string
   */
const messageParser = (message, data = {}) => {
  let result;
  try {
    const compiled = _.template(message);
    result = compiled(data);
  } catch (err) {
    Logger.warn(err.message);
  }
  return result;
};


Meteor.methods({


  /**
   * notification/notify
   * @description Entry point to sms notification
   * this method sends and sms, mauls the user or the admin
   * base on the type of notification triggered
   * for user been credited
   * @param {String} type - type of notification
   * @param {Object} details - details sent
   * @param {String} id - user Id
   * @return {void}
   */
  "notification/notify"(type, details = {}, id = "") {
    check(type, String);
    check(details, Object);
    check(id, String);

    userId = id.length === 0 ? Meteor.userId() : id;
    const settings = Collections.Packages.findOne({
      name: "notification",
      shopId: Reaction.getShopId()
    }).settings;

    const getMessage = settings.api.message[type];
    const user = Collections.Accounts.findOne({ _id: userId });
    const profile = user.profile.addressBook[0];
    let locale;
    details.user =  user.profile.addressBook[0].fullName || user.emails[0].address;
    details.userId =  user.profile.addressBook[0].fullName || user.emails[0].address;
    details.balance = details.balance || parseInt(user.wallet.balance, 10);
    details.email = user.emails[0].address;
    let message = messageParser(getMessage, details);

    Meteor.call("shop/getLocale", (err, res) => {
      locale = res.locale.phone || 234;
    });
    if (profile.phone) {
      const notificationDetails = {
        userId: user._id,
        type,
        message: message || details.message,
        settings,
        number: `+${locale}${profile.phone}`
      };
      const smsApi = settings.default;
      Meteor.call(`notification/${smsApi}`, notificationDetails);
    }
    message = message ||  details.message;
    Meteor.call("notification/postInApp", type, message, user._id);
    Meteor.call("notification/email", type, details);

    // triggers admin notification
    if (type === "payment") {
      const admin = Collections.Accounts.findOne({shopId: Reaction.getShopId()});
      const adminNo = admin.profile.addressBook[0].phone;
      details.user = profile.fullName || user.emails[0].address;
      details.userId = admin._id;
      details.email = admin.emails[0].address;
      if (adminNo) {
        const adminNotification = {
          type,
          message: details.adminMessage || `An order with id (${details.orderId}), has been made by ${details.user}`,
          settings,
          number: adminNo
        };
        Meteor.call(`notification/${smsApi}`, adminNotification);
        Meteor.call("notification/postInApp", type, adminNotification.message, admin._id);
        Meteor.call("notification/email", type, details);
      }
    }
  },

  /**
   * notification/twilio
   * @description Sends sms using twilio api
   * @param {Object} details - details to be sent
   * @return {void}
   */
  "notification/twilio"(details) {
    check(details, Object);
    const client = Twilio(
      details.settings.api.twilio.accSid,
      details.settings.api.twilio.authToken
    );
    client.messages.create({
      to: details.number,
      body: details.message,
      from: details.settings.api.twilio.phoneNumber
    }, (err, res) => {
      if (err) {
        Logger.warn("notification/twilio failure", err);
      } else {
        Logger.info("notification/twilio failure", res.body);
      }
    });
  },

  /**
   * notification/jusibe
   * @description Sends sms using twilio api
   * @param {Object} details - details to be sent
   * @return {void}
   */
  "notification/jusibe"(details) {
    check(details, Object);
    const username = details.settings.api.jusibe.publicKey;
    const password = details.settings.api.jusibe.accessToken;
    const from = details.settings.api.jusibe.phoneNumber;
    form = {
      to: details.number,
      from: from || Reaction.getShopName(),
      message: details.message
    };
    request.post("https://jusibe.com/smsapi/send_sms", { form }, (err, res) => {
      if (res.statusCode === 200) {
        Logger.info("notification/jusibe", res.body);
      } else {
        Logger.warn("notification/jusibe", res.body);
      }
    })
    .auth(username, password, true);
  },


  /**
   * notification/postInApp
   * @description creates in app notification
   * when triggered
   * @param {String} type - type of notification
   * @param {String} message - message to be sent
   * @param {String} id - id of user to notify
   * @return {void}
   */
  "notification/postInApp"(type, message, id) {
    check(type, String);
    check(message, String);
    check(id, String);
    Collections.Notifications.insert({
      userId: id,
      type,
      read: false,
      message,
      createdAt: new Date()
    });
    Collections.Accounts.update({_id: id }, {$inc: {
      notificationCount: 1
    }});
  },

  /**
   * notification/getInApp
   * @description gets in app notification
   * when triggered
   * @param {String} userId - id of user
   * @param {String} limit - limit of notifications to get
   * @param {String} skip - notifications to skip
   * @return {Object} return user notification
   */
  "notification/getInApp"(userId, limit, skip = 0) {
    check(userId, String);
    check(limit, Number);
    check(skip, Number);
    const notifications = Collections.Notifications.find({userId}, { limit, skip, sort: {createdAt: -1 }}).fetch();
    return {
      notifications,
      limit
    };
  },

   /**
   * notification/deleteAll
   * @description deletes all notification
   * @return {Boolean} returns true
   */
  "notification/deleteAll"() {
    Collections.Notifications.remove({userId: Meteor.userId()});
    return true;
  },

  /**
   * notification/delete
   * @description deletes a single notification
   * @param {String} notificationId - notification to delete
   * @return {Boolean} returns true
   */
  "notification/delete"(notificationId) {
    check(notificationId, String);
    Collections.Notifications.remove({_id: notificationId});
    return true;
  },

  /**
   * notification/markRead
   * @description marks notification as read
   * @param {String} notificationId - notification to read
   * @return {Boolean} returns true
   */
  "notification/markRead"(notificationId) {
    check(notificationId, String);
    Collections.Notifications.update({_id: notificationId}, { $set: {
      read: true
    }});
    return true;
  },

  /**
   * notification/markRead
   * @description marks notification as read
   * @param {String} notificationId - notification to read
   * @return {Boolean} returns true
   */
  "notification/markReadAll"() {
    Collections.Notifications.update({userId: Meteor.userId()}, { $set: {
      read: true
    }}, {multi: true});
    return true;
  },

  /**
   * notification/getReadCount
   * @description gets notification counts
   * @param {String} notificationId - notification to delete
   * @return {Number} returns notification count
   */
  "notification/getReadCount"() {
    return Collections.Notifications.find({userId: Meteor.userId(), read: false})
      .count();
  },

  /**
   * notification/getInApp
   * @description gets in app notification
   * when triggered
   * @param {String} type - type of notification to send
   * @param {Object} details - information to be sent
   * @return {Object} return user notification
   */
  "notification/email"(type, details) {
    check(type, String);
    check(details, Object);
    const settings = Collections.Packages.findOne({
      name: "notification",
      shopId: Reaction.getShopId()
    }).settings.email;

    const message = settings.message[type];
    const shopDetails = Collections.Shops.findOne({_id: ReactionCore.getShopId()});
    const shopAdressBook = shopDetails.addressBook[0];
    const shop =  {
      name: shopAdressBook.company,
      address: `${shopAdressBook.address1} ${shopAdressBook.city}`,
      user: details.user,
      message: messageParser(message, details),
      url: details.url || Reaction.Router.url("/"),
      urlMessage: "Visit Us"
    };

    // parse email template
    SSR.compileTemplate("coreEmailTemplate", Assets.getText("email/emailNotification.html"));
    const html = SSR.render("coreEmailTemplate", shop);

    const smtpOptions = {
      host: settings.host,
      port: settings.port,
      secure: true,
      auth: {
        user: settings.user,
        pass: settings.password
      }
    };
    const transporter = Nodemailer.createTransport(SmtpTransport(smtpOptions));
    const mailOptions = {
      from: `👥 ${shopAdressBook.company} <${shopDetails.emails[0].address}>`,
      to: details.email,
      subject: type,
      html: html
    };
    transporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        Logger.warn("notification/email", err);
      } else {
        Logger.info("notification/email", "message sent", res);
      }
    });
  }
});