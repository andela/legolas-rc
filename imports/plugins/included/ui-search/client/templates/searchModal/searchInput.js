import { Template } from "meteor/templating";
import { ProductSearch } from "/lib/collections";

Template.searchInput.helpers({
  settings: function () {
    return {
      position: "bottom",
      limit: 5,
      rules: [
        {
          token: "",
          collection: ProductSearch,
          field: "title",
          options: "i",
          sort: true,
          matchAll: true,
          template: Template.searchResult,
          noMatchTemplate: Template.noResult
        }
      ]
    };
  }
});
