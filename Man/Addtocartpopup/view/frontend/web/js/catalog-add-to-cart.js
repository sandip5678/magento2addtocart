/**
 * Copyright © 2013-2017 Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
define([
    'jquery',
    'mage/translate',
    'mage/url',	
    'jquery/ui',
], function($, $t, $url) {
    "use strict";

    $.widget('mage.catalogAddToCart', {

        options: {
            processStart: null,
            processStop: null,
            bindSubmit: true,
            minicartSelector: '[data-block="minicart"]',
            messagesSelector: '[data-placeholder="messages"]',
            productStatusSelector: '.stock.available',
            addToCartButtonSelector: '.action.tocart',
            addToCartButtonDisabledClass: 'disabled',
            addToCartButtonTextWhileAdding: '',
            addToCartButtonTextAdded: '',
            addToCartButtonTextDefault: ''
        },

        _create: function() {
            if (this.options.bindSubmit) {
                this._bindSubmit();
            }
        },

        _bindSubmit: function() {
            var self = this;
            this.element.on('submit', function(e) {
                e.preventDefault();
                self.submitForm($(this));
            });
        },

        isLoaderEnabled: function() {
            return this.options.processStart && this.options.processStop;
        },

        /**
         * Handler for the form 'submit' event
         *
         * @param {Object} form
         */
        submitForm: function (form) {
            var addToCartButton, self = this;

            if (form.has('input[type="file"]').length && form.find('input[type="file"]').val() !== '') {
                self.element.off('submit');
                // disable 'Add to Cart' button
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);
                addToCartButton.prop('disabled', true);
                addToCartButton.addClass(this.options.addToCartButtonDisabledClass);
                form.submit();
            } else {
                self.ajaxSubmit(form);
            }
        },

        ajaxSubmit: function(form) {
            var self = this,
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);
            $(self.options.minicartSelector).trigger('contentLoading');
            self.disableAddToCartButton(form);

            $.ajax({
                url: form.attr('action'),
                data: form.serialize(),
                type: 'post',
                dataType: 'json',
                beforeSend: function() {
                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStart);
                    }
                },
                success: function(res) {
                    if (self.isLoaderEnabled()) {
                        $('body').trigger(self.options.processStop);
                    }

                    if (res.backUrl) {
                        window.location.reload();
                        //window.location = res.backUrl;
                        //self.enableAddToCartButton(form);
                        //return;
                    }

                    if (res.messages) {
                        console.log(res.messages);
                        $(self.options.messagesSelector).html(res.messages);
                    }
                    if (res.minicart) {
                        $(self.options.minicartSelector).replaceWith(res.minicart);
                        $(self.options.minicartSelector).trigger('contentUpdated');
                    }
                    if (res.product && res.product.statusText) {
                        $(self.options.productStatusSelector)
                            .removeClass('available')
                            .addClass('unavailable')
                            .find('span')
                            .html(res.product.statusText);
                    }
                    

                    //console.log('result_html');
                    var cartUrl = $url.build('checkout/cart');                    
                    var result_html = res.html;
                    if(cartUrl == 'checkout/cart')
                    {
						parent.jQuery('.modals-wrapper').fadeOut();						
					}
                    if(result_html){
                        self.enableAddToCartButton(form);                    
                        var popup = $('<div class="custom-popup-message"/>').html(result_html).modal({
                            modalClass: 'custom-addtocartpopup',
							responsive: true,							
							clickableOverlay: true,
                            title: $.mage.__(''),
                            buttons: [{
                                    text: 'Continue Shopping',
                                    class: 'col-lg-6 col-md-6 col-sm-6 col-xs-6 pro-popup cont-shop',
                                    click: function () {
                                        this.closeModal();
                                    }
                                },
                                {
                                    text: 'Proceed To Cart',
                                    class: 'col-lg-6 col-md-6 col-sm-6 col-xs-6 pro-popup view-cart',
                                    click: function () {
                                        window.location = cartUrl;
                                    }
                                }]
                        });
                        popup.modal('openModal');						

                    }else{
                        setTimeout(function() {
                            var addToCartButtonTextDefault = self.options.addToCartButtonTextDefault || $t('Add to Cart');
                            addToCartButton.removeClass(self.options.addToCartButtonDisabledClass);
                            addToCartButton.find('span').text(addToCartButtonTextDefault);
                            addToCartButton.attr('title', addToCartButtonTextDefault);
                        }, 1000); 
                    }
                }
            });
        },

        disableAddToCartButton: function(form) {
            var addToCartButtonTextWhileAdding = this.options.addToCartButtonTextWhileAdding || $t('Adding...');
            var addToCartButton = $(form).find(this.options.addToCartButtonSelector);
            addToCartButton.addClass(this.options.addToCartButtonDisabledClass);
            addToCartButton.find('span').text(addToCartButtonTextWhileAdding);
            addToCartButton.attr('title', addToCartButtonTextWhileAdding);
        },

        enableAddToCartButton: function(form) {
            var addToCartButtonTextAdded = this.options.addToCartButtonTextAdded || $t('Added');
            var self = this,
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);

            addToCartButton.find('span').text(addToCartButtonTextAdded);
            addToCartButton.attr('title', addToCartButtonTextAdded);

            setTimeout(function() {
                var addToCartButtonTextDefault = self.options.addToCartButtonTextDefault || $t('Add to Cart');
                addToCartButton.removeClass(self.options.addToCartButtonDisabledClass);
                addToCartButton.find('span').text(addToCartButtonTextDefault);
                addToCartButton.attr('title', addToCartButtonTextDefault);
            }, 1000);
        }

        /*enableAddToCartButtonQty: function(form) {
            // var addToCartButtonTextAdded = this.options.addToCartButtonTextAdded || $t('Added');
            var self = this,
                addToCartButton = $(form).find(this.options.addToCartButtonSelector);

            // addToCartButton.find('span').text(addToCartButtonTextAdded);
            // addToCartButton.attr('title', addToCartButtonTextAdded);

            setTimeout(function() {
                var addToCartButtonTextDefault = self.options.addToCartButtonTextDefault || $t('Add to Cart');
                addToCartButton.removeClass(self.options.addToCartButtonDisabledClass);
                addToCartButton.find('span').text(addToCartButtonTextDefault);
                addToCartButton.attr('title', addToCartButtonTextDefault);
            }, 1000);
        }*/
    });

    return $.mage.catalogAddToCart;
});
