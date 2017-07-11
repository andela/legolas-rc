/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "NotificationBoard",
  name: "notification",
  icon: "fa fa-bullhorn",
  autoEnable: true,
  settings: {
    default: "twilio",
    api: {
      twilio: {
        authToken: "",
        accSid: "",
        phoneNumber: ""
      },
      jusibe: {
        publicKey: "",
        accessToken: "",
        phoneNumber: ""
      },
      message: {
        payment: "",
        wallet: "",
        cancel: "",
        transfer: "",
        failed: ""
      }
    },
    email: {
      host: "",
      port: "",
      user: "",
      password: "",
      message: {
        payment: "",
        wallet: "",
        transfer: "",
        cancel: "",
        failed: ""
      }
    }
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Notification",
      description: "Notification settings",
      icon: "fa fa-bullhorn",
      priority: 3,
      container: "core"
    },

    // Settings panel
    {
      label: "Notification Settings",
      route: "/dashboard/notification",
      provides: "settings",
      container: "dashboard",
      template: "notificationSettings"
    }
  ]
});
