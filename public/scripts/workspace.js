var dialog1 = "#dialog1";
var dialog2 = "#dialog2";

var projectTree = [{
    title: "Projects",
    isFolder: true,
    expand: true,
    unselectable: false,
    children: [{
        title: "Project ",
        isFolder: true,
        key: "project1",
        children: [
            {title: "Sub-item 2."},
            {title: "Sub-item 2.2"},                               
            {title: "Item 3"},
            {title: "Item 3"},
            {title: "Item 3"},
            {title: "Item 3"},
            {title: "Item 3"}
        ]},
        {title: "Item 3"}
    ]
}];

var tabs = null;

var connection;

var userData;
    

$( function() {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    connection = new WebSocket('wss://raspican_web-c9-romcik077.c9.io/');

    connection.onopen = function () {
        console.log("connected");
        
        var message = {
            type: "getUserData"
        };
        
        connection.send(JSON.stringify(message));
    };
    
    connection.onclose = function() {
        console.log("connection closed");
        window.location.replace("/");
    };

    connection.onerror = function (error) {
        console.log("error connection" + error);
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message from server is json)
        var recievedData;
        try {
            recievedData = JSON.parse(message.data);
            
            switch (recievedData.type) {
                case 'getUserData':
                    userData = recievedData.result;
                    hideLoadingDialog();
                    $("#container").show();
                    break;
                case 'postUserData':
                    if(recievedData.result != "ok") {
                        alert("Update server data error");
                    }
                    break;
                case 'cmd':
                    
                    break;
                default:
                    console.log("Get a incorrect request: "+ recievedData.type);
            }
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        
        
        
        // handle incoming message
    };
    
    showLoadingDialog();
    
    tabs = $( "#tabs" ).tabs({
        heightStyle: "fill"
    });
    
    $("div.ui-tabs-panel").css('padding','0px');
    
    $( window ).resize(function() {
        tabs.tabs( "refresh" );
    });

	tabs.tabs( "refresh" );
    
    $("#tree")
        .dynatree({
            children: null
        });
    
    // Link to open the dialog
    $( "#logout-button" )
        .button({
            icons: { primary: "ui-icon-locked"}
        })
        .click(function(event){
            $.post("/logout", function(data, status) {
                window.location.href = "/";
            });
        });
        
    $( "#help-button" )
        .button({
        	icons: { primary: "ui-icon-comment"}
        })
        .click(function(event){
            window.location.href = "/help.html";
        });
        
    $( "#btnproject1" )
        .button();
        
    $( "#btnproject2" )
        .button();
    
    $( "#btnproject3" )
        .button();
        
    $( "#btnproject4" )
        .button();
        
    $( "#btnproject5" )
        .button();
    
    $( "#btnproject6" )
        .button();
        
    $( "#btnproject7" )
        .button();
    
    $( "#btnproject8" )
        .button();
        
    $( "#btnproject9" )
        .button();
        
    $( "#btnproject10" )
        .button();
    
    $( "#btnview" )
        .button();
    
    $( "#btncontrol" )
        .button();

	init_dialog(dialog1);
	init_dialog(dialog2);
});

function init_dialog(parameter) {
	$( parameter ).dialog({
		autoOpen: false,
		appendTo: "#tabs-1",
		buttons: [
			{
				text:	"Ok",
				click:	function() {
							$( this ).dialog( "close" );
						}
			},
			{
				text:	"Cancel",
				click: 	function() {
							$( this ).dialog( "close" );
						}
			}
		]
	});
	
	$( parameter ).dialog("widget").draggable("option","containment","#tabs-1");
	//$( parameter ).dialog("widget").resizable("option","containment","#tabs-1");
    
	// Hover states on the static widgets
	$( "#dialog1-link, #dialog2-link").hover(
		function() {
			$( this ).addClass( "ui-state-hover" );
		},
		function() {
			$( this ).removeClass( "ui-state-hover" );
		}
	);
	
	// Link to open the dialog
	$( "#dialog1-link" )
	.button({
		icons: { primary: "ui-icon-newwin"}
	})
	.click(function( event ) {
	    hideLoadingDialog();
// 		$( "#dialog1" ).dialog( "open" );
		event.preventDefault();
	});
	
	$( "#dialog2-link" ).button({
		icons: { primary: "ui-icon-newwin"}
	})
	.click(function( event ) {
		$( "#dialog2" ).dialog( "open" );
		event.preventDefault();
	});
}

function showLoadingDialog() {
    loadingDialog = $( "<div></div>" )
    .appendTo( "body" )
    .dialog({
        modal: true,
        resizable: false,
        closeOnEscape: false,
        open: function(event, ui) {
          $(".ui-dialog-titlebar-close").hide();
        },
        title: "Loading"
    });
    
    loadingDialog.dialog("open");
}

function hideLoadingDialog() {
    loadingDialog.dialog("close");
    
}