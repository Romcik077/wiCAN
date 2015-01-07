var dialog1 = "#dialog1";
var dialog2 = "#dialog2";

var
createProject,
newProjectDialog,
newProjectForm;

var tabs;

var connection;

var userData;

var projectTree;
    

$( function() {
    
    showLoadingDialog();
    
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
                    
                    if(userData.projects === undefined){
                        userData.projects = [];
                    }
                    
                    $("#username").text(recievedData.result.name);
                    
                    $("#tree")
                    .dynatree({
                        onActivate: function(node, event){
                            $( "#openProject" ).button("option", "disabled", true);
                            $( "#removeProject" ).button("option", "disabled", true);
                            $( "#runProject" ).button("option", "disabled", true);
                            $( "#createWorkspace" ).button("option", "disabled", true);
                            $( "#removeWorkspace" ).button("option", "disabled", true);
                            $( "#creatEcu" ).button("option", "disabled", true);
                            $( "#removeEcu" ).button("option", "disabled", true);
                            $( "#createMessage" ).button("option", "disabled", true);
                            $( "#removeMessage" ).button("option", "disabled", true);
                            $( "#editMessage" ).button("option", "disabled", true);
                            $( "#uploadDbcFile" ).button("option", "disabled", true);
                            $( "#createView" ).button("option", "disabled", true);
                            $( "#createControl" ).button("option", "disabled", true);
                            
                            if(node.data.key.indexOf("project") > -1){
                                $( "#openProject" ).button("option", "disabled", false);
                                $( "#removeProject" ).button("option", "disabled", false);
                                $( "#runProject" ).button("option", "disabled", false);
                            }
                            
                            if(node.data.key.indexOf("workspaces") > -1){
                                $( "#createWorkspace" ).button("option", "disabled", false);
                                $( "#removeWorkspace" ).button("option", "disabled", false);
                            }
                            
                            if(node.data.key.indexOf("ecus") > -1){
                                $( "#creatEcu" ).button("option", "disabled", false);
                                $( "#removeEcu" ).button("option", "disabled", false);
                            }
                            
                            
                        },
                        children: userData.projects
                    });
                    
                    projectTree = $("#tree").dynatree("getTree");
                    
                    if(userData.projects.length !== 0) {
                        listProjectsTitle();
                    } else {
                        
                    }
                    
                    
                    
                    hideLoadingDialog();
                    $("#container").show();
                    break;
                case 'postUserData':
                    if(recievedData.result != "ok") {
                        alert("Update server data error");
                    } else {
                        console.log("Updated");
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
    };
    
    tabs = $( "#tabs" ).tabs({
        heightStyle: "fill"
    });
    
    $("div.ui-tabs-panel").css('padding','0px');
    
    $( window ).resize(function() {
        tabs.tabs( "refresh" );
    });

	tabs.tabs( "refresh" );
    
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
        
    createProject = $( "#createProject" )
        .button()
        .click(function(event) {
            newProjectDialog.dialog("open");
        });
        
    $( "#removeProject" )
        .button({
            disabled: true
        });
        
    $( "#openProject" )
        .button({
            disabled: true
        })
        .click(function(event) {
            listProjectsTitle();
            
            openProject(projectTree.getActiveNode());
        });
        
    $( "#runProject" )
        .button({
            disabled: true
        });
        
    $( "#createWorkspace" )
        .button({
            disabled: true
        });
    
    $( "#removeWorkspace" )
        .button({
            disabled: true
        });
        
    $( "#creatEcu" )
        .button({
            disabled: true
        });
    
    $( "#removeEcu" )
        .button({
            disabled: true
        });
    
    $( "#createMessage" )
        .button({
            disabled: true
        });
        
    $( "#removeMessage" )
        .button({
            disabled: true
        });
        
    $( "#editMessage" )
        .button({
            disabled: true
        });
    
    $( "#uploadDbcFile" )
        .button({
            disabled: true
        });
    
    $( "#createView" )
        .button({
            disabled: true
        });
    
    $( "#createControl" )
        .button({
            disabled: true
        });
        
    newProjectDialog = $( "#newProject-dialog" ).dialog({
        autoOpen: false,
        height: 170,
        width: 350,
        minHeight: 170,
        maxHeight: 170,
        minWidth:200,
        maxWidth:400,
        modal: true,
        buttons: [
            {
                text: "Create a project",
                click: function() {
                    newProjectForm.submit();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    newProjectDialog.dialog( "close" );
                }
            }
        ],
        close: function() {
            newProjectForm[0].reset();
            $("label[for='name']").text("Name");
            $("#newProjectName").removeClass("ui-state-error");
        }
    });
    
    newProjectForm = newProjectDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        
        var valid = true;
        var newProjectName = $("#newProjectName");
    
        valid = valid && checkLength( newProjectName, "Name", 3, 16 );
        
        if(valid) {
            var keyValid = false;
            var key;
            while(!keyValid) {
                key = make_token(5);
                
                if(userData.projects.length !== 0) {
                    for(var i=0; i<userData.projects.length; i++) {
                        if(userData.projects[i].key === key) {
                            keyValid = false;
                        } else {
                            keyValid = true;
                        }
                    }
                } else {
                    keyValid = true;
                }
            }
            
            var newProjectTemplate = {
                title: $("#newProjectName").val(),
                key: "project_" + key,
                isFolder: true,
                expand: false,
                children: [
                    {
                        title: "Workspaces",
                        isFolder: true,
                        key: "workspaces",
                        children: []
                    },
                    {
                        title: "ECUs",
                        isFolder: true,
                        key: "ecus",
                        children: []
                    }
                ]
            };
            
            userData.projects.push(newProjectTemplate);
            projectTree.getRoot().removeChildren();
            projectTree.getRoot().addChild(userData.projects);
            listProjectsTitle();
            projectTree.activateKey("project_"+key);
            openProject(projectTree.getActiveNode());
            
            newProjectDialog.dialog( "close" );
        } else {
            
        }
    }); 

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
		event.preventDefault();
	   // hideLoadingDialog();
// 		$( "#dialog1" ).dialog( "open" );
        var message = {
            type: "postUserData",
            result: userData
        };
        
        connection.send(JSON.stringify(message));
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

function listProjectsTitle() {
    for(var i=0; i<projectTree.getRoot().getChildren().length; i++) {
        projectTree.getRoot().getChildren()[i].removeChildren();
    }
}

function openProject(currentNode) {
    if(currentNode){
        for(var i=0; i<userData.projects.length; i++) {
            if(currentNode.data.key === userData.projects[i].key){
                currentNode.addChild(userData.projects[i].children);
                currentNode.expand(true);
                break;
            }
        }
    } else {
        alert("Select project");
    }
}

function make_token(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        $("label[for='name']").text("Nmae: Length must be between " + min + " and " + max + ".");
        setTimeout(function() {
            o.removeClass( "ui-state-error", 1500 );
        }, 500 );
        return false;
    } else {
        return true;
    }
}