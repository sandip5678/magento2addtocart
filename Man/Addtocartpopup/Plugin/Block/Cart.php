<?php
/**
 *
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Man\Addtocartpopup\Plugin\Block;

use Magento\Checkout\Block\Cart as CheckoutCart;
use Magento\Checkout\Model\Session;

class Cart {
	protected $_checkoutSession;
	protected $redirect;
	public $_storeManager;
	protected $url;
	
    public function __construct(Session $session,\Magento\Framework\App\Response\RedirectInterface $redirect,
	\Magento\Store\Model\StoreManagerInterface $storeManager, \Magento\Framework\UrlInterface $url) {
        $this->_checkoutSession   = $session;
		$this->redirect = $redirect;
		$this->_storeManager = $storeManager;
		$this->url = $url;
    }

	// redirect customer to referral url after clicking on "Continue Shopping"	
    public function beforeGetContinueShoppingUrl(CheckoutCart $subject)
    {
        $url = $subject->getData('continue_shopping_url');
        if ($url === null) {
            $url = $this->_checkoutSession->getContinueShoppingUrl(true);
            if (!$url) {
				$redirectUrl = $this->redirect->getRefererUrl();
				if($redirectUrl == $this->_storeManager->getStore()->getBaseUrl().'checkout/cart/') {
					$url = $this->url->getUrl('category');
				} 
				else {
					$url = $redirectUrl;
				}
            }
            $subject->setData('continue_shopping_url', $url);
        }

        return $this;
    }
}
