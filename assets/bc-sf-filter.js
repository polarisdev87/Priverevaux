// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        // Optional
        loadProductFirst: true
    }
};

// Declare Templates
var bcSfFilterTemplate = {
    'soldOutClass': 'sold-out',
    'saleClass': 'on-sale',
    'textCenterClass': 'text-center',
    'imageSoldOutClass': 'grid-link__image-sold-out',
    'vendorHtml': '<p class="grid-link__title grid-link__vendor">{{itemVendorLabel}}</p>',

    // Grid Template
    'productGridItemHtml': '<div class="grid__item ' + bcSfFilterConfig.custom.grid_item_width + ' related-cart">' +
                                '<div class="{{itemSoldOutClass}} {{itemSaleClass}} text-center">' +
                                    '<a href="{{itemUrl}}" class="grid-link {{textCenterClass}}">' +
                                        '<span class="grid-link__image {{imageSoldOutClass}} grid-link__image--product">' +
                                            '{{itemSaleLabel}}' +
                                            '{{itemSoldOutLabel}}' +
                                            '<span class="grid-link__image-centered">' +
                                                '{{imageStyle}}' +
                                                '{{itemImages}}' +
                                            '</span>' +
                                        '</span>' +
                                    '</a>' +
                                    '{{itemSwatch}}' +
                                    '<p class="grid-link__title">{{itemTitle}}{{itemLabel}}</p>' +
                                    '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>' +
                                    '<button class="swym-button swym-add-to-wishlist-view-product product_{{itemId}}" data-swaction="addToWishlist" data-product-id="{{itemId}}"></button>' +
                                    '{{itemVendor}}' +
                                    '{{itemPrice}}' +
                                '</div>' +
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<li><a href="{{itemUrl}}">&larr;</a></li>',
    'previousDisabledHtml': '<li class="disabled"><span>&larr;</span></li>',
    'nextActiveHtml': '<li><a href="{{itemUrl}}">&rarr;</a></li>',
    'nextDisabledHtml': '<li class="disabled"><span>&rarr;</span></li>',
    'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
    'pageItemSelectedHtml': '<li><span class="active">{{itemTitle}}</span></li>',
    'pageItemRemainHtml': '<li><span>{{itemTitle}}</span></li>',
    'paginateHtml': '<ul class="pagination-custom">{{previous}}{{pageItems}}{{next}}</ul>',
  
    // Sorting Template
    'sortingHtml': '<label>' + bcSfFilterConfig.label.sorting + '</label><select>{{sortingItems}}</select>',
};

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    /*** Prepare data ***/
    var images = data.images_info;
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100; // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Add soldOut class
    var itemSoldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutClass}}/g, itemSoldOutClass);
  
    // Add onSale class
    var itemSaleClass = onSale ? bcSfFilterTemplate.saleClass : '';
    itemHtml = itemHtml.replace(/{{itemSaleClass}}/g, itemSaleClass);
  
    var textCenterClass = bcSfFilterConfig.custom.center_grid_link ? bcSfFilterTemplate.textCenterClass: '';
    itemHtml = itemHtml.replace(/{{textCenterClass}}/g, textCenterClass);

    var imageSoldOutClass = bcSfFilterConfig.custom.show_sold_out_circle ? bcSfFilterTemplate.imageSoldOutClass: '';
    itemHtml = itemHtml.replace(/{{imageSoldOutClass}}/g, imageSoldOutClass);
  
    // Add Image style
    var imageStyle = '';
    var itemImagesHtml = '';
    if (data.title != '') {
        if (images.length > 0) {
            var img_id = 'ProductImage-' + images[0]['id'];
            var wrapper_id = 'ProductImageWrapper-' + images[0]['id'] + '';

            var width = bcSfFilterConfig.custom.product_width;
            var height = 480;
            var aspect_ratio = images[0]['width'] / images[0]['height'];

            var max_width = height * aspect_ratio;
            if (images[0]['height'] < height) {
                var max_height = images[0]['height'];
                max_width = images[0]['width'];
            } else {
                var max_height = width / aspect_ratio;
                if (images[0]['width'] < width) {
                    var max_height = images[0]['height'];
                    max_width = images[0]['width'];
                } else {
                    max_width = width;
                }
            }

            imageStyle = '<style>' +        
                            '#' + img_id + ' {' +
                                'max-width: ' + max_width + 'px;' +
                                'max-height: ' + max_height + 'px;' +
                            '}' +
                            '#' + wrapper_id + ' {' +
                                'max-width: ' + max_width + 'px;' +
                            '}' +
                        '</style>';

            var img_url = this.optimizeImage(images[0]['src'], '{width}x');
            itemImagesHtml += '<div id="' + wrapper_id + '" class="product__img-wrapper supports-js">';
            itemImagesHtml += '<div style="padding-top:' + ( 1 / aspect_ratio * 100) + '%;">' +
                                '<img ' +
                                      'class="product__img lazyload" ' +
                                      'src="' + this.optimizeImage(images[0]['src'], '300x300') + '" ' +
                                      'data-src="' + img_url + '" ' +
                                      'data-widths="[150, 220, 360, 470, 600, 750, 940, 1080, 1296, 1512, 1728, 2048]" ' +
                                      'data-aspectratio="' + aspect_ratio + '" ' +
                                      'data-sizes="auto" '+
                                      'alt="{{itemTitle}}">' +
                              '</div>';
            itemImagesHtml += '</div>';
        } else {
            itemImagesHtml += '<img src="' + bcSfFilterConfig.general.no_image_url + '" alt="{{itemTitle}}" class="product__img">';
        }
    } else {
        if (counter == 7) counter = 1;
        if (bcSfFilterConfig.custom.hasOwnProperty('placeholder_svg_tag_' + counter)) {
            itemImagesHtml += bcSfFilterConfig['custom']['placeholder_svg_tag_' + counter];
        }
        counter++;
    }
    itemHtml = itemHtml.replace(/{{imageStyle}}/g, imageStyle);
    itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);

  	// Add Best Seller label
  	var itemBestSellerLabelHtml = '';
  	if(data.tags){
      	if(data.tags.indexOf('Best Seller') > -1){
          	itemBestSellerLabelHtml += '<span class="badge badge--sale badge--best-seller"><span class="badge__text">Best Seller</span></span>';
        }
    }
  	itemHtml = itemHtml.replace(/{{itemBestSellerLabel}}/g, itemBestSellerLabelHtml);
  
    // Add onSale label
    var itemSaleLabelHtml = '';
    if (onSale && bcSfFilterConfig.custom.show_sale_circle) {
        itemSaleLabelHtml = '<span class="badge badge--sale">';
        if (bcSfFilterConfig.label.sale.length > 7) {
            itemSaleLabelHtml += '<span class="badge__text badge__text--small">';
        } else {
            itemSaleLabelHtml += '<span class="badge__text">';
        }
        itemSaleLabelHtml += bcSfFilterConfig.label.sale + '</span></span>';
    }
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);

    // Add soldOut label
    var itemSoldOutLabeHtml = '';
    if (soldOut && bcSfFilterConfig.custom.show_sold_out_circle) {
        itemSoldOutLabeHtml = '<span class="badge badge--sold-out">';
        if (bcSfFilterConfig.label.sold_out.length > 9) {
            itemSoldOutLabeHtml += '<span class="badge__text badge__text--small">';
        } else {
            itemSoldOutLabeHtml += '<span class="badge__text">';
        }
        itemSoldOutLabeHtml += bcSfFilterConfig.label.sold_out + '</span></span>';
    }
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabeHtml);

  	// Add itemlabel
  	var itemLabelHtml = '';
  	if(data.tags){
      	if(data.tags.indexOf('RandM') > -1){
          	itemLabelHtml += ' <small><span>RandM</span></small>';
        } else if(data.tags.indexOf('Ultemate') > -1){
          	itemLabelHtml += ' <small><span>U</span></small>';
        }
    }
  	itemHtml = itemHtml.replace(/{{itemLabel}}/g, itemLabelHtml);
  
    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Price
    var itemPriceHtml = '';
    if (data.title != '')  {
        itemPriceHtml += '<p class="grid-link__meta">';
        if (onSale) {
            itemPriceHtml += '<s class="grid-link__sale_price">' + this.formatMoney(data.compare_at_price_min, this.moneyFormat) + '</s> ';
        }
        if (priceVaries) {
            itemPriceHtml += (bcSfFilterConfig.label.from_price).replace(/{{ price }}/g, this.formatMoney(data.price_min, this.moneyFormat));
        } else {
            itemPriceHtml += this.formatMoney(data.price_min, this.moneyFormat);
        }
        itemPriceHtml += '</p>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

  	var itemSwatchHtml = '';
    var optionIndex = data.options_with_values.findIndex(function(e) { return e.name == 'color'; });
    var options = data.options_with_values.filter(function(e) { return (e.name).toLowerCase() == 'color'; });
    if (typeof options[0] !== 'undefined') {

        var avaiVariants = [];
        for (var i = 0; i < data['variants'].length; i ++) {
            if (data['variants'][i].hasOwnProperty('option_color')) {
                if (avaiVariants.indexOf(data['variants'][i]['option_color']) == -1) {
                    avaiVariants.push(data['variants'][i]['option_color']);
                }
            }
        }
        for (var k = 0; k < avaiVariants.length; k++) {
            var option = options[0]['values'].filter(function(e) { return e.title == avaiVariants[k]; });
            var imageIndex = option[0]['image'];
            var variantImage = typeof data['images'][imageIndex] !== 'undefined' ? this.optimizeImage(data['images'][imageIndex]) : bcSfFilterConfig.general.no_image_url;
            itemSwatchHtml += '<img src="' + bcSfFilterConfig.general.asset_url.replace('bc-sf-filter.js', this.slugify(avaiVariants[k]) + '.png') + '" alt="' + avaiVariants[k] + '" width="24" height="24" data-product-id="" data-main-image="' + variantImage + '" class="br-50 atc-swatch" /> ';
          	
        }
    }
	itemHtml = itemHtml.replace(/{{itemSwatch}}/g, itemSwatchHtml);
  
    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
};

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.bottomPagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage = 0; iPage < pageArr.length; iPage++) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.bottomPagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Breadcrumb
BCSfFilter.prototype.buildBreadcrumb = function(colData, apiData) {
    if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
        var colInfo = colData.collection;
        var breadcrumbHtml = '<a href="/" title="' + bcSfFilterConfig.label.breadcrumb_home_link + '">' + bcSfFilterConfig.label.breadcrumb_home + '</a>';
        breadcrumbHtml += ' <span aria-hidden="true" class="breadcrumb__sep">&rsaquo;</span>';
        if (bcSfFilterConfig.general.current_tags !== null) {
            var currentTags = bcSfFilterConfig.general.current_tags;
            breadcrumbHtml += ' <a href="/collections/' + colInfo.handle + '">' + colInfo.title + '</a>';
            breadcrumbHtml += ' <span aria-hidden="true" class="breadcrumb__sep">&rsaquo;</span>';
            breadcrumbHtml += ' <span>' + currentTags.join(' + ') + '</span>';
        } else {
            breadcrumbHtml += ' <span>' + colInfo.title + '</span>';
        }
        jQ('.breadcrumb').html(breadcrumbHtml);
    }
};

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data) {};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
          /* Start Initialize BC QuickView */
          if (typeof(bcQuickView) !== 'undefined') {
            if(typeof(bcQuickViewParams) !== 'undefined') {
              bcQuickView.init(bcQuickViewParams);
            } else {
              bcQuickView.init();
            }
          }
          /* End Initialize BC QuickView */
  
  	!function(){var e=function(e){var t={exports:{}};return e.call(t.exports,t,t.exports),t.exports};e(function(){"use strict";window.innerShiv=function(){function e(e,t,r){return/^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test(r)?e:t+"></"+r+">"}var t,r,a=document,i="abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video".split(" ");return function(n,s){if(!t&&(t=a.createElement("div"),t.innerHTML="<nav></nav>",r=1!==t.childNodes.length)){for(var o=a.createDocumentFragment(),d=i.length;d--;)o.createElement(i[d]);o.appendChild(t)}if(n=n.replace(/^\s\s*/,"").replace(/\s\s*$/,"").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"").replace(/(<([\w:]+)[^>]*?)\/>/g,e),t.innerHTML=(o=n.match(/^<(tbody|tr|td|col|colgroup|thead|tfoot)/i))?"<table>"+n+"</table>":n,o=o?t.getElementsByTagName(o[1])[0].parentNode:t,!1===s)return o.childNodes;for(var d=a.createDocumentFragment(),u=o.childNodes.length;u--;)d.appendChild(o.firstChild);return d}}()});(function(){window.SPR=function(){function e(){}return e.shop=Shopify.shop,e.host="//productreviews.shopifycdn.com",e.version="v4",e.api_url=e.host+"/proxy/"+e.version,e.badgeEls=[],e.reviewEls=[],e.elSettings={},e.$=void 0,e.extraAjaxParams={shop:e.shop},e.registerCallbacks=function(){return this.$(document).bind("spr:badge:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onBadgeLoad:void 0),this.$(document).bind("spr:product:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onProductLoad:void 0),this.$(document).bind("spr:reviews:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onReviewsLoad:void 0),this.$(document).bind("spr:form:loaded","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormLoad:void 0),this.$(document).bind("spr:form:success","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormSuccess:void 0),this.$(document).bind("spr:form:failure","undefined"!=typeof SPRCallbacks&&null!==SPRCallbacks?SPRCallbacks.onFormFailure:void 0)},e.loadStylesheet=function(){var e,t;return t=document.createElement("link"),t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),t.setAttribute("href","https://productreviews.shopifycdn.com/assets/v4/spr-5a2d2fd286dca8042a3a5a76bc9032c64c52a2792a734307c76740d012641514.css"),t.setAttribute("media","screen"),e=document.getElementsByTagName("head")[0],e.appendChild(t)},e.initRatingHandler=function(){return e.$(document).on("mouseover mouseout","form a.spr-icon-star",function(t){var r,a,i;return r=t.currentTarget,i=e.$(r).attr("data-value"),a=e.$(r).parent(),"mouseover"===t.type?(a.find("a.spr-icon:lt("+i+")").addClass("spr-icon-star-hover"),a.find("a.spr-icon:gt("+(i-1)+")").removeClass("spr-icon-star-hover")):a.find("a.spr-icon").removeClass("spr-icon-star-hover")})},e.initDomEls=function(){return this.badgeEls=this.$(".shopify-product-reviews-badge[data-id]"),this.reviewEls=this.$("#shopify-product-reviews[data-id]"),this.$.each(this.reviewEls,function(e){return function(t,r){var a;return a=e.$(r).attr("data-id"),e.elSettings[a]={},e.elSettings[a].reviews_el="#"+(e.$(r).attr("data-reviews-prefix")?e.$(r).attr("data-reviews-prefix"):"reviews_"),e.elSettings[a].form_el="#"+(e.$(r).attr("data-form-prefix")?e.$(r).attr("data-form-prefix"):"form_")}}(this))},e.loadProducts=function(){return this.$.each(this.reviewEls,function(e){return function(t,r){var a,i;if(a=e.$(r).attr("data-id"),"false"!==e.$(r).attr("data-autoload"))return i=e.$.extend({product_id:a,version:e.version},e.extraAjaxParams),e.$.get(e.api_url+"/reviews/product",i,e.productCallback,"jsonp")}}(this))},e.loadBadges=function(){var e,t,r,a,i;if(r=this.$.map(this.badgeEls,function(e){return function(t){return e.$(t).attr("data-id")}}(this)),r.length>0){for(t=7,i=[];(e=r.splice(0,t)).length>0;)a=this.$.extend(this.extraAjaxParams,{product_ids:e}),i.push(this.$.get(this.api_url+"/reviews/badges",a,this.badgesCallback,"jsonp"));return i}},e.pageReviews=function(e){var t,r,a;return a=this.$(e).data("product-id"),r=this.$(e).data("page"),t=this.$.extend({page:r,product_id:a},this.extraAjaxParams),this.$.get(this.api_url+"/reviews",t,this.paginateCallback,"jsonp"),!1},e.submitForm=function(e){var t;return t=this.$(e).serializeObject(),t=this.$.extend(t,this.extraAjaxParams),t=this.$.param(t),t=t.replace(/%0D%0A/g,"%0A"),this.$.ajax({url:this.api_url+"/reviews/create",type:"GET",dataType:"jsonp",data:t,success:this.formCallback,beforeSend:function(e){return function(){return e.$(".spr-button-primary").attr("disabled","disabled")}}(this),complete:function(e){return function(){return e.$(".spr-button-primary").removeAttr("disabled")}}(this)}),!1},e.reportReview=function(e){var t;return confirm("Are you sure you want to report this review as inappropriate?")&&(t=this.$.extend({id:e},this.extraAjaxParams),this.$.get(this.api_url+"/reviews/report",t,this.reportCallback,"jsonp")),!1},e.toggleReviews=function(e){var t;return t=this.$("#shopify-product-reviews[data-id='"+e+"']"),t.find(".spr-reviews").toggle()},e.toggleForm=function(e){var t;return t=this.$("#shopify-product-reviews[data-id='"+e+"']"),t.find(".spr-form").toggle()},e.setRating=function(e){var t,r,a;return t=this.$(e).parents("form"),a=this.$(e).attr("data-value"),r=this.$(e).parent(),t.find("input[name='review[rating]']").val(a),this.setStarRating(a,r)},e.setStarRating=function(e,t){return t.find("a:lt("+e+")").removeClass("spr-icon-star-empty spr-icon-star-hover"),t.find("a:gt("+(e-1)+")").removeClass("spr-icon-star-hover").addClass("spr-icon-star-empty")},e.badgesCallback=function(t){var r;return r=t.badges,e.$.map(e.badgeEls,function(t){var a;if(a=e.$(t).attr("data-id"),r[a]!==undefined)return e.$(t).replaceWith(r[a]),e.triggerEvent("spr:badge:loaded",{id:a})})},e.productCallback=function(t){var r;return r=t.remote_id.toString(),e.renderProduct(r,t.product),e.renderForm(r,t.form),e.renderReviews(r,t.reviews)},e.renderProduct=function(e,t){return this.$.map(this.reviewEls,function(r){return function(a){if(e===r.$(a).attr("data-id"))return r.$(a).html(innerShiv(t,!1)),r.triggerEvent("spr:product:loaded",{id:e})}}(this))},e.renderForm=function(e,t){var r;return r=this.$(this.elSettings[e].form_el+e),r.html(t),this.triggerEvent("spr:form:loaded",{id:e})},e.renderReviews=function(t,r){var a;return a=e.$(e.elSettings[t].reviews_el+t),a.html(r),e.triggerEvent("spr:reviews:loaded",{id:t})},e.formCallback=function(t){var r,a,i,n;return n=t.status,i=t.remote_id,a=t.form,r=e.$(e.elSettings[i].form_el+i),r.html(a),"failure"===n&&e.initStarRating(r),"success"===n&&e.$("#shopify-product-reviews[data-id='"+i+"'] .spr-summary-actions-newreview").hide(),e.triggerEvent("spr:form:"+n,{id:i})},e.initStarRating=function(e){var t,r,a;if((a=e.find("input[name='review[rating]']"))&&a.val())return r=a.val(),t=e.find(".spr-starrating"),this.setStarRating(r,t)},e.paginateCallback=function(t){var r,a;return a=t.remote_id.toString(),r=t.reviews,e.renderReviews(a,r)},e.reportCallback=function(t){var r;return r="#report_"+t.id,e.$(r).replaceWith("<span class='spr-review-reportreview'>"+e.$(r).attr("data-msg")+"</span>")},e.loadjQuery=function(t){return e.loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js",function(){return e.$=jQuery.noConflict(!0),t()})},e.loadScript=function(e,t){var r;return r=document.createElement("script"),r.type="text/javascript",r.readyState?r.onreadystatechange=function(){if("loaded"===r.readyState||"complete"===r.readyState)return r.onreadystatechange=null,t()}:r.onload=function(){return t()},r.src=e,document.getElementsByTagName("head")[0].appendChild(r)},e.loadjQueryExtentions=function(e){return e.fn.serializeObject=function(){var t,r;return t={},r=this.serializeArray(),e.each(r,function(){return t[this.name]?(t[this.name].push||(t[this.name]=[t[this.name]]),t[this.name].push(this.value||"")):t[this.name]=this.value||""}),t}},e.triggerEvent=function(e,t){return this.$(document).trigger(e,t)},e}(),function(){SPR.loadStylesheet(),SPR.loadjQuery(function(){return SPR.$.ajaxSetup({cache:!1}),SPR.loadjQueryExtentions(SPR.$),SPR.$(document).ready(function(){return SPR.registerCallbacks(),SPR.initRatingHandler(),SPR.initDomEls(),SPR.loadProducts(),SPR.loadBadges()})})}()}).call(this)}("undefined"!=typeof global?global:"undefined"!=typeof window&&window);
  
  theme.equalHeights($('.grid-link__image--product'));
}

function buildDefaultLink(a,b){var c=window.location.href.split("?")[0];return c+="?"+a+"="+b}BCSfFilter.prototype.buildDefaultElements=function(a){if(bcSfFilterConfig.general.hasOwnProperty("collection_count")&&jQ("#bc-sf-filter-bottom-pagination").length>0){var b=bcSfFilterConfig.general.collection_count,c=parseInt(this.queryParams.page),d=Math.ceil(b/this.queryParams.limit);if(1==d)return jQ(this.selector.pagination).html(""),!1;if("default"==this.getSettingValue("general.paginationType")){var e=bcSfFilterTemplate.paginateHtml,f="";f=c>1?bcSfFilterTemplate.hasOwnProperty("previousActiveHtml")?bcSfFilterTemplate.previousActiveHtml:bcSfFilterTemplate.previousHtml:bcSfFilterTemplate.hasOwnProperty("previousDisabledHtml")?bcSfFilterTemplate.previousDisabledHtml:"",f=f.replace(/{{itemUrl}}/g,buildDefaultLink("page",c-1)),e=e.replace(/{{previous}}/g,f);var g="";g=c<d?bcSfFilterTemplate.hasOwnProperty("nextActiveHtml")?bcSfFilterTemplate.nextActiveHtml:bcSfFilterTemplate.nextHtml:bcSfFilterTemplate.hasOwnProperty("nextDisabledHtml")?bcSfFilterTemplate.nextDisabledHtml:"",g=g.replace(/{{itemUrl}}/g,buildDefaultLink("page",c+1)),e=e.replace(/{{next}}/g,g);for(var h=[],i=c-1;i>c-3&&i>0;i--)h.unshift(i);c-4>0&&h.unshift("..."),c-4>=0&&h.unshift(1),h.push(c);for(var j=[],k=c+1;k<c+3&&k<=d;k++)j.push(k);c+3<d&&j.push("..."),c+3<=d&&j.push(d);for(var l="",m=h.concat(j),n=0;n<m.length;n++)"..."==m[n]?l+=bcSfFilterTemplate.pageItemRemainHtml:l+=m[n]==c?bcSfFilterTemplate.pageItemSelectedHtml:bcSfFilterTemplate.pageItemHtml,l=l.replace(/{{itemTitle}}/g,m[n]),l=l.replace(/{{itemUrl}}/g,buildDefaultLink("page",m[n]));e=e.replace(/{{pageItems}}/g,l),jQ(this.selector.pagination).html(e)}}if(bcSfFilterTemplate.hasOwnProperty("sortingHtml")&&jQ(this.selector.topSorting).length>0){jQ(this.selector.topSorting).html("");var o=this.getSortingList();if(o){var p="";for(var q in o)p+='<option value="'+q+'">'+o[q]+"</option>";var r=bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g,p);jQ(this.selector.topSorting).html(r);var s=void 0!==this.queryParams.sort_by?this.queryParams.sort_by:this.defaultSorting;jQ(this.selector.topSorting+" select").val(s),jQ(this.selector.topSorting+" select").change(function(a){window.location.href=buildDefaultLink("sort_by",jQ(this).val())})}}};

    // Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k = 0; k < data.length; k++) {
        // Featured image
        if (data[k]['images_info'].length > 0) {
            data[k]['featured_image'] = data[k]['images_info'][0];
        } else {
            data[k]['featured_image'] = {width: '', height: '', aspect_ratio: 0}
        }

        // Add Options
        var optionsArr = [];
        for (var i = 0; i < data[k]['options_with_values'].length; i++) {
            optionsArr.push(data[k]['options_with_values'][i]['name']);
        }
        data[k]['options'] = optionsArr;

        // Customize variants
        for (var i = 0; i < data[k]['variants'].length; i++) {
            var variantOptionArr = [];
            var count = 1;
            var variant = data[k]['variants'][i];
            // Add Options
            var variantOptions = variant['merged_options'];
            if (Array.isArray(variantOptions)) {
                for (var j = 0; j < variantOptions.length; j++) {
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]);
                }
                data[k]['variants'][i]['options'] = variantOptionArr;
            }
            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
        }

        // Add Description
        data[k]['description'] = data[k]['body_html'];
    }
    return data;
};