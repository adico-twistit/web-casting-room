'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('Webcast App', function() {
/*
  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/view1");
  });


  describe('view1', function() {

    beforeEach(function() {
      browser.get('index.html#/view1');
    });


    it('should render view1 when user navigates to /view1', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 1/);
    });

  });


  describe('view2', function() {

    beforeEach(function() {
      browser.get('index.html#/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
*/
  describe('User list view', function() {
    var userList, query;

    beforeEach( function() {
      browser.get('index.html');
      userList = element.all(by.repeater('user in connectedUsers'));
      query = element(by.model('userQuery'));
    });

    it('should filter the users list as a user name into the search box', function() {

      expect(userList.count()).toBe(3);

      query.sendKeys('ad');
      expect(userList.count()).toBe(1);

      query.clear();
      query.sendKeys('wo');
      expect(userList.count()).toBe(1);

      query.clear();
    });

    it('should be possible to control users order via the drop down select box', function() {
      var userNameColumn = element.all(by.repeater('user in connectedUsers').column('user.name'));
      
      function getNames() {
        return userNameColumn.map(function(elm) {

          return elm.getText();
        });
      }

      query.clear();
      query.sendKeys('A'); //let's narrow the dataset to make the test assertions shorter

      expect(getNames()).toEqual([
        "Adi Cohen"
      ]);

      element(by.model('usersOrderProp')).element(by.css('option[value="name"]')).click();

      expect(getNames()).toEqual([
        "Adi Cohen"
      ]);
    });
  });

  it('should render phone specific links', function() {
      var query = element(by.model('query'));
      query.sendKeys('nexus');
      element.all(by.css('.phones li a')).first().click();
      browser.getLocationAbsUrl().then(function(url) {
        expect(url).toBe('/phones/nexus-s');
      });
    });
});
