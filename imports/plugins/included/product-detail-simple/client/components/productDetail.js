import React, { Component, PropTypes } from "react";
import {
  Button,
  Currency,
  DropDownMenu,
  MenuItem,
  Translation,
  Toolbar,
  ToolbarGroup
} from "/imports/plugins/core/ui/client/components/";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField
} from "./";
import { AlertContainer } from "/imports/plugins/core/ui/client/containers";
import { PublishContainer } from "/imports/plugins/core/revisions";
import { Accounts } from "/lib/collections";
import { vendorTour } from "/imports/plugins/included/tour/client/vendorTour";

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDigital: false,
      downloadUrl: ""
    };
    this.onDigitalChange = this.onDigitalChange.bind(this);
    this.isDigital = this.isDigital.bind(this);
    this.onDigitalSaveClick = this.onDigitalSaveClick.bind(this);
  }

  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }
  componentDidMount() {
    const currentUser = Accounts.findOne(Meteor.userId());

    if (Meteor.user().emails.length > 0 && !currentUser.takenVendorTour) {
      vendorTour();
      Accounts.update({_id: Meteor.userId()}, {$set: {takenVendorTour: true}});
    }
  }

  onTourClick() {
    vendorTour();
  }

  handleVisibilityChange = (event, isProductVisible) => {
    if (this.props.onProductFieldChange) {
      this.props.onProductFieldChange(this.product._id, "isVisible", isProductVisible);
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "delete" && this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.product._id);
    }
  }

  renderToolbar() {
    if (this.props.hasAdminPermission) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <Translation defaultValue="Product Management" i18nKey="productDetail.productManagement" />
          </ToolbarGroup>
          <ToolbarGroup>
            <DropDownMenu
              buttonElement={<Button label="Switch" />}
              onChange={this.props.onViewContextChange}
              value={this.props.viewAs}
            >
              <MenuItem label="Administrator" value="administrator" />
              <MenuItem label="Customer" value="customer" />
            </DropDownMenu>
          </ToolbarGroup>
          <button className="btn btn-primary" onClick={this.onTourClick}>
            Learn to Sell
          </button>
          <ToolbarGroup lastChild={true}>
            <PublishContainer
              documentIds={[this.product._id]}
              documents={[this.product]}
              onVisibilityChange={this.handleVisibilityChange}
              onAction={this.handlePublishActions}
            />
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return null;
  }

  isDigital() {
    this.setState({ showDigital: true });
  }

  onDigitalSaveClick() {
    if (this.state.downloadUrl == '') {
      document.getElementById('digital').checked = false;
    } else {
      this.props.onProductFieldChange(this.product._id, "downloadUrl", this.state.downloadUrl);
      this.props.onProductFieldChange(this.product._id, "isDigital", true);
      document.getElementById('digital').checked = true;
      this.setState({ showDigital: false });
    }
  }
  onDigitalChange(e) {
    this.setState({ downloadUrl: e.target.value });
  }

  render() {
    return (
      <div className="" style={{ position: "relative" }}>
        {this.renderToolbar()}
        <div className="container-main container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <AlertContainer placement="productManagement" />

          <header className="pdp header">
            <ProductField
              editable={this.editable}
              fieldName="title"
              fieldTitle="Title"
              element={<h1 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.title",
                placeholder: "Title"
              }}
            />

            <ProductField
              editable={this.editable}
              fieldName="pageTitle"
              fieldTitle="Sub Title"
              element={<h2 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.pageTitle",
                placeholder: "Subtitle"
              }}
            />
          </header>


          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              {this.props.mediaGalleryComponent}
              <ProductTags editable={this.props.editable} product={this.product} tags={this.tags} />
              <ProductMetadata editable={this.props.editable} product={this.product} />
            </div>

            <div className="pdp column right pdp-right-column">


              <div className="pricing">
                <div className="left">
                  <span className="price">
                    <span id="price">
                      <Currency amount={this.props.priceRange} />
                    </span>
                  </span>
                </div>
                <div className="right">
                  {this.props.socialComponent}
                </div>
              </div>


              <div className="vendor">
                <ProductField
                  editable={this.editable}
                  fieldName="vendor"
                  fieldTitle="Vendor"
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.vendor",
                    placeholder: "Vendor"
                  }}
                />
              </div>
              <div className="pdp product-info">
                <ProductField
                  editable={this.editable}
                  fieldName="description"
                  fieldTitle="Description"
                  multiline={true}
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.description",
                    placeholder: "Description"
                  }}
                />
              </div>
              {this.props.hasAdminPermission && <div className="digitalProduct">
                <div className="checkbox">
                  <h3><input id="digital" type="checkbox" value="" onChange={() => this.isDigital()} />Digital Product</h3>
                </div>
              </div>}

              {this.state.showDigital &&
                <div className="digitalProduct">
                  <div className="checkbox">
                    <input type="text" id="url" value={this.state.downloadUrl}
                      onChange={this.onDigitalChange} placeholder="Enter download url" />
                    <button id="save" className="btn btn-success pull-right" onClick={this.onDigitalSaveClick}>Save</button>

                  </div>
                </div>
              }

              <div className="options-add-to-cart">
                {this.props.topVariantComponent}
              </div>
              <hr />
              <div>
                <AlertContainer placement="productDetail" />
                <AddToCartButton
                  cartQuantity={this.props.cartQuantity}
                  onCartQuantityChange={this.props.onCartQuantityChange}
                  onClick={this.props.onAddToCart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProductDetail.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool,
  hasAdminPermission: PropTypes.bool,
  mediaGalleryComponent: PropTypes.node,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onDeleteProduct: PropTypes.func,
  onProductFieldChange: PropTypes.func,
  onViewContextChange: PropTypes.func,
  priceRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  product: PropTypes.object,
  socialComponent: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.object),
  topVariantComponent: PropTypes.node,
  viewAs: PropTypes.string
};

export default ProductDetail;



