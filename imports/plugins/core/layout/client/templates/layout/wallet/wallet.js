/* eslint no-undef: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Accounts, Packages, Wallets, Shops } from "/lib/collections";

Template.wallet.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    details: { balance: 0, transactions: [] }
  });
  this.autorun(() => {
    this.subscribe("transactionDetails", Meteor.userId());
    const transactionInfo = Wallets.find().fetch();
    if (transactionInfo.length > 0) {
      this.state.set("details", transactionInfo[0]);
    }
  });
});

const getPaystackSettings = () => {
  const paystack = Packages.findOne({
    name: "paystack",
    shopId: Reaction.getShopId()
  });
  return {
    public: paystack.settings.publicKey || "pk_test_0c613403a8f83ef2f7ea900b5251be2bf480ad2f",
    secret: paystack.settings.secretKey || "sk_test_8782ef1ae2f57fad588b342f5429ee9c54a9de88"
  };
};

const finalizeDeposit = (paystackMethod) => {
  Meteor.call("wallet/transaction", Meteor.userId(), paystackMethod.transactions, (err, res) => {
    if (res) {
      document.getElementById("depositAmount").value = "";
      Alerts.toast("Your deposit was successful", "success");
    } else {
      Alerts.toast("An error occured, please try again", "error");
    }
  });
};

const getExchangeRate = () => {
  const shop = Shops.find(Reaction.getShopId()).fetch();
  return shop[0].currencies.NGN.rate;
};

function handlePayment(result) {
  const type = "deposit";
  const transactionId = result.reference;
  const paystackConfig = getPaystackSettings();
  HTTP.call("GET", `https://api.paystack.co/transaction/verify/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${paystackConfig.secret}`
    }
  }, function (error, response) {
    if (error) {
      Alerts.toast("Unable to verify payment", "error");
    } else if (response.data.data.status !== "success") {
      Alerts.toast("Payment was unsuccessful", "error");
    } else {
      const exchangeRate = getExchangeRate();
      const paystackResponse = response.data.data;
      paystackMethod = {
        processor: "Paystack",
        storedCard: paystackResponse.authorization.last4,
        method: "Paystack",
        transactionId: paystackResponse.reference,
        currency: paystackResponse.currency,
        amount: parseInt(paystackResponse.amount, 10),
        status: paystackResponse.status,
        mode: "authorize",
        createdAt: new Date()
      };
      if (type === "deposit") {
        paystackMethod.transactions = {
          amount: paystackResponse.amount / (100 * exchangeRate),
          referenceId: paystackResponse.reference,
          date: new Date(),
          transactionType: "Credit"
        };
        finalizeDeposit(paystackMethod);
      }
    }
  });
}

// Paystack payment
const payWithPaystack = (email, amount) => {
  const paystackConfig = getPaystackSettings();
  const handler = PaystackPop.setup({
    key: paystackConfig.public,
    email: email,
    amount: amount * 100,
    callback: handlePayment
  });
  handler.openIframe();
};

Template.wallet.events({
  "submit #deposit": (event) => {
    event.preventDefault();
    const accountDetails = Accounts.find(Meteor.userId()).fetch();
    const userMail = accountDetails[0].emails[0].address;
    const amount = parseInt(document.getElementById("depositAmount").value, 10);
    const mailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i;
    if (!mailRegex.test(userMail)) {
      Alerts.toast("Invalid email address", "error");
      return false;
    }
    payWithPaystack(userMail, amount);
  },

  "submit #transfer": (event) => {
    event.preventDefault();
    const exchangeRate = getExchangeRate();
    const amount = parseInt(document.getElementById("transferAmount").value, 10) / exchangeRate;
    if (amount > Template.instance().state.get("details").balance) {
      Alerts.toast("Insufficient Balance", "error");
      return false;
    }
    const recipient = document.getElementById("recipient").value;
    const transaction = { amount, to: recipient, date: new Date(), transactionType: "Debit" };
    Meteor.call("wallet/transaction", Meteor.userId(), transaction, (err, res) => {
      if (res === 2) {
        Alerts.toast(`No user with email ${recipient}`, "error");
      } else if (res === 1) {
        document.getElementById("recipient").value = "";
        document.getElementById("transferAmount").value = "";
        Alerts.toast("The transfer was successful", "success");
      } else {
        Alerts.toast("An error occured, please try again", "error");
      }
    });
  }
});

Template.wallet.helpers({
  balance() {
    return Template.instance().state.get("details").balance;
  },

  getTransactions() {
    const transactions = Template.instance().state.get("details").transactions;
    if (transactions.length > 0) {
      return transactions;
    }
    return false;
  },

  formatDate(date) {
    return moment(date).format("dddd, MMMM Do YYYY, h:mm:ssa");
  }
});
