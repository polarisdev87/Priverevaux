jQuery(document).ready(function(){
    jQuery('#check_qualify').validate({
		focusCleanup: true,
		rules: {
			name: 'required',
		    birthdate:'required',
		    billing_state:'required',
		    /*brand:'required',
		    left_eye_power:'required',
		    right_eye_power:'required',
		    base_curve:'required',
		    diameter:'required',*/
		},
		messages:{
			name: 'This field is required',
		    birthdate:'This field is required.',
		    billing_state:'This field is required.',
		    /*brand:'This field is required',
		    left_eye_power:'This field is required',
		    right_eye_power:'This field is required',
		    base_curve:'This field is required',
		    diameter:'This field is required',*/
		},
		submitHandler: function(form) {
		    /*var formdata = jQuery('#check_qualify').serialize();
		    var left_eye_power_select = jQuery('#left_eye_power_select').val();
		    var right_eye_power_select = jQuery('#right_eye_power_select').val();
		    if(left_eye_power_select > 3.5){
				jQuery('#left_eye_power_select_error').css('display','block');
				jQuery('#left_eye_power_select_error').text('We currently don\'t offer lens powers greater than +3.50.');
				q_flag++;
			}
			else{
				jQuery('#left_eye_power_select_error').css('display','none');
				jQuery('#left_eye_power_select_error').text('');
			}

		    if(right_eye_power_select > 3.5){
				jQuery('#right_eye_power_select_error').css('display','block');
				jQuery('#right_eye_power_select_error').text('We currently don\'t offer lens powers greater than +3.50.');
				q_flag++;
			}
			else{
				jQuery('#right_eye_power_select_error').css('display','none');
				jQuery('#right_eye_power_select_error').text('');
            }*/
					//console.log(formdata);    
					jQuery.ajax({
						type: "POST",
						url: 'https://dev.priverevaux.com/opternative/opternative.php',
						data: {
							birthdate:jQuery('#birthdate').val(),
							billing_state:jQuery('#billing_state').val()
						},
						dataType: 'json',
						success: function (data) {
							var firstProp;
							for(var key in data) {
								if(data.hasOwnProperty(key)) {
									firstProp = data[key];
									break;
								}
							}
							if( firstProp === true ){
							jQuery('#priscription_info').css('display','hidden');
							jQuery('.btn-holder').html('<a href="/cart/add?id=13665333215291&amp;quantity=1" class="btn btn-prive">You Qualify! Add Exam to cart</a>');
							sessionStorage.setItem('birthdate', jQuery('#birthdate').val());
							var prescription = '{"type": "glasses", "verification": "verified","right_eye": {"sphere": -1.0, "cylinder": -0.25,"axis": 90},"left_eye": {"sphere": -1.0,"cylinder": -0.25,"axis": 90}}';
							sessionStorage.setItem('prescription',prescription);
							}
							else{
							jQuery('.btn-holder').html("Sorry, you didn't qualify");
							}
						},
						error: function (xhr, textStatus, errorThrown) {
							alert("Error: " + (errorThrown ? errorThrown : xhr.status));
						}
					});					             
		    jQuery('#priscription_info').html('Please wait...');
			jQuery('#priscription_info').attr("disabled", true);
		}
    });
});