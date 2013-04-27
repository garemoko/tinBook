/*
=============COPYRIGHT============ 
Tin Book - An I-Read-This prototype for Tin Can API
Copyright (C) 2012  Andrew Downes

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
<http://www.gnu.org/licenses/>.
*/



//Create an instance of the Tin Can Library
var myTinCan = new TinCan();

myTinCan.enableDebug = 1;

//Create an LRS and add to the list of record stores
var myLRS = new TinCan.LRS({
	endpoint:"https://cloud.scorm.com/ScormEngineInterface/TCAPI/public/", 
	version: "0.95",
	auth: 'Basic ' + Base64.encode("<account id>" + ':' + "<password>")
});
myTinCan.recordStores[0] = myLRS;

//Set the default actor
var myActor = new TinCan.Agent({
	name : "Bob Smith",
	mbox : "mailto:dummy@example.com"
});

myTinCan.actor = myActor;



/*============DOCUMENT READY==============*/
$(function(){
	$('#searchButton').click(function(){
		//TODO: sanitise the search input			
		$.getScript('https://www.googleapis.com/books/v1/volumes?q=' + $('#searchBox').val() + '&callback=listBooks');
		
	});

	$("#searchBox").keyup(function(event){
		if(event.keyCode == 13){
			$("#searchButton").click();
		}
	});

});
/*============END DOCUMENT READY==============*/

/*============SEARCH RESULTS==============*/
function listBooks(response) {
	$('#content').html('');
	
  for (var i = 0; i < response.items.length; i++) {
	var item = response.items[i];
	// in production code, item.text should have the HTML entities escaped.
	var bookElement = $('<div></div>'); 
	bookElement.append ($('<span class="IReadThisButton">I Read This!</span>'));
	bookElement.append ($('<span class="title">' + item.volumeInfo.title + '</span>'));
	bookElement.append ($('<span class="authors">Author(s): ' + item.volumeInfo.authors + '</span>'));
	bookElement.append ($('<span class="publishedDate">Published: ' + item.volumeInfo.publishedDate + '</span>'));		
	bookElement.append ($('<span class="publisher">Publisher: ' + item.volumeInfo.publisher + '</span>'));	
	bookElement.addClass('bookElement');			
	$('#content').append(bookElement);
	
				
  };
  
  
  $('.IReadThisButton').click(function(){
	var item = response.items[$('.bookElement').index($(this).parent('div'))];
		
	/*============SEND STATEMENT==============*/
	//Create the verb
	var myVerb = new TinCan.Verb({
		id : "http://www.tincanapi.co.uk/wiki/verbs:read",
		display : {
			"en-US":"read", 
			"en-GB":"read"
		}
	});
	
	//Create the activity definition
	var myActivityDefinition = new TinCan.ActivityDefinition({
		name : {
			"en-US":item.volumeInfo.title, 
			"en-GB":item.volumeInfo.title
		},
		description : {
			"en-US":item.volumeInfo.description, 
			"en-GB":item.volumeInfo.description
		}
	});
	
	//Create the activity
	var myActivity = new TinCan.Activity({
		id : item.selfLink,
		definition : myActivityDefinition
	});
	
	//create the statement
	var stmt = new TinCan.Statement({
		actor : myActor,
		verb : myVerb,
		target : myActivity
	},true);
	
	myTinCan.sendStatement(stmt, function() {
		/*============DISPLAY SENT DATA==============*/
		var bookElement = $('<div></div>'); 
		bookElement.append ($('<span class="YouRead">You Read This:</span>'));
		bookElement.append ($('<span class="title">' + item.volumeInfo.title + '</span>'));
		bookElement.append ($('<span class="authors">Author(s): ' + item.volumeInfo.authors + '</span>'));
		bookElement.append ($('<span class="publishedDate">Published: ' + item.volumeInfo.publishedDate + '</span>'));		
		bookElement.append ($('<span class="publisher">Publisher: ' + item.volumeInfo.publisher + '</span>'));	
		bookElement.addClass('bookElement');			
		$('body').html(bookElement);
		$('body').append ($('<span class="instructions">Statement reported to LRS. Refresh this page to start again!</span>'));
		$('body').append ($('<p><a href="http://tincanapi.com/statement-viewer/" target="_blank">Click here to see the results</a></p>'));
	});
	/*============END DISPLAY SENT DATA==============*/
  });
  /*============END SEND STATEMENT==============*/
};
/*============END SEARCH RESULTS==============*/