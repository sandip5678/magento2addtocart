<?php
/**
 *
 * Copyright © 2013-2018 Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Man\Addtocartpopup\Controller\Cart;

class Add extends \Magento\Checkout\Controller\Cart\Add {
	/**
	 * Add product to shopping cart action
	 *
	 * @return void
	 */
	public function execute() {
		if (!$this->_formKeyValidator->validate($this->getRequest())) {
			return $this->resultRedirectFactory->create()->setPath('*/*/');
		}

		$params = $this->getRequest()->getParams();
		try {
			if (isset($params['qty'])) {
				$filter = new \Zend_Filter_LocalizedToNormalized(
					['locale' => $this->_objectManager->get('Magento\Framework\Locale\ResolverInterface')->getLocale()]
				);
				$params['qty'] = $filter->filter($params['qty']);
			}

			$product = $this->_initProduct();
			$related = $this->getRequest()->getParam('related_product');

			/**
			 * Check product availability
			 */
			if (!$product) {
				return $this->goBack();
			}

			$this->cart->addProduct($product, $params);
			if (!empty($related)) {
				$this->cart->addProductsByIds(explode(',', $related));
			}

			$this->cart->save();

			/**
			 * @todo remove wishlist observer \Magento\Wishlist\Observer\AddToCart
			 */
			$this->_eventManager->dispatch(
				'checkout_cart_add_product_complete',
				['product' => $product, 'request' => $this->getRequest(), 'response' => $this->getResponse()]
			);

			if (!$this->_checkoutSession->getNoCartRedirect(true)) {
				if (!$this->cart->getQuote()->getHasError()) {
					if ($this->getRequest()->isAjax()) {

						$imagewidth = 200;
						$imageheight = 200;
						$imageHelper = $this->_objectManager->get('\Magento\Catalog\Helper\Image');
						$image_url = $imageHelper->init($product, 'product_page_image_small')->setImageFile($product->getThumbnail())->resize($imagewidth, $imageheight)->getUrl();

						$message = __('You added %1 to your shopping cart.', $product->getName());
						$result['message'] = $message;

						$imageHtml = "<div class='addtocart_popup_desc_image'>
                                    <img src='" . $image_url . "'>
                                  </div><div class='addtocart_popup_title'>
								  <h1>The item is almost yours! </h1></div>";

						$text = '<div class="addtocart_popup_desc">
 <p>The item <strong>' . $product->getName() . '</strong> is now in your shopping cart. Would you like to continue shopping or proceed to checkout?</p></div>';

						$result['html'] = $imageHtml . $text;						

						$this->getResponse()->representJson(
							$this->_objectManager->get('Magento\Framework\Json\Helper\Data')->jsonEncode($result)
						);

						$message = __(
							'You added %1 to your shopping cart.',
							$product->getName()
						);
						// $this->messageManager->addSuccessMessage($message);
						return;
					}
				}
				return $this->goBack(null, $product);
			}
		} catch (\Magento\Framework\Exception\LocalizedException $e) {
			if ($this->_checkoutSession->getUseNotice(true)) {
				$this->messageManager->addNotice(
					$this->_objectManager->get('Magento\Framework\Escaper')->escapeHtml($e->getMessage())
				);
			} else {
				$messages = array_unique(explode("\n", $e->getMessage()));
				foreach ($messages as $message) {
					$this->messageManager->addError(
						$this->_objectManager->get('Magento\Framework\Escaper')->escapeHtml($message)
					);
				}
			}

			$url = $this->_checkoutSession->getRedirectUrl(true);

			if (!$url) {
				$cartUrl = $this->_objectManager->get('Magento\Checkout\Helper\Cart')->getCartUrl();
				$url = $this->_redirect->getRedirectUrl($cartUrl);
			}

			$backUrl = $this->goBack($url);
			$message = __('The desired quantity is not available');
			$result['message'] = $message;
			$this->getResponse()->representJson(
				$this->_objectManager->get('Magento\Framework\Json\Helper\Data')->jsonEncode($result)
			);
			return $backUrl;

		} catch (\Exception $e) {
			$this->messageManager->addException($e, __('We can\'t add this item to your shopping cart right now.'));
			$this->_objectManager->get('Psr\Log\LoggerInterface')->critical($e);
			return $this->goBack();
		}
	}
}
