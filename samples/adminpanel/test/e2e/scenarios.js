'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('Admin app', function() {

    var fs = require('fs');

    function navigateTo(url){
        browser.get(url);
        browser.waitForAngular();
    }

    function login(){
        navigateTo('#/login/');
        var username = element(by.id('username'));
        var password = element(by.id('password'));
        var submit = element(by.id('loginbtn'));

        username.sendKeys('admin');
        password.sendKeys('admin');
        submit.click();
        browser.waitForAngular();
    }

    function logout() {
        navigateTo('/logout/');

        /*
         var logout = element(webdriver.By.partialLinkText('Logout'));
         if(logout) {
         logout.click();
         }
         */
    }

    function saveScreenShot(data, filename) {
        var stream = fs.createWriteStream(filename);
        stream.write(new Buffer(data, 'base64'));
        stream.end();
    }

    function setItemValues(itemType, values, clear) {
        element.all(by.css(itemType)).each(function (element) {
            element.evaluate("item").then(function (item) {
                console.log(JSON.stringify(item));
                if(item) {
                    var fieldName = item["name"];
                    var val = values[fieldName];
                    if (val) {
                        if (clear) {
                            element.clear();
                        }
                        element.sendKeys(val);
                    }
                }
            });
        });

        //TODO: check if all values were successfully set
    }

    function setInputItemValues(values, clear) {
        setItemValues('input', values, clear);
    }


    function createApplication(){
        browser.get('/#/appstudio/');
        browser.waitForAngular();
        var createAppBtn = element(by.id('create_app_btn'));
        createAppBtn.click();
        var appId = 'A55CAFE' + Math.floor((Math.random() * 99999));

        var appName = "App_"+appId;

        var appConfig = {"id": appId, "name":appName};
        appConfig["title"] = "Test App" + appName;
        appConfig["path"] = "app"+appId;

        appConfig["listconfigobject"] = appName+"."+"listconfigobject";
        appConfig["formconfigobject"] = appName+"."+"formconfigobject";
        appConfig["menuconfigobject"] = appName+"."+"menuconfigobject";
        appConfig["pageconfigobject"] = appName+"."+"pageconfigobject";
        appConfig["chartconfigobject"] = appName+"."+"chartconfigobject";
        appConfig["singleitemconfigobject"] = appName+"."+"singleitemconfigobject";

        setInputItemValues(appConfig);

        var createItemBtn = element(by.id('create_item_btn'));
        createItemBtn.click();
        browser.waitForAngular();

        return appConfig;
    }

    function deleteApplication(appConfig) {
        var delAppBtn = element(by.id('delete_' + appConfig["id"]));
        delAppBtn.click();

        var confirmDeleteAppDialod = browser.switchTo().alert();
        confirmDeleteAppDialod.accept();
        browser.waitForAngular();
    }

    function acceptBrowserConfirm() {
        browser.sleep(500);
        var confirmDeleteAppDialog = browser.switchTo().alert();
        confirmDeleteAppDialog.accept();
        //confirmDeleteAppDialod.dismiss(); //to cancel
    }

    function clickElementById(id, noWait) {
        var elem = element(by.id(id));
        elem.click();
        if(!noWait) {
            browser.waitForAngular();
        }
    }

    function dragDrop(fromId, toId) {
        var startElem = element(by.id(fromId));
        var stopElem = element(by.id(toId));

        browser.actions().dragAndDrop(startElem, stopElem).perform();
    }

    describe('appstudio', function() {
        var appConfig;
        browser.driver.manage().window().maximize();
        //browser.driver.manage().window().setSize(width, height);

        beforeEach(function() {
            logout();
            login();
            appConfig = createApplication();
            navigateTo('/#/appstudio/');
        });

        afterEach(function(){
            if(appConfig){
                deleteApplication(appConfig);
            }
        });

        it('should be able to open, close, set default and delete app', function() {

            var openAppBtn = element(by.id('open_'+appConfig["id"]));
            openAppBtn.click();

            clickElementById('forms_tab');
            expect(element.all(by.id('create_form_btn')).count()).toEqual(1);

            clickElementById('lists_tab');
            expect(element.all(by.id('create_list_btn')).count()).toEqual(1);

            clickElementById('charts_tab');
            expect(element.all(by.id('create_chart_btn')).count()).toEqual(1);

            clickElementById('itemviews_tab');
            expect(element.all(by.id('create_itemview_btn')).count()).toEqual(1);

            clickElementById('widgets_tab');
            expect(element.all(by.id('create_widget_btn')).count()).toEqual(1);

            clickElementById('menus_tab');
            expect(element.all(by.id('create_menu_btn')).count()).toEqual(1);

            clickElementById('source_code_tab');
            expect(element.all(by.id('create_source_btn')).count()).toEqual(1);

            clickElementById('inceptors_tab');
            expect(element.all(by.id('create_interceptor_btn')).count()).toEqual(1);

            clickElementById('endpoints_tab');
            expect(element.all(by.id('create_endpoint_btn')).count()).toEqual(1);

            clickElementById('pages_tab');
            expect(element.all(by.id('create_page_btn')).count()).toEqual(1);

            // Close the app
            clickElementById('close_app_btn');

            // Set current app as default
            clickElementById('set_default_'+appConfig["id"]);
            expect(element(by.id('set_default_'+appConfig["id"])).isDisplayed()).toBeFalsy();
            expect(element(by.id('default_txt_'+appConfig["id"])).isDisplayed()).toBeTruthy();

            // Delete the app
            clickElementById('delete_'+appConfig["id"], true);
            acceptBrowserConfirm();
            expect(element.all(by.id('open_'+appConfig["id"])).count()).toEqual(0);

            appConfig = null;
        });

        it('should be able to create and delete menu', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('menus_tab');
            clickElementById('create_menu_btn');

            setInputItemValues({"brandtitle": appConfig["name"], "brandhref":"/#/a/"});

            element(by.cssContainingText('option', 'Top fixed')).click();

            clickElementById("create_item_btn");

            element(by.id("item_id_label")).getText().then(function(menuId) {
                console.log("Menu Id: " + menuId);

                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('menus_tab');

                var delMenuBtnId = "delete_menu_"+menuId;

                clickElementById(delMenuBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delMenuBtnId)).count()).toEqual(0);

                clickElementById('close_app_btn');
            });

        });

        it('should be able to create and delete widget', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('widgets_tab');
            clickElementById('create_widget_btn');

            setItemValues("input", {"name":"test.widget1"});
            setItemValues("textarea", {"template": "<h1>Hello world</h1>"});

            clickElementById("create_item_btn");

            element(by.id("item_id_label")).getText().then(function(widgetId) {
                console.log("Wifget Id: " + widgetId);

                // Delete the widget
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('widgets_tab');
                var delMenuBtnId = "delete_widget_"+widgetId;
                clickElementById(delMenuBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delMenuBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });

        });

        it('should be able to create and delete source file', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('source_code_tab');
            clickElementById('create_source_btn');

            setItemValues("input", {"filename":"testsource.py", "modulename":"testsource"});
            setItemValues("textarea", {"code": "value=10"});

            clickElementById("create_item_btn");
            browser.sleep(1000); //TODO: understadn why it fails sometimes
            browser.waitForAngular();

            element(by.id("item_id_label")).getText().then(function(sourceId) {
                console.log("Source module Id: " + sourceId);

                // Delete the source file
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('source_code_tab');
                var delMenuBtnId = "delete_source_"+sourceId;

                clickElementById(delMenuBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delMenuBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });

        });

        it('should be able to create and delete interceptor', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('inceptors_tab');
            clickElementById('create_interceptor_btn');

            setItemValues("input", {"object_name":"test.object", "interceptor_module":"testsource", "interceptor_name":"on_test_object_insert"});

            element(by.css('[ng-click="add_primitive_item(-1)"]')).click();

            element(by.cssContainingText('option', 'Insert')).click();

            clickElementById("create_item_btn");

            element(by.id("item_id_label")).getText().then(function(interceptorId) {
                console.log("Interceptor Id: " + interceptorId);

                // Delete the interceptor
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('inceptors_tab');
                var delMenuBtnId = "delete_interceptor_"+interceptorId;
                clickElementById(delMenuBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delMenuBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });
        });

        it('should be able to create and delete endpoint', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('endpoints_tab');
            clickElementById('create_endpoint_btn');

            setItemValues("input", {"uri_pattern":"/test/(*)", "handler_module":"testhandlers", "handler_name":"TestHandler"});

            clickElementById("create_item_btn");

            element(by.id("item_id_label")).getText().then(function(endpointId) {
                console.log("Endpoint Id: " + endpointId);

                // Delete the endpoint
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('endpoints_tab');
                var delMenuBtnId = "delete_endpoint_"+endpointId;
                clickElementById(delMenuBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delMenuBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });
        });

        it('should be able to create and delete page', function() {

            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('pages_tab');
            clickElementById('create_page_btn');

            clickElementById("design_title_label");

            setInputItemValues({"title": "Test page 1"}, true);
            dragDrop('tool_menuref', 'design_canvas');
            browser.waitForAngular();

            var menuId = "6732541276452367";
            setInputItemValues({"menuId": menuId}, true);

            clickElementById("save_page_button");

            element(by.id("page_id_label")).getText().then(function(pageId) {
                console.log("Page Id: " + pageId);

                // Delete the page
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('pages_tab');
                var delPageBtnId = "delete_pg_"+pageId;
                clickElementById(delPageBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delPageBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });
        });

        it('should be able to create and delete form', function() {
            var openAppBtn = element(by.id('open_' + appConfig["id"]));
            openAppBtn.click();

            clickElementById('forms_tab');
            clickElementById('create_form_btn');

            clickElementById("design_title_label");

            console.log("Setting form properties");

            setInputItemValues({"title": "Test form 1", "name":"testform", "action":"/service/test.object"}, true);

            element(by.cssContainingText('option', 'Embeded message')).click();

            setInputItemValues({"value": "Test object has been saved!"});

            dragDrop('tool_input', 'design_canvas');
            browser.waitForAngular();

            console.log("Setting input field properties");

            setInputItemValues({"label": "Name", "name":"name", "minlength":"5"}, true);

            clickElementById("save_form_button");

            element(by.id("form_id_label")).getText().then(function(formId) {
                console.log("Form Id: " + formId);

                // Delete the page
                navigateTo('/#/appstudio/');
                clickElementById("refresh_app_btn");
                clickElementById('forms_tab');
                var delPageBtnId = "delete_form_"+formId;
                clickElementById(delPageBtnId, true);
                acceptBrowserConfirm();
                expect(element.all(by.id(delPageBtnId)).count()).toEqual(0);

                // Close the app
                clickElementById('close_app_btn');
            });
        });
    });

/*
    describe('userservice', function() {
        var ptor = protractor.getInstance();

        beforeEach(function () {
            login(ptor);
        });

        afterEach(function() {
            logout(ptor);
        });

        it('should be able to create new user', function () {

        });
    });
*/

});

/*
browser.takeScreenshot().then(function (pngData) {
    saveScreenShot(pngData, 'fileName.png');
});
 */