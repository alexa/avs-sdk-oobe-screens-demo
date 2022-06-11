var setupOptions = {
    cblData: null,
    currentScreen: null,
    locale: 'en-US' // for localization
};

var textStrings = {
    genericError: 'An error occurred',
    successBody: 'Success message'
}

var onHandleRequestAuthorization = (requestAuthorizationMessage) => {
    console.log('onHandleRequestAuthorization called!');
    console.log(requestAuthorizationMessage);

    // set CBL values
    cblCodeAcquired(requestAuthorizationMessage);
    console.log(setupOptions.currentScreen);

    switch (setupOptions.currentScreen) {
        case null:
            // display start screen
            navigation.ToStart();
            break;
        case "start":
          // stay on start screen
            navigation.ToStart();
            break;
        case "cbl":
            // stay on CBL screen
            navigation.ToCBL();
            break;
        case "success":
            // onHandleAuthorizationStateChanged handles success, this does not indicate success so return to CBL screen
            navigation.ToCBL();
            break;
        case "done":
            // not actually done so return to CBL screen
            navigation.ToCBL();
            break;
        default:
            // display start screen
            navigation.ToStart();
            break;
    }
}

var onHandleAuthorizationStateChanged = (authStateChangeMessage) => {
    console.log('onHandleAuthorizationStateChanged called!');
    console.log(authStateChangeMessage);

    switch(authStateChangeMessage.state){
        case 'UNINITIALIZED':
            // error - uninitialized
            navigation.ToError('UNINITIALIZED');
            break;
        case 'REFRESHED':
            // user entered the CBL code successfully
            navigation.ToSuccess();
            break;
        case 'EXPIRED':
            // error - expired
            navigation.ToError('EXPIRED');
            break;
        case 'ERROR':
            // error - generic
            navigation.ToError('ERROR');
            break;
    }
}

var navigation = {
    ToStart: () => {
        setupOptions.currentScreen = "start";
        document.getElementById("root").style.display = "none"; // SS SDK container
        document.getElementById("ss_sdk_oobe").style.display = "block"; // OOBE container
        document.getElementById("screen_default_0").style.display = "block";
        document.getElementById("screen_default_cbl").style.display = "none";
        document.getElementById("screen_default_success").style.display = "none";
        document.getElementById("screen_default_error").style.display = "none";
        document.getElementById("bt_back").style.display = "block";
        document.getElementById("bt_done").style.display = "none";
        backAction = () => {};
    },
    ToCBL: () => {
        setupOptions.currentScreen = "cbl";
        document.getElementById("root").style.display = "none"; // SS SDK container
        document.getElementById("ss_sdk_oobe").style.display = "block"; // OOBE container
        document.getElementById("screen_default_0").style.display = "none";
        document.getElementById("screen_default_cbl").style.display = "block";
        document.getElementById("screen_default_success").style.display = "none";
        document.getElementById("screen_default_error").style.display = "none";
        document.getElementById("bt_back").style.display = "block";
        document.getElementById("bt_done").style.display = "none";
        backAction = navigation.ToStart;
    },
    ToSuccess: () => {
        setupOptions.currentScreen = "success";
        document.getElementById("root").style.display = "none"; // SS SDK container
        document.getElementById("ss_sdk_oobe").style.display = "block"; // OOBE container
        document.getElementById("screen_default_0").style.display = "none";
        document.getElementById("screen_default_cbl").style.display = "none";
        document.getElementById("screen_default_success").style.display = "block";
        document.getElementById("screen_default_error").style.display = "none";
        document.getElementById("bt_back").style.display = "none";
        document.getElementById("bt_done").style.display = "block";
    },
    ToError: (errorType) => {
        setupOptions.currentScreen = "error";
        document.getElementById("root").style.display = "none"; // SS SDK container
        document.getElementById("ss_sdk_oobe").style.display = "block"; // OOBE container
        document.getElementById("screen_default_0").style.display = "none";
        document.getElementById("screen_default_cbl").style.display = "none";
        document.getElementById("screen_default_success").style.display = "none";
        document.getElementById("screen_default_error").style.display = "block";
        document.getElementById("bt_back").style.display = "block";
        document.getElementById("bt_done").style.display = "none";

        // display error message
        document.getElementById("screen_default_error_text").innerHTML = textStrings.genericError;

        backAction = navigation.ToStart;
    },
    ToDone: () => {
        setupOptions.currentScreen = "done";
        document.getElementById("root").style.display = "block"; // SS SDK container
        document.getElementById("ss_sdk_oobe").style.display = "none"; // OOBE container
    }
}

var backAction = () => {};

var cblCodeAcquired = (cblData) => {

    // check if code has changed - if not then skip
    if (!setupOptions.cblData || setupOptions.cblData.code != cblData.code) {
        setupOptions.cblData = cblData;
        setupOptions.cblRequestedTime = new Date();
    
        // set values on screen
        document.getElementById("cbl_url").textContent = cblData.url;
        document.getElementById("cbl_code").textContent = cblData.code;
        document.getElementById("qrcode").innerHTML = '';
    
        var QR_CODE = new QRCode("qrcode", {
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
        });
    
        QR_CODE.makeCode(cblData.url + '?cbl-code=' + cblData.code);
    }
}

// bind events
document.getElementById("bt_sign_in").addEventListener("click", () => {
    navigation.ToCBL();
});

document.getElementById("bt_back").addEventListener("click", () => {
    backAction();
});

document.getElementById("bt_done").addEventListener("click", () => {
    navigation.ToDone();
});
