/* script.js */
//Author: Mengyang (Vicky) Li
//Final Project: This is a web application that takes 2 input, the name of the food and the amount in grams, and makes two AJAX calls to USDA API's. As a result, the total calorie is printed to the page.
//For example: if you want to know the amount of calories in 10g of 1% lowfat milk with added vitamins A and D, then you need to type "milk" and "10" to the two input fields, then select "Milk, lowfat, fluid, 1% milkfat, with added nonfat milk solids, vitamin A and vitamin D" from the list. Finally, you will see the output is 4.3 Calories.
'use strict';
//The free license I got from USDA is: xxGfZXbLE1arW5TY5cngz0EA9rW3LWNkcO4ox37H
var APIKEY = "xxGfZXbLE1arW5TY5cngz0EA9rW3LWNkcO4ox37H";
window.onload=function(){
	//when clicking the "look up!" button, making an AJAX call to USDA's public API. 
	//here is the website: https://ndb.nal.usda.gov/ndb/doc/apilist/API-SEARCH.md
	//in the URL, I restrict the max number of rows to return to be 25
	$("#submitBtn").on("click",function(evt){ //get the submit button and implement an onclick event handler
		var food = $("#food").val() //get the entered value of food
		var amount = $("#amount").val() //get the entered amount of food
		if(food !== ""){ //form validation: making sure the food input field is filled in
			$("#foodEmpty").css("display","none"); //change the css display back to none
			var pattern = /\d+/;
			if (pattern.test(amount)===true){ //form validation: making sure the amount field is filled in and also has a valid number
				$("#amountEmpty").css("display","none");
				//make an AJAX call to the USDA API
				$("#calorieField label").remove(); //remove all <label>'s from previous searches
				$.ajax("http://api.nal.usda.gov/ndb/search/?format=json&q="+encodeURIComponent(food)+"&max=25&offset=0&api_key="+APIKEY) //using encodeURIComponent to prevent bad input like M&M
					.done(function(data){ //when the request is successful
						for(var i=0; i<data.list.end; i++){
							var foodName = data.list.item[i].name //extract the name of the returned food, which is used to populate the radio button list
							var ndbno = data.list.item[i].ndbno //extract the ndbno, which is used when making the next AJAX call
							//create a radio button surrounded by <label>, so when one clicks on the text, the button is selected. The text for each button is the foodName
							var radioBtn = $("<label><input type='radio' name='returnedFood' value="+ndbno+"></input>"+foodName+"<br></label>");
							$("#calorieField").append(radioBtn); //append the radio button to the fieldset
							
						}

						$("#calorieField input[type='radio']").on("change",checkRadioBtn); //create an event handler on change, which calls checkRadioBtn()

					})
					.fail(function(){ //when the request is not successful
						alert("No result found!");
					});
			}
			else{ //display the hint message since the amount entered isn't valid
				$("#amountEmpty").css("display","block");
			}
		}
		else{ //display the hint message since the food isn't entered
			$("#foodEmpty").css("display","block");
		}

		evt.preventDefault(); //prevent the submit button from reloading the page
	});

	
};
//a function that checks which radio button is selected and makes an AJAX call based on the selected radio button. Finally, it outputs to the output div to display the total calorie.
function checkRadioBtn(){
	var amount = $("#amount").val() //get the entered amount of food
	var selected  = $("#calorieField input[type='radio']:checked"); //get the checked radio button
	if (selected.length > 0){
		var ndbno = selected.val();
		//make the second AJAX call. Here is the website: https://ndb.nal.usda.gov/ndb/doc/apilist/API-FOOD-REPORT.md
		$.ajax("http://api.nal.usda.gov/ndb/reports/?ndbno="+ndbno+"&format=json&api_key="+APIKEY)
			.done(function(data){ //if the request is successful
				//to get the number of kcal from the response, we need to iterate over the array and choose the item that contains the data that we are looking for
				for(var j = 0; j < data.report.food.nutrients.length; j++){
					if(data.report.food.nutrients[j].name === "Energy" && data.report.food.nutrients[j].unit === "kcal"){ 
						var value = Number(data.report.food.nutrients[j].value); 
						var calorie = amount*value/100; //total calorie is value(g) * amount(kcal/100g) / 100
						$("#output").html(calorie);
					}
				}
			})
			.fail(function(){
				alert("No result found");
			})
	}
}