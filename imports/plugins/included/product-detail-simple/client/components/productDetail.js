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
import { Meteor } from "meteor/meteor";
import * as Collections from "/lib/collections";

class ProductDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDigital: false,
      productPaid: ""
    };

    this.isDigital = this.isDigital.bind(this);
  }
  componentWillMount() {
    if (this.getUserOrders()) {
      console.log(this.getUserOrders().indexOf(this.product._id));
      this.setState({ productPaid: this.getUserOrders().indexOf(this.product._id) });
    }
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

  getUserOrders() {
    const orderSub = Meteor.subscribe("AccountOrders", Meteor.userId());
    if (orderSub.ready()) {
      return Collections.Orders.find({
        userId: Meteor.userId()
      }, {
          sort: {
            createdAt: -1
          },
          limit: 25
        }).fetch();
    }
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

    this.setState({ showDigital: !this.state.showDigital });
  }
  productOrder() {

  }

  render() {
    const user = Meteor.user();
    const rolesObj = user.roles;
    const key = Object.keys(rolesObj);
    console.log('user',user)
    const roles = rolesObj[key[0]];
    const isAdmin = roles.indexOf("admin") !== -1;
    console.log(isAdmin);
    if (this.getUserOrders()) {
      console.log(this.getUserOrders().indexOf(this.product._id));
      //this.setState({productPaid: this.getUserOrders().indexOf(this.product._id) });
    }
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
              Check him again
              {this.props.hasAdminPermission && <div className="digitalProduct">
                <div className="checkbox">
                  <h3><input id="digital" type="checkbox" value="" onChange={() => this.isDigital()} />Digital Product</h3>
                </div>
              </div>}

              {this.state.showDigital &&
                <div className="digitalProduct">
                  <div className="checkbox">
                    <input type="text" id="url" placeholder="Enter download url" />
                    <button id="save" className="btn btn-success pull-right">Save</button>

                  </div>
                </div>
              }
              {this.state.productPaid > 0 &&
                <div>
                  <a href="http://downloadLink"><h5>Download url: {'downloadLink'}</h5></a>
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



