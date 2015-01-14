var dialog1 = "#dialog1";
var dialog2 = "#dialog2";

var
createProject,
newProjectDialog,
newProjectForm,
newWorkspaceDialog,
newWorkspaceForm,
newEcuDialog,
newEcuForm,
newMessageDialog,
newMessageForm;

var tabs;

var connection;

var userData;

var projectTree;

var currentProjectNode,
currentProjectData;
    

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
                            }
                            if(node.data.key.indexOf("workspace_") > -1) {
                                $( "#removeWorkspace" ).button("option", "disabled", false);
                                $( "#createView" ).button("option", "disabled", false);
                                $( "#createControl" ).button("option", "disabled", false);
                            }
                            
                            if(node.data.key.indexOf("ecus") > -1){
                                $( "#creatEcu" ).button("option", "disabled", false);
                            }
                            if(node.data.key.indexOf("ecu_") > -1) {
                                $( "#removeEcu" ).button("option", "disabled", false);
                            }
                            if(node.data.key.indexOf("tx-messages") > -1 || node.data.key.indexOf("rx-messages") > -1) {
                                $( "#createMessage" ).button("option", "disabled", false);
                                // $( "#removeMessage" ).button("option", "disabled", false);
                            }
                        },
                        clickFolderMode: 1
                    });
                    
                    projectTree = $("#tree").dynatree("getTree");
                    
                    projectTree.getRoot().addChild(userData.projects);
                    updateTree();
                    
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
    
    // $("div.ui-tabs-panel").css('padding','0px');
    
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
        
    $( "#createProject" )
        .button()
        .click(function(event) {
            newProjectDialog.dialog("open");
        });
        
    $( "#removeProject" )
        .button({
            disabled: true
        })
        .click(function(event) {
            var projectToRemove = projectTree.getActiveNode().data.key;
            for(var i=0; i<userData.projects.length; i++){
                if(userData.projects[i].key === projectToRemove) {
                    userData.projects.splice(i,1);
                    var nodeToRemove = projectTree.getNodeByKey(projectToRemove);
                    if(nodeToRemove == currentProjectNode) {
                        currentProjectNode = null;
                        currentProjectData = null;
                        projectTree.getRoot().getChildren()[0].activate();
                        projectTree.getRoot().getChildren()[0].focus();
                        nodeToRemove.remove();
                    } else {
                        nodeToRemove.remove();
                    }
                    break;
                }
            }
            postUserData();
            updateTree();
            updateTabs();
        });
        
    $( "#openProject" )
        .button({
            disabled: true
        })
        .click(function(event) {
            // currentProjectKey = projectTree.getActiveNode().data.key;
            var tempResult = $.grep(userData.projects, function(e){
                return e.key == projectTree.getActiveNode().data.key;
            });
            currentProjectData = tempResult[0];
            currentProjectNode = null;
            updateTree();
            updateTabs(true);
        });
        
    $( "#runProject" )
        .button({
            disabled: true
        });
        
    $( "#createWorkspace" )
        .button({
            disabled: true
        })
        .click(function(event) {
            newWorkspaceDialog.dialog("open");
        });
    
    $( "#removeWorkspace" )
        .button({
            disabled: true
        })
        .click(function(event) {
            var workspaceList = currentProjectData.children[0].children;
            var workspaceToRemove = projectTree.getActiveNode().data.key;
            for(var i=0; i<workspaceList.length; i++){
                if(workspaceList[i].key === workspaceToRemove) {
                    workspaceList.splice(i,1);
                    var nodeToRemove = projectTree.getNodeByKey(workspaceToRemove);
                    nodeToRemove.remove();
                    break;
                }
            }
            postUserData();
            updateTree("workspaces");
            updateTabs(true);
        });
        
    $( "#creatEcu" )
        .button({
            disabled: true
        })
        .click(function(event) {
            newEcuDialog.dialog("open");
        });
    
    $( "#removeEcu" )
        .button({
            disabled: true
        })
        .click(function(event) {
            var ecuList = currentProjectData.children[1].children;
            var ecuToRemove = projectTree.getActiveNode().data.key;
            for(var i=0; i<ecuList.length; i++){
                if(ecuList[i].key === ecuToRemove) {
                    ecuList.splice(i,1);
                    var nodeToRemove = projectTree.getNodeByKey(ecuToRemove);
                    nodeToRemove.remove();
                    break;
                }
            }
            postUserData();
            updateTree("ecus");
            updateTabs(true);
        });
    
    $( "#createMessage" )
        .button({
            disabled: true
        })
        .click((function(event) {
            newMessageDialog.dialog("open");
        }));
        
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
        minWidth:250,
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
            $("label[for='nameProject']").text("Name");
            $("#newProjectName").removeClass("ui-state-error");
        }
    });
    newProjectForm = newProjectDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        
        var valid = true;
        var newProjectName = $("#newProjectName");
    
        valid = valid && checkLength( newProjectName, "nameProject", 3, 16 );
        
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
            postUserData();
            projectTree.getRoot().addChild(userData.projects[userData.projects.length-1]);
            currentProjectNode = null;
            currentProjectData = userData.projects[userData.projects.length-1];
            updateTree();
            
            newProjectDialog.dialog( "close" );
        } else {
            
        }
    }); 
    
    newWorkspaceDialog = $( "#newWorkspace-dialog" ).dialog({
        autoOpen: false,
        height: 170,
        width: 350,
        minHeight: 170,
        maxHeight: 170,
        minWidth:250,
        maxWidth:400,
        modal: true,
        buttons: [
            {
                text: "Create a workspace",
                click: function() {
                    newWorkspaceForm.submit();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    newWorkspaceDialog.dialog( "close" );
                }
            }
        ],
        close: function() {
            newWorkspaceForm[0].reset();
            $("label[for='nameWorkspace']").text("Name");
            $("#newWorkspaceName").removeClass("ui-state-error");
        }
    });
    newWorkspaceForm = newWorkspaceDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        
        var workspaceChildren = currentProjectData.children[0].children;
        var valid = true;
        var newWorkspaceName = $("#newWorkspaceName");
    
        valid = valid && checkLength( newWorkspaceName, "nameWorkspace", 3, 16 );
        
        if(valid) {
            var keyValid = false;
            var key;
            while(!keyValid) {
                key = make_token(5);
                
                if(workspaceChildren.length !== 0) {
                    for(var i=0; i<workspaceChildren.length; i++) {
                        if(workspaceChildren[i].key === key) {
                            keyValid = false;
                        } else {
                            keyValid = true;
                        }
                    }
                } else {
                    keyValid = true;
                }
            }
            
            var newWorkspaceTemplate = {
                title: $("#newWorkspaceName").val(),
                key: "workspace_" + key,
                isFolder: true,
                expand: false,
                children: [
                ]
            };
            
            workspaceChildren.push(newWorkspaceTemplate);
            postUserData();
            updateTree(newWorkspaceTemplate.key);
            updateTabs();
            
            newWorkspaceDialog.dialog( "close" );
        } else {
            
        }
    }); 
    
    newEcuDialog = $( "#newEcu-dialog" ).dialog({
        autoOpen: false,
        height: 170,
        width: 350,
        minHeight: 170,
        maxHeight: 170,
        minWidth:250,
        maxWidth:400,
        modal: true,
        buttons: [
            {
                text: "Create a ECU",
                click: function() {
                    newEcuForm.submit();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    newEcuDialog.dialog( "close" );
                }
            }
        ],
        close: function() {
            newEcuForm[0].reset();
            $("label[for='nameEcu']").text("Name");
            $("#newEcuName").removeClass("ui-state-error");
        }
    });
    newEcuForm = newEcuDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        
        var ecuChildren = currentProjectData.children[1].children;
        var valid = true;
        var newEcuName = $("#newEcuName");
    
        valid = valid && checkLength( newEcuName, "nameEcu", 3, 16 );
        
        if(valid) {
            var keyValid = false;
            var key;
            while(!keyValid) {
                key = make_token(5);
                
                if(ecuChildren.length !== 0) {
                    for(var i=0; i<ecuChildren.length; i++) {
                        if(ecuChildren[i].key === key) {
                            keyValid = false;
                        } else {
                            keyValid = true;
                        }
                    }
                } else {
                    keyValid = true;
                }
            }
            
            var newEcuTemplate = {
                title: $("#newEcuName").val(),
                key: "ecu_" + key,
                isFolder: true,
                expand: false,
                children: [
                    {
                        title: "Tx Messages",
                        isFolder: true,
                        key: "tx-messages",
                        children: []
                    },
                    {
                        title: "Rx Messages",
                        isFolder: true,
                        key: "rx-messages",
                        children: []
                    }
                ]
            };
            
            ecuChildren.push(newEcuTemplate);
            postUserData();
            updateTree(newEcuTemplate.key);
            updateTabs();
            
            newEcuDialog.dialog( "close" );
        } else {
            
        }
    }); 
    
    
    newMessageDialog = $( "#newMessage-dialog" ).dialog({
        autoOpen: false,
        height: 170,
        width: 350,
        minHeight: 170,
        maxHeight: 170,
        minWidth:250,
        maxWidth:400,
        modal: true,
        buttons: [
            {
                text: "Create a Message",
                click: function() {
                    newMessageForm.submit();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    newMessageDialog.dialog( "close" );
                }
            }
        ],
        close: function() {
            newMessageForm[0].reset();
            $("label[for='nameMessage']").text("Name");
            $("#newMessageName").removeClass("ui-state-error");
        }
    });
    newMessageForm = newMessageDialog.find( "form" ).on( "submit", function( event ) {
        event.preventDefault();
        
        var activeNode = projectTree.getActiveNode();
        var ecuParentNode = projectTree.getActiveNode().getParent();
        var ecuChildren = currentProjectData.children[1].children;
        
        var currentEcuData;
        for(var i=0; i<ecuChildren.length; i++) {
            if(ecuChildren[i].key === ecuParentNode.data.key) {
                currentEcuData = ecuChildren[i];
            }
        }
        
        var currentMessagesChildren;
        for(var i=0; i<currentEcuData.children.length; i++) {
            if(currentEcuData.children[i].key === activeNode.data.key) {
                currentMessagesChildren = currentEcuData.children[i].children;
            }
        }
        
        var valid = true;
        var newMessageName = $("#newMessageName");
        var newIdName = $("#newIdName");
    
        valid = valid && checkLength( newMessageName, "nameMessage", 3, 16 );
        valid = valid && checkID(newIdName, "nameId");
        
        if(valid) {
            var keyValid = false;
            var key;
            while(!keyValid) {
                key = make_token(5);
                
                if(ecuChildren.length !== 0) {
                    for(var i=0; i<ecuChildren.length; i++) {
                        if(ecuChildren[i].key === key) {
                            keyValid = false;
                        } else {
                            keyValid = true;
                        }
                    }
                } else {
                    keyValid = true;
                }
            }
            
            var newMessageTemplate = {
                title: newMessageName.val() + " (" +newIdName.val()+")",
                id: newIdName.val(),
                key: "message_" + key,
                isFolder: false,
                expand: false,
                children: [
                ]
            };
            
            currentMessagesChildren.push(newMessageTemplate);
            postUserData();
            updateTree(newMessageTemplate.key);
            updateTabs();
            
            newMessageDialog.dialog( "close" );
        } else {
            
        }
    }); 

	init_dialog(dialog1);
	init_dialog(dialog2);
});

function init_dialog(parameter) {
	$( parameter ).dialog({
		autoOpen: false,
		appendTo: "#startTab",
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
	
	$( parameter ).dialog("widget").draggable("option","containment","#startTab");
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
        
	});
	
	$( "#dialog2-link" ).button({
		icons: { primary: "ui-icon-newwin"}
	})
	.click(function( event ) {
		$( "#dialog2" ).dialog( "open" );
		event.preventDefault();
	});
}

function postUserData() {
    var message = {
        type: "postUserData",
        result: userData
    };
    
    connection.send(JSON.stringify(message));
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

function updateTree(activeNode) {
    var listOfChildrenTree = projectTree.getRoot().getChildren();

    if(currentProjectNode) {
        currentProjectNode.removeChildren();
        currentProjectNode.addChild(currentProjectData.children);
    } else {
        for(var i=0; i<listOfChildrenTree.length; i++) {
            listOfChildrenTree[i].removeChildren();
        }
        
        if(currentProjectData) {
            var tempResult = $.grep(listOfChildrenTree, function(e){
                return e.data.key == currentProjectData.key;
            });
            currentProjectNode = tempResult[0];
            currentProjectNode.addChild(currentProjectData.children);
            if(!currentProjectNode.isExpanded()) {
                currentProjectNode.expand(true);
            }
        }
    }
    
    if(activeNode) {
        projectTree.getNodeByKey(activeNode).focus();
        projectTree.getNodeByKey(activeNode).activate();
        if(!projectTree.getNodeByKey(activeNode).isExpanded()) {
            projectTree.getNodeByKey(activeNode).expand(true);
        }
    } else if (currentProjectNode) {
        currentProjectNode.focus();
        currentProjectNode.activate();
    }
}

function updateTabs(newProjectFlag) {
    
    var openedTabs = tabs.find("li");
    var tabTemplate = "<li><a href='#{href}'>#{label}</a></li>";
    
    if(newProjectFlag) {
        for(var i=0; i<openedTabs.length; i++) {
            if(openedTabs[i].getAttribute("aria-controls") == "startTab") {
                $(openedTabs[i]).show();
                tabs.tabs( "option", "active", i );
            } else {
                $("#" + openedTabs[i].getAttribute("aria-controls")).remove();
                openedTabs[i].remove();
            }
        }
    }
    
    openedTabs = tabs.find("li");
    
    if(currentProjectData !== null && currentProjectData.children[0].children.length !== 0) {
        var workspaceList = currentProjectData.children[0].children;
        
        for(var i=0; i<workspaceList.length; i++) {
            var exist = false;
            for(var j=0; j<openedTabs.length; j++) {
                if(openedTabs[j].getAttribute("aria-controls") == workspaceList[i].key) {
                    exist = true;
                    break;
                } else {
                    
                }
            }
            
            if(!exist) {
                var label = workspaceList[i].title,
                id = workspaceList[i].key,
                li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ),
                tabContentHtml = "add view or control";
                
                tabs.find( ".ui-tabs-nav" ).append( li );
                tabs.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
                tabs.tabs( "refresh" );
            }
        }
        for(var i=0; i<openedTabs.length; i++) {
            if(openedTabs[i].getAttribute("aria-controls") == "startTab") {
                $(openedTabs[i]).hide();
                tabs.tabs( "option", "active", i+1 );
                break;
            }
        }
    } else {
        for(var i=0; i<openedTabs.length; i++) {
            if(openedTabs[i].getAttribute("aria-controls") == "startTab") {
                $(openedTabs[i]).show();
                tabs.tabs( "option", "active", i );
            } else {
                $("#" + openedTabs[i].getAttribute("aria-controls")).remove();
                openedTabs[i].remove();
            }
        }
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

function checkLength( o, label, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        $("label[for='"+label+"']").text("Name: Length must be between " + min + " and " + max + ".");
        setTimeout(function() {
            o.removeClass( "ui-state-error", 1500 );
        }, 500 );
        return false;
    } else {
        return true;
    }
}

function checkID(object, label) {
    if(!/0x[0-9]{1,3}/.test(object.val())){
        object.addClass( "ui-state-error" );
        $("label[for='"+label+"']").text("ID: The ID must be 0xYYY format (Y - hex number)");
        setTimeout(function() {
            object.removeClass( "ui-state-error", 1500 );
        }, 500 );
        return false;
    } else {
        return true;
    }
    
}