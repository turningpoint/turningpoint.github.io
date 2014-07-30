//////////////////////////////////
//Investment request			//
//////////////////////////////////
var InvestmentRequest = {
	initInvestmentRequestForm: function() {
		var TaxChanged = false;

		// Check if there is already a Tax Value
		$('[id*="_tax"]').each(function() {
			if ($(this).val() != '')
			{
				TaxChanged = true;
			}
		});

		//format numbers at load
		$('.numeric').each(function(){
			formatAccountingNumber($(this));
		});

		calculateValues();

		//enable only numeric for inputs
		$('.numeric').numeric({nefative: false, decimal: ','});

		// Disable all Capex Local and EUR inputs add startup
		$('[id*="_eur"]').each(function() {
			if ($('#frminvestmentRequest-currency').val() !== 'EUR') $(this).attr('disabled', 'disabled');
		});
		$('[id*="_local"]').each(function() {
			if ($('#frminvestmentRequest-currency').val() === 'EUR')$(this).attr('disabled', 'disabled');
		});

		//Contract fee / deposit (incl. VAT) counting
		$('#frminvestmentRequest-contractFee').keyup(function(){
			val = Math.round(parseFloat(convertNum($(this).val())) / parseFloat($('#frminvestmentRequest-fxRate').val()) * 100) / 100;
			$('#contract-fee-in-euro').html(accounting.formatMoney(val));
		});
		$('#frminvestmentRequest-contractFee').trigger('keyup');

		//Approval recieved on: enable disable input based on approval
		$('[id*="frminvestmentRequest-approvalOfAuthoritiesRequired-"]').change(function(){
			if ($(this).val() === 'approved') {
				$('#frminvestmentRequest-approvalRecievedOn').removeAttr('disabled');
			}
			else {
				$('#frminvestmentRequest-approvalRecievedOn').attr('disabled', 'disabled');
			}
		});
		$('[id*="frminvestmentRequest-approvalOfAuthoritiesRequired-"]').trigger('change');

		//In budget select toggle
		$('[id*="frminvestmentRequest-inBudget-"]').change(function(){
			if ($(this).val() === '1') {
				$('#frminvestmentRequest-budget').removeAttr('disabled');
			}
			else {
				$('#frminvestmentRequest-budget').attr('disabled', 'disabled').val('');
			}
		});
		$('[id*="frminvestmentRequest-inBudget-"]').trigger('change');

		// Change Capex Row for Currency
		toggleCurrency($('#frminvestmentRequest-currency'));
		$('#frminvestmentRequest-currency').change(function(){
			toggleCurrency($(this));
		});

		// Fill Tax
		$('[id*="_tax"]').change(function() {
			var newTax = $(this).val();

			if (!TaxChanged)
			{
				$('[id*="_tax"]').each(function() {
					$(this).val(newTax);
				});
				TaxChanged = true;
			}
		});


		$('[id*="_tax"]').keyup(function() {
			calculateValues();
		});
		$('[id*="_local"]').keyup(function(){
			calculateValues();
		});
		$('[id*="_eur"]').keyup(function() {
			calculateValues();
		});
		$('[id*="opex"], [id*="otherExpenses"]').keyup(function(){
			calculateValues();
		});
		$('#frminvestmentRequest-fxRate').focusout(function(){
			calculateValues();
		});

		//Enable all disabled fields on submit form and replace comma by dot (due to Nette and db)
		$('#frm-investmentRequest').submit(function(){
			$('input').each(function(){
				$(this).removeAttr('disabled');
			});
		});

	}
};

function calculateValues() {
	var totalCapex = 0;
	var totalIcs = 0;
	var currency = $('#frminvestmentRequest-currency').val();
	var fxRate = parseFloat((convertNum($('#frminvestmentRequest-fxRate').val())));

	if (currency !== 'EUR') {
		$('[id*="_local"]').each(function(){
			if ($(this).val() !== '') {
				var local = parseFloat(convertNum($(this).val()));
				var eurSum = local / fxRate;
				$(this).parent().next().find('.table-input').val(accounting.formatNumber(eurSum, 2, '', ','));
			}
		});
	}

	$('[id*="_eur"]').each(function(){
		if ($(this).val() !== '') {
			var tax = parseFloat(convertNum($(this).parent().prev().prev().find('.table-input').val()));
			var eur = parseFloat(convertNum($(this).val()));
			var taxsum = eur + (eur/100*tax);
			if ($(this).attr('id').indexOf('ics_') !== -1) {
				totalIcs += taxsum;
			}
			else {
				totalCapex += taxsum;
			}
		}
	});

	$('#total-capex').text(accounting.formatMoney(totalCapex));
	$('#total-ics').text(accounting.formatMoney(totalIcs));

	//OPEX
	var opex = parseFloat(convertNum($('#frminvestmentRequest-opex').val()));
	var opexTax = parseFloat(convertNum($('#frminvestmentRequest-opexTax').val()));
	if (isNaN(opexTax)) opexTax = 0;
	var opexSum = opex + (opex/100*opexTax);
	if (isNaN(opexSum)) opexSum = 0;

	$('#total-opex').text(accounting.formatMoney(opexSum));

	//Other expenses
	var other = parseFloat(convertNum($('#frminvestmentRequest-otherExpenses').val()));
	var otherTax = parseFloat(convertNum($('#frminvestmentRequest-otherExpensesTax').val()));
	if (isNaN(otherTax)) otherTax = 0;
	var otherSum = other + (other/100*otherTax);
	if (isNaN(otherSum)) otherSum = 0;

	//Total
	var totalSum = parseFloat(convertNum($('#total-capex').text())) + parseFloat(convertNum($('#total-ics').text())) + opexSum + otherSum;
	$('#total-sum').text(accounting.formatMoney(totalSum));


	$('#total-capex').val(accounting.formatMoney($('#total-capex')));
	$('#total-ics').val(accounting.formatMoney($('#total-ics')));
	$('#total-opex').val(accounting.formatMoney($('#total-opex')));
	$('#total-sum').val(accounting.formatMoney($('#total-sum')));
}

function convertNum(conNum) {
	var newNum = 0;
	if(conNum)
	{
		newNum = conNum.replace(".", ".").replace(',', '.');
	}

	return newNum;
}

function formatAccountingNumber(item) {
	item.val(accounting.formatNumber(item.val(), 2, '', ','));
}

function toggleCurrency(curreency) {
	if (curreency.val() === 'EUR') {
		$('[id*="_eur"]').each(function() {
			$(this).removeAttr('disabled');
		});
		$('[id*="_local"]').each(function() {
			$(this).attr('disabled', 'disabled');
		});

		$('#frminvestmentRequest-fxRate').val(1).attr('disabled', 'disabled');
	}
	else {
		$('[id*="_eur"]').each(function() {
			$(this).attr('disabled', 'disabled');
		});
		$('[id*="_local"]').each(function() {
			$(this).removeAttr('disabled');
		});
		$('#frminvestmentRequest-fxRate').removeAttr('disabled');
	}
}

function addDeprecationRow(_this) {
    if ($('.deprecationToAdd').length) {
        var iterator = parseInt($('.deprecationToAdd').last().find('input').attr('name').match(/[0-9]+/g));
        iterator++;
    }
    else {
        iterator = 0;
    }
    $(_this).parent().parent().after('<tr class="deprecationToAdd">\n\
								<td><input type="text" name="deprecations['+iterator+'][exp]" id="frminvestmentRequest-deprecations-'+iterator+'-exp" value="" /></td>\n\
								<td><input type="text" name="deprecations['+iterator+'][amount]" id="frminvestmentRequest-deprecations-'+iterator+'-amount" value="" /></td>\n\
								<td><input type="text" name="deprecations['+iterator+'][duration]" id="frminvestmentRequest-deprecations-'+iterator+'-duration" value="" /></td>\n\
								<td>\n\
									<a href="#" onclick="removeElement(this); return false;"><i class="icon-minus-sign"></i></a>\n\
									<a href="#" onclick="addDeprecationRow(this); return false;"><i class="icon-plus-sign"></i></a>\n\
								</td>\n\
							</tr>');
	$(_this).remove();

}

//////////////////////////////////
//Staff							//
//////////////////////////////////

var Staff = {
	initStaff: function(){
		//Company car
		toggleDrivingLicense();
		$('[name="companyCar"]').change(function(){
			toggleDrivingLicense();
		});

		function toggleDrivingLicense(){
			if ($('[name="companyCar"]').val() === '') {
				$('.driving-license-accordion').find(':input').attr('disabled', true);
				$('.driving-license-accordion').find('#drivingLicensePdf_field').hide();
			}
			else {
				$('.driving-license-accordion').find(':input').removeAttr('disabled');
				$('.driving-license-accordion').find('#drivingLicensePdf_field').show();
			}
		}


		//Company appartment
		var companyAppartmentLink = $('#companyAppartment-link > a').clone();
		checkRadioYesNo('companyAppartment', companyAppartmentLink);
		$('input[name="companyAppartment"]').change(function(){
			checkRadioYesNo('companyAppartment', companyAppartmentLink);
		});

		//Company credit card
		var companyCreditCardLink = $('#companyCreditCard-link > a').clone();
		checkRadioYesNo('companyCreditCard', companyCreditCardLink);
		$('input[name="companyCreditCard"]').change(function(){
			checkRadioYesNo('companyCreditCard', companyCreditCardLink);
		});

		function checkRadioYesNo(inputName, link){
			if ($('input[name="'+inputName+'"]:checked').val() === '0' || $('input[name="'+inputName+'"]:checked').val() == 'no') {
				$('#'+inputName+'-link > a').remove();
			}
			else {
				if (!$('#'+inputName+'-link > a').length) {
					$('#staff-subnavigation > li#'+inputName+'-link').append(link);
					$('#staff-subnavigation > li#'+inputName+'-link > a').attr('onclick', 'alert("Please save active form first!"); return false;');
				}
			}
		}

		//Work permit
		checkWorkPermit('workPermit', 'frmpersonalData-workPermitCategory');
		$('input[name="workPermit"]').change(function(){
			checkWorkPermit('workPermit', 'frmpersonalData-workPermitCategory');
		});
		function checkWorkPermit(inputName, id) {
			if ($('input[name="'+inputName+'"]:checked').val() == '0' || $('input[name="'+inputName+'"]:checked').val() == 'no' || $('input[name="'+inputName+'"]:checked').val() === undefined) {
				$('#'+id).attr('disabled', true);
			}
			else {
				$('#'+id).attr('disabled', false);
			}
		}

	}
};

function addMobilePhoneInput(_this) {
    if ($('.mobileToAdd').length) {
        var iterator = parseInt($('.mobileToAdd').last().attr('name').match(/[0-9]+/g));
        iterator++;
    }
    else {
        iterator = 0;
    }
    $(_this).before(
        '<div>\n\
            +<input type="text" name="mobilePhones['+iterator+'][prefix]" id="frmitRelatedData-mobilePhones-'+iterator+'-prefix" value="" />\n\
			<input type="text" class="mobileToAdd" name="mobilePhones['+iterator+'][phone]" id="frmitRelatedData-mobilePhones-'+iterator+'-phone" value="" />\n\
			<span>/</span><input type="text" name="mobilePhones['+iterator+'][postfix]" id="frmitRelatedData-mobilePhones-'+iterator+'-postfix" value="" />\n\
            <span><a href="#" onclick="removeElement(this); return false;"><i class="icon-minus-sign"></i>Remove mobile</a></span>\n\
        </div>');
}

function confirmDelete(){
	if(confirm('Are you sure?')){
		return true;
	}
	return false;
}
