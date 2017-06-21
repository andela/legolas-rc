export function vendorTour() {
  const intro = introJs();

  intro.setOptions({
    steps: [
      {
        intro: "Welcome to Legolas RC Vendor Onboarding!!!"
      },
      {
        element: document.querySelectorAll(".admin-controls-quicklinks button")[0],
        intro: "You can click me to add another product."
      },
      {
        element: document.querySelectorAll(".product-detail-edit.title-edit")[0],
        intro: "Fill your product title here"
      },
      {
        element: document.querySelectorAll(".pageTitle-edit-input")[0],
        intro: "Fill the product subtitle here"
      },
      {
        element: document.querySelectorAll(".media-gallery")[0],
        intro: "Click me to add product images"
      },
      {
        element: document.querySelectorAll(".form-group textarea")[0],
        intro: "Add a product description here"
      },
      {
        element: document.querySelectorAll(".toolbar-group.right button")[0],
        intro: "Click me to toggle the visibility of your product"
      },
      {
        element: document.querySelectorAll(".rui.btn-toolbar div.btn-group button")[0],
        intro: "Click me to save the product"
      },
      {
        intro: "Got it, Continue Selling"
      }
    ]
  });
  intro.start();
}
