import { Meteor } from "meteor/meteor";
import { Wallets, Accounts } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { check } from "meteor/check";

Meteor.methods({

  /**
  * wallet/deposit method to deposit money into user's account
  * @param {string} userId the id of the user
  * @param {object} transactions details of the transaction
  * @return {boolean} true or false if the db operation was successful
  */
  "wallet/transaction": (userId, transactions) => {
    check(userId, String);
    check(transactions, Schemas.Transaction);
    let balanceOptions;
    const { amount, transactionType } = transactions;
    console.log({ amount, transactionType }, "AMOUNT HERE");
    if (transactionType === "Credit") {
      balanceOptions = { balance: amount };
    }
    if (transactionType === "Debit") {
      if (transactions.to) {
        const recipient = Accounts.findOne({ "emails.0.address": transactions.to });
        const sender = Accounts.findOne(userId);
        if (!recipient) {
          return 2;
        }
        // deposit for the recipient
        Meteor.call("wallet/transaction", recipient._id, {
          amount,
          from: sender.emails[0].address,
          date: new Date(),
          transactionType: "Credit"
        });
      }
      balanceOptions = { balance: -amount };
    }

    try {
      Wallets.update({ userId }, { $push: { transactions: transactions }, $inc: balanceOptions }, { upsert: true });
      return 1;
    } catch (error) {
      return 0;
    }
  }
});
