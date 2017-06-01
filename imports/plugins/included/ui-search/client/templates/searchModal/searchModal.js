import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { ProductSearch, Tags, OrderSearch, AccountSearch } from "/lib/collections";
import { IconButton, SortableTable } from "/imports/plugins/core/ui/client/components";

/*
 * searchModal extra functions
 */
function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

/*
 * searchModal onCreated
 */
Template.searchModal.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    productSearchResults: [],
    tagSearchResults: []
  });
  const vendorChoice = Session.get("vendorChoice");

  // Allow modal to be closed by clicking ESC
  // Must be done in Template.searchModal.onCreated and not in Template.searchModal.events
  $(document).on("keyup", (event) => {
    if (event.keyCode === 27) {
      const view = this.view;
      $(".js-search-modal").fadeOut(400, () => {
        $("body").css("overflow", "visible");
        Blaze.remove(view);
      });
    }
  });

  this.autorun(() => {
    const searchCollection = this.state.get("searchCollection") || "products";
    const searchQuery = this.state.get("searchQuery");
    const facets = this.state.get("facets") || [];
    const sub = this.subscribe("SearchResults", searchCollection, searchQuery, facets);

    if (sub.ready()) {
      /*
       * Product Search
       */
      if (searchCollection === "products") {
        let productResults = ProductSearch.find().fetch();
        const productResultsCount = productResults.length;
        this.state.set("productSearchResults", productResults);
        this.state.set("productSearchCount", productResultsCount);

        if ((productResults.length > 0) && (searchQuery.length > 0)) {
          Session.set("foundSearchResult", true);
        } else {
          Session.set("foundSearchResult", false);
        }

        // get all vendors for products in search result
        let vendors = productResults.map((product) => {
          return product.vendor;
        });
        // if vendor is null, remove it
        vendors = vendors.filter((vendor) => {
          return vendor;
        });
        const productVendors = [...new Set(vendors)];
        Session.set("vendors", productVendors);

        if (vendorChoice !== "allVendors") {
          productResults = productResults.filter((product) => {
            return product.vendor === vendorChoice;
          });
        }
        console.log("vendors", productVendors);

        const hashtags = [];
        for (const product of productResults) {
          if (product.hashtags) {
            for (const hashtag of product.hashtags) {
              if (!_.includes(hashtags, hashtag)) {
                hashtags.push(hashtag);
              }
            }
          }
        }
        const tagResults = Tags.find({
          _id: { $in: hashtags }
        }).fetch();
        this.state.set("tagSearchResults", tagResults);

        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("orderSearchResults", "");
      }

      /*
       * Account Search
       */
      if (searchCollection === "accounts") {
        const accountResults = AccountSearch.find().fetch();
        const accountResultsCount = accountResults.length;
        this.state.set("accountSearchResults", accountResults);
        this.state.set("accountSearchCount", accountResultsCount);

        // TODO: Do we need this?
        this.state.set("orderSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }

      /*
       * Order Search
       */
      if (searchCollection === "orders") {
        const orderResults = OrderSearch.find().fetch();
        const orderResultsCount = orderResults.length;
        this.state.set("orderSearchResults", orderResults);
        this.state.set("orderSearchCount", orderResultsCount);


        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }
    }
  });
});


/*
 * searchModal helpers
 */
Template.searchModal.helpers({
  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      kind: "close",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow", "visible");
          Blaze.remove(view);
        });
      }
    };
  },
  // getProductVendors() {
  //   return Session.get("vendors");
  // },
  productSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("productSearchResults");
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    return results;
  },
  showSearchResults() {
    return false;
  },
  foundSearchResult() {
    return Session.get("foundSearchResult");
  },
  negativePrice() {
    return Session.get("negativePrice");
  },
  maxPriceGreater() {
    return Session.get("maxPriceGreater");
  }
});

Template.filterInput.helpers({
  getProductVendors() {
    return Session.get("vendors");
  }
});

/*
 * searchModal events
 */
Template.searchModal.events({
  "keyup input": (event, templateInstance) => {
    event.preventDefault();
    // initialize vendorChoice to allVendors
    Session.set("vendorChoice", "allVendors");
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
    $(".search-modal-header:not(.active-search)").addClass(".active-search");
    if (!$(".search-modal-header").hasClass("active-search")) {
      $(".search-modal-header").addClass("active-search");
    }
  },
  "click [data-event-action=filter]": function (event, templateInstance) {
    event.preventDefault();
    const instance = Template.instance();
    const facets = instance.state.get("facets") || [];
    const newFacet = $(event.target).data("event-value");

    tagToggle(facets, newFacet);

    $(event.target).toggleClass("active-tag btn-active");

    templateInstance.state.set("facets", facets);
  },
  "change [data-event-action=vendorFilter]": function (event, templateInstance) {
    event.preventDefault();

    const selectedOption = event.target.value;

    const products = ProductSearch.find().fetch();
    templateInstance.state.set("productSearchResults", products);
    const ProductArray = templateInstance.state.get("productSearchResults");

    console.log("selectedOption", selectedOption);

    if (selectedOption === "__default__") {
      templateInstance.state.set("productSearchResults", ProductArray);
    } else {
      const filterResult = ProductArray.filter(function (product) {
        return selectedOption === product.vendor;
      });

      // console.log(filterResult);

      templateInstance.state.set("productSearchResults", filterResult);
    }



    // switch (selectedOption) {
    //   case "lowtohigh":
    //     sortByPrice(ProductArray, false);
    //     break;

    //   case "hightolow":
    //     sortByPrice(ProductArray, true);
    //     break;

    //   case "atoz":
    //     sortByAlphabet(ProductArray, false);
    //     break;

    //   case "ztoa":
    //     sortByAlphabet(ProductArray, true);
    //     break;

    //   default:
    //     break;
    // }

    // templateInstance.state.set("productSearchResults", ProductArray);
  },
  "click [data-event-action=searchFilter]": function (event, templateInstance) {
    Session.set("maxPriceGreater", false);
    Session.set("negativePrice", false);

    event.preventDefault();
    const products = ProductSearch.find().fetch();
    templateInstance.state.set("productSearchResults", products);
    const ProductArray = templateInstance.state.get("productSearchResults");
    // console.log("product=====", ProductArray);
    const filterByMin = parseInt(templateInstance.find("#min-price-input").value);
    const filterByMax = parseInt(templateInstance.find("#max-price-input").value);
    // console.log("min price---", filterByMin, "max price", filterByMax);

    if ((isNaN(filterByMin)) || (isNaN(filterByMax))) {
      Session.set("negativePrice", true);
    } else {
      if (filterByMin > filterByMax) {
        Session.set("maxPriceGreater", true);
        // console.log("min price must be less than max price");
      } else if ((filterByMin < 0) || (filterByMax < 0)) {
        Session.set("negativePrice", true);
        // console.log("negative numbers not allowed");
      } else if ((filterByMin <= filterByMax) && (filterByMin > 0 || filterByMax > 0)) {
        const filterResult = ProductArray.filter(function (product) {
          return filterByMin <= product.price.min && filterByMax >= product.price.min ||
              filterByMin <= product.price.max && filterByMax >= product.price.max;
        });
        templateInstance.state.set("productSearchResults", filterResult);
      }
    }
  },
  "click [data-event-action=productClick]": function () {
    const instance = Template.instance();
    const view = instance.view;
    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  },
  "click [data-event-action=clearSearch]": function (event, templateInstance) {
    $("#search-input").val("");
    $("#search-input").focus();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
  },
  "click [data-event-action=searchCollection]": function (event, templateInstance) {
    event.preventDefault();
    const searchCollection = $(event.target).data("event-value");

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");

    $("#search-input").focus();

    templateInstance.state.set("searchCollection", searchCollection);
  }
});


/*
 * searchModal onDestroyed
 */
Template.searchModal.onDestroyed(() => {
  // Kill Allow modal to be closed by clicking ESC, which was initiated in Template.searchModal.onCreated
  $(document).off("keyup");
});
