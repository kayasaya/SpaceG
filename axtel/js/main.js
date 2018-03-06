jQuery(document).ready(function ($) {
	function ProductBuilder(element) {
		this.element = element;
		this.stepsWrapper = this.element.children('.cd-builder-steps');
		this.steps = this.element.find('.builder-step');
		//store some specific bulider steps
		this.models = this.element.find('[data-selection="models"]');
		this.summary;
		this.optionsLists = this.element.find('.options-list');
		this.formInformation = this.element.find('.input-container')
		//bottom summary 
		this.fixedSummary = this.element.find('.cd-builder-footer');
		this.modelPreview = this.element.find('.selected-product').find('img');
		this.totPriceWrapper = this.element.find('.tot-price').find('b');
		//builder navigations
		this.mainNavigation = this.element.find('.cd-builder-main-nav');
		this.secondaryNavigation = this.element.find('.cd-builder-secondary-nav');
		//used to check if the builder content has been loaded properly
		this.loaded = true;


		// bind builder events
		this.bindEvents();
	}
	$(document).ready(function () {
		$("#form1").click(function (event) {
            event.preventDefault();
			$("#submit-form").submit();
		});
	});

    $(document).ready(function () {
		$("#form2").click(function () {
			$("#submit-form2").submit();
		});
	});

    
	ProductBuilder.prototype.bindEvents = function () {
		var self = this;

		//detect click on the left navigation
		this.mainNavigation.on('click', 'li:not(.active)', function (event) {
			event.preventDefault();
			self.loaded && self.newContentSelected($(this).index());
		});

		//detect click on bottom fixed navigation
		this.secondaryNavigation.on('click', '.nav-item li:not(.buy)', function (event) {
			event.preventDefault();
			var stepNumber = ($(this).parents('.next').length > 0) ? $(this).index() + 1 : $(this).index() - 1;
			self.loaded && self.newContentSelected(stepNumber);
		});
		//detect click on one element in an options list (e.g, models, accessories)
		this.optionsLists.on('click', '.js-option', function (event) {
			self.updateListOptions($(this));
		});
		//detect clicks on customizer controls (e.g., speed ...)
		this.stepsWrapper.on('click', '.cd-product-customizer a', function (event) {
			event.preventDefault();
			self.customizeModel($(this));
		});
	};

	ProductBuilder.prototype.newContentSelected = function (nextStep) {
		//first - check if a model has been selected - user can navigate through the builder
		if (this.fixedSummary.hasClass('disabled')) {
			//no model has been selected - show alert
			this.fixedSummary.addClass('show-alert');
		} else {
			//model has been selected so show new content 
			//first check if the speed step has been completed - in this case update the product bottom preview
			if (this.steps.filter('.active').is('[data-selection="speed"]')) {
				//in this case, speed has been changed - update the preview image
				var imageSelected = this.steps.filter('.active').find('.cd-product-previews').children('.selected').children('img').attr('src');
				this.modelPreview.attr('src', imageSelected);
			}
			//if Summary is the selected step (new step to be revealed) -> update summary content
			if (nextStep + 1 >= this.steps.length) {
				this.createSummary();
			}
			this.showNewContent(nextStep);
			this.updatePrimaryNav(nextStep);
			this.updateSecondaryNav(nextStep);

		}
	}

	ProductBuilder.prototype.showNewContent = function (nextStep) {
		var actualStep = this.steps.filter('.active').index() + 1;
		if (actualStep < nextStep + 1) {
			//go to next section
			this.steps.eq(actualStep - 1).removeClass('active back').addClass('move-left');
			this.steps.eq(nextStep).addClass('active').removeClass('move-left back');
		} else {
			//go to previous section
			this.steps.eq(actualStep - 1).removeClass('active back move-left');
			this.steps.eq(nextStep).addClass('active back').removeClass('move-left');
		}
	}

	ProductBuilder.prototype.updatePrimaryNav = function (nextStep) {
		this.mainNavigation.find('li').eq(nextStep).addClass('active').siblings('.active').removeClass('active');
	}

	ProductBuilder.prototype.updateSecondaryNav = function (nextStep) {
		(nextStep == 0) ? this.fixedSummary.addClass('step-1') : this.fixedSummary.removeClass('step-1');

		this.secondaryNavigation.find('.nav-item.next').find('li').eq(nextStep).addClass('visible').removeClass('visited').prevAll().removeClass('visited').addClass('visited').end().nextAll().removeClass('visible visited');
		this.secondaryNavigation.find('.nav-item.prev').find('li').eq(nextStep).addClass('visible').removeClass('visited').prevAll().removeClass('visited').addClass('visited').end().nextAll().removeClass('visible visited');
	}

	ProductBuilder.prototype.createSummary = function () {
		var self = this;
		this.steps.each(function () {
			//this function may need to be updated according to your builder steps and summary
			var step = $(this);
			if ($(this).data('selection') == 'speed') {
				//create the speed summary
				var speedSelected = $(this).find('.cd-product-customizer').find('.selected'),
					speed = speedSelected.children('a').data('speed'),
					speedName = speedSelected.data('content'),
					imageSelected = $(this).find('.cd-product-previews').find('.selected img').attr('src');

				self.summary.find('.summary-speed').find('.speed-label').text(speedName).siblings('.speed-swatch').attr('data-speed', speed);
				self.summary.find('.product-preview').attr('src', imageSelected);
			} else if ($(this).data('selection') == 'accessories') {
				var selectedOptions = $(this).find('.js-option.selected'),
					optionsContent = '';

				if (selectedOptions.length == 0) {
					optionsContent = '<li><p>No se eligio ningun Extra;</p></li>';
				} else {
					selectedOptions.each(function () {
						optionsContent += '<li><p>' + $(this).find('p').text() + '</p></li>';
					});
				}

				self.summary.find('.summary-accessories').children('li').remove().end().append($(optionsContent));
			}
		});
	}

	ProductBuilder.prototype.updateListOptions = function (listItem) {
		var self = this;

		if (listItem.hasClass('js-radio')) {
			//this means only one option can be selected (e.g., models) - so check if there's another option selected and deselect it
			var alreadySelectedOption = listItem.siblings('.selected'),
				price = (alreadySelectedOption.length > 0) ? -Number(alreadySelectedOption.data('price')) : 0;

			//if the option was already selected and you are deselecting it - price is the price of the option just clicked
			(listItem.hasClass('selected'))
				? price = -Number(listItem.data('price'))
				: price = Number(listItem.data('price')) + price;

			//now deselect all the other options
			alreadySelectedOption.removeClass('selected');
			//toggle the option just selected
			listItem.toggleClass('selected');
			//update totalPrice - only if the step is not the Models step
			(listItem.parents('[data-selection="models"]').length == 0) && self.updatePrice(price);
		} else {
			//more than one options can be selected - just need to add/remove the one just clicked
			var price = (listItem.hasClass('selected')) ? -Number(listItem.data('price')) : Number(listItem.data('price'));
			//toggle the option just selected
			listItem.toggleClass('selected');
			//update totalPrice
			self.updatePrice(price);
		}

		if (listItem.parents('[data-selection="models"]').length > 0) {
			//since a model has been selected/deselected, you need to update the builder content
			self.updateModelContent(listItem);
		}
	};

	ProductBuilder.prototype.updateModelContent = function (model) {
		var self = this;
		if (model.hasClass('selected')) {
			var modelType = model.data('model'),
				modelImage = model.find('img').attr('src');

			//need to update the product image in the bottom fixed navigation
			this.modelPreview.attr('src', modelImage);

			//need to update the content of the builder according to the selected product
			//first - remove the contet which refers to a different model
			this.models.siblings('li').remove();
			//second - load the new content
			$.ajax({
				type: "GET",
				dataType: "html",
				url: "/" + modelType,
				beforeSend: function () {
					self.loaded = false;
					model.siblings().removeClass('loaded');
				},
				success: function (data) {
					self.models.after(data);
					self.loaded = true;
					model.addClass('loaded');
					//activate top and bottom navigations
					self.fixedSummary.add(self.mainNavigation).removeClass('disabled show-alert');
					//update properties of the object
					self.steps = self.element.find('.builder-step');
					self.summary = self.element.find('[data-selection="summary"]');
					//detect click on one element in an options list
					self.optionsLists.off('click', '.js-option');
					self.optionsLists = self.element.find('.options-list');
					self.optionsLists.on('click', '.js-option', function (event) {
						self.updateListOptions($(this));
					});

					//this is used not to load the animation the first time new content is loaded
					self.element.find('.first-load').removeClass('first-load');
				},
				error: function (jqXHR, textStatus, errorThrown) {
					//you may want to show an error message here
				}
			});

			//update price (no adding/removing)
			this.totPriceWrapper.text(model.data('price'));

		} else {
			//no model has been selected
			this.fixedSummary.add(this.mainNavigation).addClass('disabled');
			//update price
			this.totPriceWrapper.text('0');

			this.models.find('.loaded').removeClass('loaded');
		}
	};

	ProductBuilder.prototype.customizeModel = function (target) {
		var parent = target.parent('li')
		index = parent.index();

		//update final price
		var price = (parent.hasClass('selected'))
			? 0
			: Number(parent.data('price')) - parent.siblings('.selected').data('price');

		this.updatePrice(price);
		target.parent('li').addClass('selected').siblings().removeClass('selected').parents('.cd-product-customizer').siblings('.cd-product-previews').children('.selected').removeClass('selected').end().children('li').eq(index).addClass('selected');
	};

	ProductBuilder.prototype.updatePrice = function (price) {
		var actualPrice = Number(this.totPriceWrapper.text()) + price;
		this.totPriceWrapper.text(actualPrice);
	};
	if ($('.cd-product-builder').length > 0) {
		$('.cd-product-builder').each(function () {
			//create a productBuilder object for each .cd-product-builder
			new ProductBuilder($(this));
		});
	}

});


$('#save_image_locally').click(function () {
	html2canvas($('#imagesave'),
		{
			onrendered: function (canvas) {
				var a = document.createElement('a');
				var height = 100;
				var m = canvas.toDataURL("image/png")
				fetch ("/sendImage", {
					method: "POST",
					headers: {
						"Content-type": "application/x-www-form-urlencoded"
					},
					body: "dataImage=" + encodeURIComponent(m)
				}).then(function(r){ return r.text() }).then(function (data) {
					console.log(data)
				})
			}
		});
});

var ipname = [];
var iplname = [];
var dobs = [];
var addr = [];
var num = [];
var numint = [];
var dele = [];
var edo = [];
var telep = [];
var mail = [];
var fn1 = [];
var ln1 = [];
var rt1 = [];
var et1 = [];
var fn2 = [];
var ln2 = [];
var rt2 = [];
var et2 = [];
var rowCount = 1;
var rowCount2 = 1;
function addPersInfo() {
	var temp = 'style .fa fa-trash';
	ipname.push(document.getElementById("i-first-name").value);
	iplname.push(document.getElementById("i-last-name").value);
	dobs.push(document.getElementById("dob").value);
	addr.push(document.getElementById("calle").value);
	num.push(document.getElementById("numb").value);
	numint.push(document.getElementById("numbint").value);
	dele.push(document.getElementById("delegacion").value);
	edo.push(document.getElementById("estadods").value);
	telep.push(document.getElementById("telephone").value);
	mail.push(document.getElementById("email").value);
    var table = document.getElementById("pInfoTable");
	var row = table.deleteRow(rowCount);
    row = table.insertRow(rowCount);
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var cell5 = row.insertCell(4);
	var cell6 = row.insertCell(5);
	var cell7 = row.insertCell(6);
	var cell8 = row.insertCell(7);
	var cell9 = row.insertCell(8);
	var cell10 = row.insertCell(9);
	var cell11 = row.insertCell(10);
	cell1.innerHTML = ipname[rowCount - 1];
	cell2.innerHTML = iplname[rowCount - 1];
	cell3.innerHTML = dobs[rowCount - 1];
	cell4.innerHTML = addr[rowCount - 1];
	cell5.innerHTML = num[rowCount - 1];
	cell6.innerHTML = numint[rowCount - 1];
	cell7.innerHTML = dele[rowCount - 1];
	cell8.innerHTML = edo[rowCount - 1];
	cell9.innerHTML = telep[rowCount - 1];
	cell10.innerHTML = mail[rowCount - 1];
	cell11.innerHTML = '<td class="fa fa-trash"></td>';
    rowCount++;
}

function addRefInfo() {
	var temp = 'style .fa fa-trash';
	fn1.push(document.getElementById("first-name-1").value);
	ln1.push(document.getElementById("last-name-1").value);
	rt1.push(document.getElementById("r-telephone-1").value);
	et1.push(document.getElementById("r-email-1").value);
	fn2.push(document.getElementById("first-name-2").value);
	ln2.push(document.getElementById("last-name-2").value);
	rt2.push(document.getElementById("r-telephone-2").value);
	et2.push(document.getElementById("r-email-2").value);
	var table2 = document.getElementById("pInfoRef");
	var row = table2.deleteRow(rowCount2);
    row = table2.insertRow(rowCount2);
	var cell1a = row.insertCell(0);
	var cell2a = row.insertCell(1);
	var cell3a = row.insertCell(2);
	var cell4a = row.insertCell(3);
	var cell5a = row.insertCell(4);
	var cell6a = row.insertCell(5);
	var cell7a = row.insertCell(6);
	var cell8a = row.insertCell(7);
	var cell9a = row.insertCell(8);
	cell1a.innerHTML = fn1[rowCount2 - 1];
	cell2a.innerHTML = ln1[rowCount2 - 1];
	cell3a.innerHTML = rt1[rowCount2 - 1];
	cell4a.innerHTML = et1[rowCount2 - 1];
	cell5a.innerHTML = fn2[rowCount2 - 1];
	cell6a.innerHTML = ln2[rowCount2 - 1];
	cell7a.innerHTML = rt2[rowCount2 - 1];
	cell8a.innerHTML = et2[rowCount2 - 1];
	cell8a.innerHTML = et2[rowCount2 - 1];
	cell9a.innerHTML = '<td class="fa fa-trash"></td>';
	rowCount2++;
}



