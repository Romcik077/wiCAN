$(function() {
  var newUserDialog, newUserForm,
  loginDialog, loginForm,
  
  // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
  emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  tips = $( ".validateTips" ),
  requestResult = $(".requestResult"),
  requestLoginResult = $(".requestLoginResult"),
  newUserName = $( "#newUserName" ),
  newUserEmail = $( "#newUserEmail" ),
  newUserPasswd = $( "#newUserPasswd" ),
  email = $( "#email" ),
  passwd = $( "#password" ),
  allFields = $( [] ).add( newUserName ).add( newUserEmail ).add( newUserPasswd );

  function updateTips( t ) {
    tips
      .text( t )
      .addClass( "ui-state-highlight" );
    setTimeout(function() {
      tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
  }

  function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
      o.addClass( "ui-state-error" );
      updateTips( "Length of " + n + " must be between " +
      min + " and " + max + "." );
      return false;
    } else {
      return true;
    }
  }

  function checkRegexp( o, regexp, n ) {
    if ( !( regexp.test( o.val() ) ) ) {
      o.addClass( "ui-state-error" );
      updateTips( n );
      return false;
    } else {
      return true;
    }
  }

  function addUser() {
    var valid = true;
    
    allFields.removeClass( "ui-state-error" );
    
    valid = valid && checkLength( newUserName, "username", 3, 16 );
    valid = valid && checkLength( newUserEmail, "email", 6, 80 );
    valid = valid && checkLength( newUserPasswd, "password", 5, 16 );
    
    valid = valid && checkRegexp( newUserName, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
    valid = valid && checkRegexp( newUserEmail, emailRegex, "eg. ui@jquery.com" );
    valid = valid && checkRegexp( newUserPasswd, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
    
    if ( valid ) {
      $(":button:contains('Cancel')").prop("disabled", true).addClass("ui-state-disabled");
      $(":button:contains('Create an account')").prop("disabled", true).addClass("ui-state-disabled");
      $.get("/register?name="+ newUserName.val() +"&email="+ newUserEmail.val() +"&passwd="+ newUserPasswd.val(), function(data,status){
        if(status === "success"){
          requestResult.text( "Register succeseded" );
          setTimeout(function() {
            newUserDialog.dialog( "close" );
            $(":button:contains('Cancel')").prop("disabled", false).removeClass("ui-state-disabled");
            $(":button:contains('Create an account')").prop("disabled", false).removeClass("ui-state-disabled");
          }, 2000 );
        } else if(data === "exist") {
          requestResult
            .text( "Account with this email exist" )
            .addClass( "ui-state-error" );
          $(":button:contains('Cancel')").prop("disabled", false).removeClass("ui-state-disabled");
          $(":button:contains('Create an account')").prop("disabled", false).removeClass("ui-state-disabled");
        } else {
          requestResult
            .text( "Connection Error" )
            .addClass( "ui-state-error" );
          $(":button:contains('Cancel')").prop("disabled", false).removeClass("ui-state-disabled");
          $(":button:contains('Create an account')").prop("disabled", false).removeClass("ui-state-disabled");
        }
      });
    }
    return valid;
  }
  
  newUserDialog = $( "#newUser-dialog" ).dialog({
    autoOpen: false,
    height: 310,
    width: 350,
    modal: true,
    buttons: [
      {
        text: "Create an account",
        icons: {
          primary: "ui-icon-person"
        },
        click: function() {
          newUserForm.submit();
        }
      },
      {
        text: "Cancel",
        icons: {
          primary: "ui-icon-power"
        },
        click: function() {
          newUserDialog.dialog( "close" );
        }
      }
    ],
    close: function() {
      newUserForm[0].reset();
      allFields.removeClass( "ui-state-error" );
      requestResult.text("");
    }
  });
  
  newUserForm = newUserDialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addUser();
  });  

  loginDialog = $("#login-dialog").dialog({
    modal: true,
    resizable: false,
    closeOnEscape: false,
    open: function(event, ui) {
      $(this).dialog("widget").draggable("disable");
      $(this).closest(".ui-dialog")
        .find(".ui-dialog-titlebar") // the first button
        .css("cursor", "auto");
      $(this).closest(".ui-dialog")
        .find(".ui-dialog-titlebar-close")
        .hide();
    },
    buttons: [
      {
        text: "Create new user",
        icons: {
          primary: "ui-icon-person"
        },
        click: function() {
          newUserDialog.dialog( "open" ); // add function for login
        }
      },
      {
        text: "Login",
        icons: {
          primary: "ui-icon-power"
        },
        click: function() {
          loginForm.submit(); // add function for login
        }
      }
    ]
  });
  
  loginForm = loginDialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    
    $(":button:contains('Login')").prop("disabled", true).addClass("ui-state-disabled");
    $(":button:contains('Create new user')").prop("disabled", true).addClass("ui-state-disabled");
    
        requestLoginResult.text("Loading");
  
    $.post("/login?email="+ email.val() +"&passwd="+ passwd.val(), function(data,status){
      if(data === "success") {
        window.location.replace("/workspace.html");
      } else {
        requestLoginResult.text("Login failed, Email or Passwors is wrong");
        $(":button:contains('Login')").prop("disabled", false).removeClass("ui-state-disabled");
        $(":button:contains('Create new user')").prop("disabled", false).removeClass("ui-state-disabled");
      }
    });
  });
  
  // loginDialog.dialog("widget").draggable("disable");
  
  // loginDialog.closest(".ui-dialog")
  // .find(".ui-dialog-titlebar") // the first button
  // .css("cursor", "auto");
  
  loginDialog.dialog("open");
});