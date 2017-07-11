import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";


export const TwilioPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.api.twilio.accSid": {
      type: String,
      label: "Account sid",
      optional: true
    },
    "settings.api.twilio.authToken": {
      type: String,
      label: "Authentication Token",
      optional: true
    },
    "settings.api.twilio.phoneNumber": {
      type: String,
      label: "Twilio Phone Number",
      optional: true
    }
  }
]);

export const JusibePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.api.jusibe.accessToken": {
      type: String,
      label: "Jusibe Access Token",
      optional: true
    },
    "settings.api.jusibe.publicKey": {
      type: String,
      label: "Jusibe Public Key",
      optional: true
    },
    "settings.api.jusibe.phoneNumber": {
      type: String,
      label: "Shop Name",
      optional: true
    }
  }
]);

export const EmailNotificationPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.email.host": {
      type: String,
      label: "Host",
      optional: true
    },
    "settings.email.port": {
      type: String,
      label: "Port",
      optional: true
    },
    "settings.email.user": {
      type: String,
      label: "Username",
      optional: true
    },
    "settings.email.password": {
      type: String,
      label: "Password",
      optional: true
    }
  }
]);

export const EmailMessagePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.email.message.payment": {
      type: String,
      label: "Payment",
      optional: true
    },
    "settings.email.message.wallet": {
      type: String,
      label: "Wallet",
      optional: true
    },
    "settings.email.message.transfer": {
      type: String,
      label: "Transfer",
      optional: true
    },
    "settings.email.message.cancel": {
      type: String,
      label: "Cancel",
      optional: true
    },
    "settings.email.message.shipped": {
      type: String,
      label: "Shipped",
      optional: true
    },
    "settings.email.message.failed": {
      type: String,
      label: "Failed",
      optional: true
    }
  }
]);

export const SmsMessagePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.api.message.payment": {
      type: String,
      label: "Payment",
      optional: true
    },
    "settings.api.message.wallet": {
      type: String,
      label: "Wallet",
      optional: true
    },
    "settings.api.message.transfer": {
      type: String,
      label: "Transfer",
      optional: true
    },
    "settings.api.message.cancel": {
      type: String,
      label: "Cancel",
      optional: true
    },
    "settings.api.message.shipped": {
      type: String,
      label: "Shipped",
      optional: true
    },
    "settings.api.message.failed": {
      type: String,
      label: "Failed",
      optional: true
    }
  }
]);

export const DefaultPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.default": {
      type: String,
      optional: true,
      defaultValue: "twilio",
      allowedValues: ["twilio", "jusibe"]
    }
  }
]);
