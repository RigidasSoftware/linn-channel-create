var core = require('linn-channel-core');

var apiCredentialsProperty = function(userConfig) {
    return new core.ConfigItem(
        core.ConfigValueType.PASSWORD,
        "APIKey", //Key
        "API Key", //Name
        "The key used to access your Create.net account", //Description
        "Account", //Group 
        1, //SortOrder
        (userConfig && userConfig.APIKey) ? userConfig.APIKey : "", //SelectedValue,
        true, //MustBeSpecified
        false //ReadOnly
    );
};

var GetAPICredentials = function(userConfig) {
    return new core.UserConfigResponse(
        "AddCredentials", 
        "Add Credentials", 
        "Setup your Create.net integration", 
        [ apiCredentialsProperty(userConfig) ]
    );
};


var UserConfig = function(userConfig) {
    return new core.UserConfigResponse(
        "UserConfig", 
        "UserConfig", 
        "User Config",
        [ apiCredentialsProperty(userConfig) ]
    );
}

module.exports = {
    GetAPICredentials,
    UserConfig
}