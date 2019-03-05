var config = {
    map: {
        '*': {		
            'catalogAddToCart': 'Man_Addtocartpopup/js/catalog-add-to-cart',			
            'Magento_Catalog/js/catalog-add-to-cart': 'Man_Addtocartpopup/js/catalog-add-to-cart'
        },
		shim: {
    		'Man_Addtocartpopup/js/catalog-add-to-cart': ['catalogAddToCart']            
    	}
	},
	deps: ['jquery']	
};
