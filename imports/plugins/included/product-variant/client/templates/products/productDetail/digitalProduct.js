import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Products } from "/lib/collections";
// import "./review.html";

Template.digitalProduct.onRendered(function () {
  const digital = Products.findOne().isDigital;
  if (digital) {
    document.getElementById("digital").defaultChecked = true;
    document.getElementById("showUrl").style.display = "block";
  }
});

Template.digitalProduct.events({
  "click #digital": () => {
    const productId = Products.findOne()._id;
    if (document.getElementById("digital").checked) {
      document.getElementById("showUrl").style.display = "block";
      Meteor.call("products/updateProductField", productId, "isDigital", true);
    }    else {
      document.getElementById("showUrl").style.display = "none";
      Meteor.call("products/updateProductField", productId, "isDigital", false);
      Meteor.call("products/updateProductField", productId, "downloadUrl", "");
    }
  },

  "click #save": ()=>{
    downloadUrl = document.getElementById("url").value;
    const productId = Products.findOne()._id;
    if (downloadUrl) {
      Meteor.call("products/updateProductField", productId, "downloadUrl", downloadUrl);
    }
  }
});

Template.digitalProduct.helpers({
  downloadLink() {
    return Products.findOne().downloadUrl;
  }
});

Template.showDigitalDetail.onRendered(function () {
  const digital = Products.findOne().isDigital;
  const link =  Products.findOne().downloadUrl;
  if (digital && link) {
    document.getElementById("showDetails").style.display = "block";
  }
});
