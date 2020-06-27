
kcart = function(){};
kcart.prototype.construct = function(lander)
{
	"use strict";
	if(typeof lander !== 'object')
	{
		console.log("1001: Cannot build cart without instance of lander");
	    return;	
	}
	
	this.lander = lander;
	this.validator = lander.validator;
	this.defaultProduct = lander.defaultProduct;
	this.defaultShipProfile = lander.defaultShipProfile;
	
	//init some other objects
	this.products = lander.products;
	this.orderItems = lander.orderItems;
	this.sessionData = {};
	this.totalsNodes = {};
	
	//profiles
	this.profiles = {};
	this.profiles.shipping = lander.shipProfiles;
	this.profiles.coupon = lander.coupons;
	this.profiles.taxes = lander.taxes;
	
	this.currency = lander.currencySymbol;
	
	this.cartDetail = document.getElementById('kcartDetail');
	
	//define any kcartWidget blocks by 
	this.cartWidgets = [];
	var nodes = document.getElementsByClassName("kcartWidget");
	for(var i=0;i<nodes.length;i++){
		this.cartWidgets.push(nodes[i]);}
	
	this.cartTotals = [];
	nodes = document.getElementsByClassName("kcartTotals");
	for(i=0;i<nodes.length;i++){
		this.cartTotals.push(nodes[i]);}
	
	this.upgradeCartDetail();
	this.upgradeAddToCartButtons();
	this.upgradeWidgets();
	this.upgradeCartTotals();
	this.upgradeExtraCheckoutProducts();

};

//Utility functions
kcart.prototype.getProfile = function(name)
{
	"use strict";
	if(this.profiles[name]){
		return this.profiles[name];}	
	
	console.log("getProfile could not find profile with name "+name);
	return false;
};

kcart.prototype.sendAjaxRequest = function(url,params,callback)
{
	"use strict";
	return this.lander.sendAjaxRequest(url,params,callback);	
};
kcart.prototype.ajaxCallMethod = function(method,params,cb1,cb2)
{
	"use strict";
	return this.lander.ajaxCallMethod(method,params,cb1,cb2);
};


/*
displayWidget
-replaces html content of cartWidget div with what is returned from ajax call
*/

kcart.prototype.displayWidget = function()
{
	"use strict";
	var widgets = this.widgets;
	var success = function(html)
	{
		console.log(widgets);
		for(var i in widgets){
			if(widgets[i]){
			widgets[i].innerHTML = html;}}
	};
	
	this.ajaxCallMethod("getWidget",null,success);
};

/*
displayCart
-replaces html content of kcart div with what is returned from ajax call
*/

kcart.prototype.displayCart = function()
{
	"use strict";
	if(this.cartDetail)
	{
		var kcart = this;
		var success = function(result)
		{
			this.cartDetail.innerHTML = result.body;
			kcart.upgradeCartDetail();
		};
		
		this.ajaxCallMethod("getShoppingCart",null,success);
		//window.setTimeout(function(){kcart.displayCart();},5000);
	}
};

/*
updateSession
-updates php session with updated lineItems
*/

kcart.prototype.updateSession = function(items)
{	
	items = items || this.getOrderItems();
	var params = {};
	params.cartItems = items;
	params.cartItems = JSON.stringify(params.cartItems);
	var kcart = this;
	this.ajaxCallMethod("updateCart",params,function(){kcart.displayWidget();});
}

kcart.prototype.upgradeCartTotals = function()
{
	var classes = ['kcartSubTotal','kcartShipTotal','kcartSalesTax','kcartDiscount','kcartInsurance','kcartGrandTotal'];
	for(i in classes){
		var name = classes[i];
		this.totalsNodes[name] = [];
		var nodes = document.getElementsByClassName(name);
		for(var n=0;n<nodes.length;n++)
			this.totalsNodes[name].push(nodes[n]);	
	}
}

kcart.prototype.upgradeCartDetail = function()
{
	if(!this.cartDetail)
		return;
	
	this.upgradeShopButtons();
	this.upgradeLineItems();
}

kcart.prototype.upgradeLineItems = function()
{
	//need mappings by productId for all the UI objects
	this.lineItems = {};
	
	//get the container div of the shopping cart
	var container = this.cartDetail;
	
	var nodes = container.getElementsByClassName("kcartItem");
	
	var kcart = this;
	for(var i=0;i<nodes.length;i++)
	{
		var node = nodes[i];
		var productId = parseInt(node.getAttribute('productId'));

		//map elements on this line by productId and assign onclick event listeners
		this.lineItems[productId] = {};
		var item = this.lineItems[productId];
		item.productId = productId;
		item.parentRow = node;
		
		//a useful function for this mini object
		this.lineItems[productId].getQty = function(){
			return parseInt(this.itemQty.innerHTML);
		};
		
		//upgrade minus button
		item.minusBtn = node.getElementsByClassName('kcartMinusBtn')[0];
		if(item.minusBtn)
		{
			item.minusBtn.lineItem = item;
			item.minusBtn.onclick = function(){kcart.minusItem(this.lineItem.productId)};
		}
		//upgrade plus button
		item.plusBtn = node.getElementsByClassName('kcartPlusBtn')[0];
		if(item.plusBtn)
		{
			item.plusBtn.lineItem = item;
			item.plusBtn.onclick = function(){kcart.plusItem(this.lineItem.productId)};
		}
		//upgrade remove button
		
		item.removeBtn = node.getElementsByClassName('kcartRemoveBtn')[0];
		if(item.removeBtn)
		{	
			item.removeBtn.lineItem = item;
			item.removeBtn.onclick = function(){kcart.removeItem(this.lineItem.productId)};
		}
		//upgrade itemQty span
		item.itemQty = node.getElementsByClassName('kcartItemQty')[0];
		item.itemQty.lineItem = item;
	}
	
	//now that everything is upgraded, we can pull the selected order items from the html
	this.getOrderItems();
	
	
}

kcart.prototype.getOrderItems = function()
{
	if(this.lander.pageType == 'checkoutPage')
	{

		this.orderItems = {};
		if(this.cartDetail)
		{
			for(var i in this.lineItems)
			{
				var item = this.lineItems[i];
				this.orderItems[i] = item.getQty();	
			}
		}
		else
		{
			
			var productId = this.getValue('productId');
			if(!productId || !this.products[productId])
				productId = this.defaultProduct;
	
	//		console.log(this.lander.selectedProduct);
			if(this.lander.selectedProduct)
				productId = this.lander.selectedProduct;
	
	
			this.orderItems[productId]=1;
			
			var nodes = document.getElementsByClassName('kformCheckoutUpsell');
			for(var i = 0;i<nodes.length;i++)
			{
				var node = nodes[i];
				productId = node.value;
				var qty = node.getAttribute('quantity') || '1';
				
				if(!this.lander.products[productId])
					console.log("skipping checkout upsell with productId: "+productId+". Product not found. It may be necessary to update config.php.");
				else if(node.checked)
					this.orderItems[productId] = qty;
			}
		}
	}
	return this.orderItems;
}

kcart.prototype.minusItem = function(productId)
{
	this.getOrderItems();
	var items = this.orderItems;
	if(items[productId])
	{
		if(items[productId] > 1)
			items[productId]--;
			
		if(this.cartDetail)
		{
			var itemQty = this.lineItems[productId].itemQty;
			itemQty.innerHTML = items[productId];
		}
	}
	this.updateSession(items);
	this.displayTotals();
}

kcart.prototype.plusItem = function(productId)
{
	var items = this.getOrderItems();
	if(items[productId])
	{
		items[productId]++;
		if(this.cartDetail)
		{
			var itemQty = this.lineItems[productId].itemQty;
			itemQty.innerHTML = items[productId];
		}
	}
	this.updateSession();
	this.displayTotals();
}
kcart.prototype.removeItem = function(productId)
{
	console.log(productId);
	var items = this.getOrderItems();
	if(items[productId])
	{
		if(this.cartDetail)
		{
			var node = this.lineItems[productId].parentRow;
			node.parentNode.removeChild(node);
			this.upgradeLineItems();
		}
	}
	this.updateSession();
	this.displayTotals();
}
kcart.prototype.upgradeAddToCartButtons = function()
{
	var kcart = this;
	
	//grab all nodes with matching class name
	var nodes = document.getElementsByClassName("kcartAddToCartButton");
	for(var i=0;i<nodes.length;i++)
	{
		var node = nodes[i];
		
		//set onclick event listener with the redirect action
		node.addEventListener('click',function()
		{
			var productId = parseInt(this.getAttribute('productId'));
			var qty = parseInt(this.getAttribute('quantity'));
			kcart.addToCart(productId,qty);
		});
		
	}
}

kcart.prototype.upgradeShopButtons = function()
{
	if(!this.cartDetail)
		return;
		
	//get the container div of the shopping cart
	var container = this.cartDetail;
	
	//grab all nodes with matching class name
	var nodes = container.getElementsByClassName("kcartShopButton");
	for(var i=0;i<nodes.length;i++)
	{
		var node = nodes[i];
		//set onclick event listener with the redirect action
		node.addEventListener('click',function()
		{
			var url = this.getAttribute('href');
			window.location = url;
		});
		
	}
}
kcart.prototype.upgradeWidgets = function()
{
	this.widgets = [];
	
	//grab all nodes with matching class name
	var nodes = document.getElementsByClassName("kcartWidget");
	for(var i=0;i<nodes.length;i++)
	{
		var node = nodes[i];
		this.widgets.push(node);
	}
}


kcart.prototype.addToCart = function(productId,qty)
{
	var originalProductId = productId;
	productId = parseInt(productId);
	qty = parseInt(qty);
	
	if(isNaN(qty))
		qty = 1;
	
	if(isNaN(productId))
	{
		console.log("could not add product, invalid productId: "+originalProductId);	
		return;
	}
	
	var items = this.getOrderItems();
	if(items[productId])
		items[productId] += qty;
	else
		items[productId] = qty;	
	
	this.updateSession();
	
}

kcart.prototype.getValue = function(name)
{
	if(this.lander.getValue(name))
		return this.lander.getValue(name)
	else if(this.lander.validator)
		return this.lander.validator.fetchFormValue(name);
	else if(this.sessionData[name])
		return this.sessionData[name];
	return false;
}

kcart.prototype.getShipAddress = function()
{
	var address1 = this.getValue('shipAddress1') || this.getValue('address1');
	var address2 = this.getValue('shipAddress2') || this.getValue('address2');
	var city = this.getValue('shipCity') || this.getValue('city');
	var state = this.getValue('shipState') || this.getValue('state');
	var postalCode = this.getValue('shipPostalCode') || this.getValue('postalCode');
	var country = this.getValue('shipCountry') || this.getValue('country');
	return {address1:address1,address2:address2,city:city,state:state,postalCode:postalCode,country:country};
}

kcart.prototype.getCoupon = function()
{
	var couponCode = this.getValue('couponCode');
	if(couponCode && this.profiles.coupon[couponCode.toUpperCase()])
		return this.profiles.coupon[couponCode.toUpperCase()];
};
kcart.prototype.getShipProfile = function()
{
	var profileId = this.getValue('shipProfileId');
	if(!profileId && this.defaultShipProfile)
		profileId = this.defaultShipProfile;
	if(profileId && this.profiles.shipping[profileId])
		return this.profiles.shipping[profileId];
};
kcart.prototype.getTaxRate = function()
{
	var shipAddress = this.getShipAddress();
	var country = shipAddress.country;
	var state = shipAddress.state;
	
	var tax_key = country+ '-' + state
	if(!this.profiles.taxes[tax_key])
		tax_key = country + '-*';
	
	return parseFloat(this.profiles.taxes[tax_key]) || 0;
};
kcart.prototype.getInsurance = function()
{
	return this.getValue('insureShip') ? this.lander.insureShipPrice : 0;
};
kcart.prototype.getMicroTime = function()
{
	return (new Date).getTime() / 1000;	
}
kcart.prototype.displayTotals = function()
{
	this.calculateTotals();
	for(var cls in this.totalsNodes)
	{
		var name = cls.substr(5);
		name = name.substr(0,1).toLowerCase()+name.substr(1);
		var amount = this[name];
		for(var i in this.totalsNodes[cls])
		{
			var node = this.totalsNodes[cls][i];
			node.innerHTML = this.currency+amount.toFixed(2);
			if(name == 'discount' || name == 'insurance')
			{
				if(node.parentNode.tagName == 'TR')
					node.parentNode.style.display = amount > 0 ? 'table-row' : 'none';	
			}
		}
	}
}

kcart.prototype.calculateTotals = function()
{

	this.subTotal = 0.00;
	this.salesTax = 0.00;
	this.shipTotal = 0.00;
	this.grandTotal = 0.00;
	this.discount = 0.00;
	this.insurance = 0.00;

	//get items currently in cart
	var items = this.getOrderItems();
	
	//profiles that affect pricing
	var products = this.getProducts();
	var shipProfile = this.getShipProfile();
	var taxRate = this.getTaxRate();
	var coupon = this.getCoupon();
	var insurance = this.getInsurance();
	
	//total up price and shipping
	for(var i in items)
	{
		var qty = items[i];
		var prod = products[i];
		this.subTotal +=  parseFloat(prod.price) * qty;
		this.shipTotal += parseFloat(prod.shipPrice) * qty;
	}
	
	if(shipProfile)
	{
		if(shipProfile.applyEntireOrder && shipProfile.matchedShipPrice)
		{
			if(shipProfile.isUpcharge)
				this.shipTotal += parseFloat(shipProfile.matchedShipPrice);
			else
				this.shipTotal = parseFloat(shipProfile.matchedShipPrice);
		}
		
		var freeShipThreshold = parseFloat(shipProfile.freeShipThreshold);
		if(freeShipThreshold > 0 && this.subTotal >= freeShipThreshold)
			this.shipTotal = 0;
	}

	//apply coupon if one is defined
	var taxable = this.subTotal;
	if(coupon)
	{
		var cDiscount = parseFloat(coupon.couponDiscountPrice);
		var cPerc = parseFloat(coupon.couponDiscountPerc);
		if(coupon.applyTo == 'SHIPPING')
		{
			if(cPerc > 0)
				this.discount = this.shipTotal * cPerc;
			else
				this.discount = this.shipTotal < cDiscount ? this.shipTotal : cDiscount;
		}
		else if(coupon.applyTo = 'BASE_PRICE')
		{
			if(cPerc > 0)
				this.discount = this.subTotal * cPerc;
			else
				this.discount = this.subTotal < cDiscount ? this.subTotal : cDiscount;
			taxable -= this.discount;
		}	
	}
	
	//apply tax (s&h is not taxed)
	this.salesTax = taxRate * taxable;
	//sum grand total
	this.grandTotal = this.subTotal + this.shipTotal + this.salesTax - this.discount + this.insurance;
	return {subTotal:this.subTotal,shipTotal:this.shipTotal,salesTax:this.salesTax,discount:this.discount,insurance:this.insurance};
};


//gets product pricing with ship profile calculations
//ship profiles have a lot of configurations so there's a bunch of logic to check here
kcart.prototype.getProducts = function()
{
	this.profileShipPrice = 0;
	
	var products = JSON.parse(JSON.stringify(this.products));
	var profile = this.getShipProfile();
	
	if(!profile)
		return products;
		
	profile.matchedShipPrice = null;
	
	var shipAddress = this.getShipAddress();
	var shipCountry = shipAddress.country;
	var shipState = shipAddress.state;
	var shipContinent = this.lander.config.continents[shipCountry];
	
	if(profile.applyEntireOrder){
		var matchRule = null;
		var maxRStrength = 0;
		var rStrength;
		
		for(var i in profile.rules){
			rStrength = 0;
			var rule = profile.rules[i];	
			if(rule.region){
				if(rule.region.substr(0,4) == 'REG_'){
					if(rule.region.substr(4,2) != shipContinent)
						continue;
					rStrength = 1;
				}else{
					if(rule.region == shipCountry){
						rStrength = 2;
						if(rule.state){
							if(rule.state == shipState)
								rStrength = 3;
							else
								continue;
						}
					}else
						continue;	
				}
			}
			if(rStrength >= maxRStrength){
				maxRStrength = rStrength;
				matchRule = rule;
			}
			else
				continue;
			
		}
		if(matchRule)
			profile.matchedShipPrice = matchRule.shipPrice;
	}else{
		for(var i in products){
			var prod = products[i];
			var productId = prod.productId;
			
			var matchRule = null;
			var maxPStrength = 0;
			var maxRStrength = 0;
			for(var i in profile.rules){
				var rule = profile.rules[i];	
				var pStrength = 0;
				var rStrength = 0;
				if(rule.region){
					if(rule.region.substr(0,4) == 'REG_'){
						if(rule.region.substr(4,2) != shipContinent)
							continue;
						rStrength = 1;
					}else{			
						if(rule.region == shipCountry){
							rStrength = 2;
							if(rule.state)
							{
								if(rule.state == shipState)
									rStrength = 3;
								else
									continue;
							}
						}else
							continue;
					}				
				}
				if(rStrength >= maxRStrength)
					maxRStrength = rStrength;	
				else
					continue;
				if(rule.productTypeSelect == 'SINGLE' && productId == rule.campaignProductId)
					pStrength = 5;
				else if(rule.productTypeSelect == 'CATEGORY' && prod.productCategoryId == rule.productCategoryId)
					pStrength = 4;
				else if(rule.productTypeSelect == 'OFFERS' && prod.productType == 'OFFER')
					pStrength = 3;
				else if(rule.productTypeSelect == 'UPSELLS' && prod.productType == 'UPSALE')
					pStrength = 2;
				else if(rule.productTypeSelect == 'PRODUCTS')
					pStrength = 1;
					
				if(pStrength >= maxPStrength){
					matchRule = rule;
					maxPStrength = pStrength;
				}
			}
			var shipPrice = parseFloat(products[productId].shipPrice);
			if(matchRule){
				var profileShipPrice = parseFloat(matchRule.shipPrice);
				if(profile.isUpcharge)
					shipPrice += profileShipPrice;
				else
					shipPrice = profileShipPrice;
				prod.shipPrice = shipPrice;
			}
		}
	}
	
	//shipProfiles that only bill the highest ship price item
	if(profile.highestShipPriceOnly){
		var maxShipPrid = null;
		var maxShipPrice = 0;		
		for(var i in products){
			var prod = products[i];
			var shipPrice = parseFloat(prod.shipPrice);
			if(shipPrice > maxShipPrice){
				maxShipPrid = i;
				maxShipPrice = shipPrice;
			}
		}
		for(var i in products){
			if(i != maxShipPrid)
				products[i].shipPrice = 0;	
		}
	}
	
	
	return products;
}

//for multi-product landers -- selects a product
kcart.prototype.selectProduct = function(productId)
{
	if(kform.selectedProduct)
	{		
		var curVal = kform.selectedProduct;
		if(curVal == productId)
			return;
		if(kform.productSelectNodes)
		{
			var node = kform.productSelectNodes[curVal];
			if(node)
			{
				node.className = node.className.replace(/kform_selectedProduct/,"");
				node.parentBox.className = node.parentBox.className.replace(/kform_selectedProduct/,"");
			}
		}
	}
	
	if(kform.productSelectNodes)
	{		
		var node;		
		if(node = kform.productSelectNodes[productId])
		{
	
			kform.selectedProduct = productId;
			node.className += " kform_selectedProduct";
			node.parentBox.className += " kform_selectedProduct";
			
		}
	}
	kform.storeValue('selectedProduct',productId);
	
	if(typeof kform_userSelectProduct == 'function')
		kform_userSelectProduct(productId);
		
	this.displayTotals();
};


//used by multi-product landers
kcart.prototype.upgradeProductSelector = function()
{
	var nodes = document.getElementsByClassName('kform_productSelect');
	var len = nodes.length;

	if(len == 0)
		return;
	
	this.productSelectNodes = {};
	var defaultProductIsOption = false;
	for(var i = 0;i<len;i++)
	{
		var node = nodes[i];
		
		var productId = node.getAttribute('productId');
		if(!productId)
			alert("kformError: productSelect button must have the productId attribute");
		node.productId = productId;
		
		var parent = node;
		var foundParent = false;
		while(parent = parent.parentNode)
		{
			if(typeof parent != 'object')
				break;
			
			if(typeof parent.className == 'undefined')
				continue;
			
			if(parent.className.indexOf("kform_productBox") > -1)
			{
				node.parentBox = parent;
				foundParent = true;
			}
		}
		
		if(!foundParent)
			alert("kformError: productSelect button must be a child of an element with the kform_productBox className");
		
		this.productSelectNodes[productId] = node;
		
		if(!this.products[productId])
			alert("kformError: productSelect button has a productId value of "+productId+" but that productId does not exist in this campaign");
		
		
		if(!this.hasInput('productSelector'))
		{
			var input = document.createElement('input');
			input.type = 'hidden';
			input.name = 'productSelector';
			this.node.appendChild(input);
			this.inputs['productSelector'] = input;
		}
		

		if(productId == this.defaultProduct)
			defaultProductIsOption = true;

		node.addEventListener('click',function()
		{
			kform.selectProduct(this.productId);
		});
	}
	
	if(!defaultProductIsOption)
		alert("kformError: default productId is "+this.defaultProduct+" but this option does not exist in the productSelector");
	
	var curProd = this.fetchValue('selectedProduct');
	if(!curProd)
		curProd = this.defaultProduct;
	
	this.selectProduct(curProd);
	
};

//upgrades checkboxes used for additional upsells
kcart.prototype.upgradeExtraCheckoutProducts = function()
{
	var nodes = document.getElementsByClassName('kformCheckoutUpsell');
	var len = nodes.length;
	
	if(len == 0)
		return;
	
	var cart = this;
	
	for(var i = 0;i<len;i++)
	{
		var node = nodes[i];
		if(node.type == 'checkbox')
		{
			var upsellId = node.value;
			if(!this.products[upsellId])
				alert("kformError: upsell checkbox has an value of "+upsellId+" but that productId does not exist in this campaign");
			
			node.addEventListener('click',function(){cart.displayTotals()});
		}
	}
}