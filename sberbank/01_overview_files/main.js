//url for Fileupload plugin
var accordionActive=0;
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
var url = window.location.origin+'/ajax/?dir=';

var data_nette_rules_filled='{op:\':filled\',msg:\'Please complete mandatory field.\'}';

$(document).ready(function(){
	initChoosen('');
	accounting.settings = {
		currency: {
			symbol : " EUR",   // default currency symbol is '$'
			format: "%v%s", // controls output: %s = symbol, %v = value/number (can be object: see below)
			decimal : ",",  // decimal point separator
			thousand: ".",  // thousands separator
			precision : 2   // decimal places
		},
		number: {
			precision : 0,  // default precision on numbers is 0
			thousand: ",",
			decimal : "."
		}
	};
	initAccordion();

	$('#accordionm,\n\
		#accounting-and-controlling-data-accordion,\n\
		#company-appartment-accordion,\n\
		#fm-related-data-accordion,\n\
		#it-related-data-accordion,\n\
		#organisational-data-accordion,\n\
		#personal-data-accordion,\n\
		#travel-related-data-accordion,\n\
		#investment-request-accordion').accordion({
			collapsible: true,
			// heightStyle: "content",
			heightStyle: "auto",
			navigation: true,
			header: 'h4',
//			activate: function(event, ui){
//				var index = $(this).find("h4").index(ui.newHeader[0]);
//				if (index) {
//					$.cookie('accordionIndex', parseInt(index));
//				}
//			},
			active: null
	});

	$('.tooltip').tooltip();
	initPopover();
	initDatePicker('');
	initTimePicker();
	Staff.initStaff();
	$.nette.init();
	initAjaxLoader();
});

function reloadJsSearch(){
	initChoosen("select.reload");
	initDatePicker('.datepicker.reload');
}

function initChoosen(ch){
	if(ch=='') ch="select";
	$(ch).chosen();
}
function initPopover(){
	$('.popover-tooltip').popover({
		trigger: 'hover',
		delay: 350,
		html: true,
		container: 'body'
	});
}

function initDatePicker(dp){
	if(dp=='') dp='.datepicker';
	$(dp).datepicker('remove');
	$(dp).datepicker({
		format: 'mm/dd/yyyy',
		weekStart: 1,
		autoclose: 1,
		todayBtn: 1,
		todayHighlight: 1
	}).on('changeDate', function(ev) {
		if($(ev.target).find('input').attr('name')=='internalEndDate' || $(ev.target).find('input').attr('name')=='externalEndDate'){
			showHideInternalExternalEndDateCheckbox();
		}
		if($(ev.target).find('input').attr('name')=='endDate'){
			showHideEndDateCheckbox();
		}
	});

	$('.add-on-datepickerdelete').click(function(){
		$(this).parent().find('input[type=text]').val('');
		if($(this).parent().find('input[type=text]').attr('name')=='internalEndDate' || $(this).parent().find('input[type=text]').attr('name')=='externalEndDate'){
			showHideInternalExternalEndDateCheckbox();
		}
		if($(this).parent().find('input').attr('name')=='endDate'){
			showHideEndDateCheckbox();
		}
	});
}

function initRTEditor() {
	//see also ckeditor config  file (js/vendor/ckeditor)
	$('textarea.RTE').ckeditor();
}

function initTimePicker(){
	//timepicker
	$('.timepicker').timepicker({
		minuteStep: 5,
		template: 'dropdown',
		showMeridian: false,
		defaultTime: false
	});
	$('.timepickerReservationOnChangeChangeCaterer').timepicker({
		minuteStep: 5,
		template: 'dropdown',
		showMeridian: false,
		defaultTime: false
	}).on('hide.timepicker', function(e){
		changeCaterer();
	});
	$('.add-on-timepickerdelete').click(function(){
		$(this).parent().find('input[type=text]').val('00:00');
	});
}

var url_tmp='';
function getFileUpload(id){
	url_tmp=$('#'+id).attr('_dir');
	$('#'+id).fileupload({
        url: url+url_tmp,
        dataType: 'json',
        done: function (e, data) {
        	$.each(data.result.files, function (index, file) {
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_uploadDiv').hide();
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_uploadProgress').hide();
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_uploadProgress .bar').css({'width':'0%'});
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_field').show();
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_field input[type="hidden"]').attr({'value':file.name});
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_image').attr({'src':$(e.target).attr('_imagepath')+file.name});
        		jQuery('#'+$(e.target).attr('id').replace('_upload','')+'_field a.download').attr({'href':$(e.target).attr('_filepath')+file.name});
        	});
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#'+id+'_progress .bar').css(
                'width',
                progress + '%'
            );
        }
    });
}

function removeDownload(_this) {
    jQuery('#'+_this+'_uploadDiv').show();
    jQuery('#'+_this+'_uploadProgress').show();
    jQuery('#'+_this+'_field').hide();
	jQuery('#'+_this+'_field input[type="hidden"]').attr({'value':''});
	jQuery('#'+_this+'_field a.download').attr({'href':''});
	jQuery('#'+_this+'_image').attr({'src':jQuery('#'+_this+'_image').attr('_src')});
}

function addAnnouncementInput(_this){
	var iterator=0
	$('input[id^="frm-announcementForm-files-"]').each(function(i){
		id=parseInt($(this).attr('name').replace('][path]','').replace('files[',''));
		if(id>iterator) iterator=id;
	});
	iterator++;
	$('#announcementToAdd').append(getUploadFormElement('files','path',iterator,0,'/files/documents/Announcements/'));
	getFileUpload('files_'+iterator+'__path__upload');
}
function addDishFileInput(_this){
	var iterator=0
	$('input[id^="frm-dishForm-files-"]').each(function(i){
		id=parseInt($(this).attr('name').replace('][path]','').replace('files[',''));
		if(id>iterator) iterator=id;
	});
	iterator++;
	$('#dishFileToAdd').append(getUploadFormElement('files','path',iterator,13,'/files/documents/Dishes/'));
	getFileUpload('files_'+iterator+'__path__upload');
}
var canAddParticipantForm=true;
function addParticipantForm() {
	if(!canAddParticipantForm) return false;
    if ($('.participantToAdd').length) {
        var iterator = parseInt($('.participantToAdd').last().find('input').attr('name').match(/[0-9]+/g));
        iterator++;
    }
    else {
        iterator = 0;
    }
    $('#addParticipantLink').parent().before('<dl class="participantToAdd">'
					//+'<dt><label for="frm-roomReservationForm-participantsData-'+iterator+'-title" class="required">Title:*</label></dt>'
					+'<dd><input type="text" value="" placeholder="Title" data-nette-rules="{op:\':filled\',msg:\'Please complete mandatory field.\'}" required="required" id="frm-roomReservationForm-participantsData-'+iterator+'-title" name="participantsData['+iterator+'][title]" class="text"></dd>'
					//+'<dt><label for="frm-roomReservationForm-participantsData-'+iterator+'-lastName" class="required">Last name:*</label></dt>'
					+'<dd><input type="text" value="" placeholder="Last name" data-nette-rules="{op:\':filled\',msg:\'Please complete mandatory field.\'}" required="required" id="frm-roomReservationForm-participantsData-'+iterator+'-lastName" name="participantsData['+iterator+'][lastName]" class="text"></dd>'
					//+'<dt><label for="frm-roomReservationForm-participantsData-'+iterator+'-firstName" class="required">First name:*</label></dt>'
					+'<dd><input type="text" value="" placeholder="First name" data-nette-rules="{op:\':filled\',msg:\'Please complete mandatory field.\'}" required="required" id="frm-roomReservationForm-participantsData-'+iterator+'-firstName" name="participantsData['+iterator+'][firstName]" class="text"></dd>'
					//+'<dt><label for="frm-roomReservationForm-participantsData-'+iterator+'-company">Company:</label></dt>'
					+'<dd><input type="text" value="" placeholder="Company" id="frm-roomReservationForm-participantsData-'+iterator+'-company" name="participantsData['+iterator+'][company]" class="text"></dd>'
					+'<dd><a class="linkButton" onclick="removeElement(this); return false;" href="#"><i class="icon-minus-sign icon-white"></i> Remove Participant</a></dd>'
					+'<div style="display:none;"><input type="hidden" value="" id="frm-roomReservationForm-participantsData-'+iterator+'-id" name="participantsData['+iterator+'][id]"></div>'
				+'</dl>');
}

//Also change in customUploadFile.latte in components templates
function getUploadFormElement(name1,name2,iterator,dir,filepath){
	return  '	<div id="'+name1+'_'+iterator+'__'+name2+'__uploadDiv">'
		+'		<span class="fileinput-button">'
     	+'			<i class="icon-upload"></i> Upload file'
     	+'   		<input type="file" _filepath="'+filepath+'" _dir="'+dir+'" class="'+name1+'['+iterator+']['+name2+']" multiple="" name="'+name1+'[]" id="'+name1+'_'+iterator+'__'+name2+'__upload">'
   		+' 		</span>'
		+'	</div>'
		+'	<div class="progress progress-success progress-striped" id="'+name1+'_'+iterator+'__'+name2+'__uploadProgress">'
 		+'		<div class="bar"></div>'
		+'	</div>'
		+'	<div class="hide" id="'+name1+'_'+iterator+'__'+name2+'__field">'
		+'		<div class="row">'
		+'			<span class="span5">already uploaded</span>'
		+'			<span class="span4">'
		+'				<input type="hidden" value="" id="frm-announcementForm-'+name1+'-'+iterator+'-'+name2+'" name="'+name1+'['+iterator+']['+name2+']">'
		+'				<a class="download" href="" target="_blank"><i class="icon-eye-open"></i>Open</a>'
		+'				<a href="#" onclick="removeDownload(&quot;'+name1+'_'+iterator+'__'+name2+'_&quot;); return false;"><i class="icon-minus-sign"></i>Delete file</a>'
		+'			</span>'
		+'		</div>'
		+'	</div>';


}

function addOnBoardingKeyNumber(_this) {
    if ($('.onBoardingKeyNumberToAdd').length) {
        var iterator = parseInt($('.onBoardingKeyNumberToAdd').last().attr('name').match(/[0-9]+/g));
        iterator++;
    }
    else {
        iterator = 0;
    }
    $(_this).before(
        '<div>\n\
            <input type="text" class="onBoardingKeyNumberToAdd" name="keyNumbers['+iterator+'][keyNumber]" id="frm-onBoardingFMData-keyNumbers-'+iterator+'-keyNumber" >\n\
            <span><a href="#" onclick="removeElement(this); return false;"><i class="icon-minus-sign"></i>Remove Key number</a></span>\n\
        </div>');
}
function addOnBoardingKeyCardNumber(_this) {
    if ($('.onBoardingKeyCardNumberToAdd').length) {
        var iterator = parseInt($('.onBoardingKeyCardNumberToAdd').last().attr('name').match(/[0-9]+/g));
        iterator++;
    }
    else {
        iterator = 0;
    }
    $(_this).before(
        '<div>\n\
            <input type="text" class="onBoardingKeyCardNumberToAdd" name="keyCardNumbers['+iterator+'][keyCardNumber]" id="frm-onBoardingFMData-keyCardNumbers-'+iterator+'-keyCardNumber" >\n\
            <span><a href="#" onclick="removeElement(this); return false;"><i class="icon-minus-sign"></i>Remove Key card number</a></span>\n\
        </div>');
}

function removeElement(_this) {
    $(_this).parent().parent().remove();
}

function loadErrorModal(text){
	$('#error-modal .modal-body p').html(text);
	$('#error-modal').modal();
}

function selfSubmitForm(selector) {
	$(selector).change(function() {
		$(this).closest('form').submit();
	});
}