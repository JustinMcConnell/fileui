/*
 * We know our test data has the following structure so we write the tests accordingly:
 * benders
 *   earth
 *     toph
 *   fire
 *     zuko
 *   water
 *     katara
 *   aang 
 */

describe("File UI", function() {
  var app, appNode;
  var TestUtils = React.addons.TestUtils;

  beforeEach(function() {
    app = React.createElement(FileUI, {files: files, repoName:Object.keys(files)[0]});
    appNode = TestUtils.renderIntoDocument(app);
  });

  it("Should have the correct initial state.", function() {
    expect(appNode.state).toEqual(appNode.getInitialState());
  });

  it("Should have the correct data after a state change.", function() {
    var data;

    appNode.setState({path: "fire/"});
    data = appNode.getDataForState(appNode.state);
    expect(data.name).toBe("fire");

    appNode.setState({path: "fire/zuko/"});
    data = appNode.getDataForState(appNode.state);
    expect(data.name).toBe("zuko");

    appNode.setState({path: ""});
    data = appNode.getDataForState(appNode.state);
    expect(data.name).toBe("benders");
  });

  it("Should render into a DOM node.", function() {
    var fileUI = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box")
    expect(fileUI).toBeDefined();
  });

  it("Should have a BreadcrumbBar.", function() {
    var breadcrumbBar = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box-breadcrumb_bar")
    expect(breadcrumbBar).toBeDefined();
  });

  it("Should have one Breadcrumb.", function() {
    var breadcrumbs = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb")
    expect(breadcrumbs.length).toBe(1);    
  });

  it("Should show the correct repository name.", function() {
    var breadcrumbLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb_link")
    expect(breadcrumbLinks[0].getDOMNode().innerHTML).toBe("benders");
  });  

  it("Should have a FileUITable.", function() {
    var fileUITable = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-table");
    expect(fileUITable).toBeDefined();
  });

  it("Should have four FileUIRows.", function() {
    var fileUIRows = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-row");
    expect(fileUIRows.length).toBe(4);
  });

  it("Should show the correct icon for directories.", function() {
    var fileIcons = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-icon");
    expect(fileIcons[0].getDOMNode().className.indexOf("icon-folder")).not.toBe(-1);
  });  

  it("Should show the correct icon for files.", function() {
    var fileIcons = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-icon");
    expect(fileIcons[3].getDOMNode().className.indexOf("icon-file-text2")).not.toBe(-1);
  });

  it("Should show the correct file/directory name.", function() {
    var fileUITable = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box-table");
    var nameNodes = TestUtils.scryRenderedDOMComponentsWithClass(fileUITable, "fileui_box-link");
    expect(nameNodes[0].getDOMNode().innerHTML).toBe("earth");
  });

  it("Should show the correct modified date.", function() {
    var fileUITable = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box-table");
    var modifiedNodes = TestUtils.scryRenderedDOMComponentsWithClass(fileUITable, "modified");
    expect(modifiedNodes[0].getDOMNode().innerHTML).toBe("1 day ago");
  });

  describe("Can navigate to subdirectories", function() {
    beforeEach(function() {
      var links = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-link");
      TestUtils.Simulate.click(links[0]);
    });

    it("Should have two Breadcrumbs.", function() {
      var breadcrumbs = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb")
      expect(breadcrumbs.length).toBe(2);    
    });

    it("Should have a second Breadcrumb that does not contain a link.", function() {
      var breadcrumbs = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb")
      expect(breadcrumbs[1].getDOMNode().getElementsByTagName("a").length).toBe(0);
    });

    it("Should have one FileUIRow.", function() {
      var fileUIRows = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-row");
      expect(fileUIRows.length).toBe(1);
    });
  });

  describe("Can navigate with the BreadcrumbBar", function() {
    beforeEach(function() {
      var fileLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-link");
      TestUtils.Simulate.click(fileLinks[0]);
      var breadcrumbLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb_link");
      TestUtils.Simulate.click(breadcrumbLinks[0]);    
    });

    it("Should have one Breadcrumb.", function() {
      var breadcrumbs = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb")
      expect(breadcrumbs.length).toBe(1);    
    });

    it("Should have four FileUIRows.", function() {
      var fileUIRows = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-row");
      expect(fileUIRows.length).toBe(4);
    });
  });

  describe("Can show text files", function() {
    beforeEach(function() {
      var fileLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-link");
      TestUtils.Simulate.click(fileLinks[3]);
    });

    it("Should have two Breadcrumbs.", function() {
      var breadcrumbs = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb")
      expect(breadcrumbs.length).toBe(2);    
    });

    it("Should have no FileUITable.", function() {
      var fileUITable = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-table")
      expect(fileUITable.length).toBe(0);
    });

    it("Should have a FileDisplay.", function() {
      var fileDisplay = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box-file")
      expect(fileDisplay).toBeDefined();
    });

    it("Should show the file.", function() {
      var fileDisplay = TestUtils.findRenderedDOMComponentWithClass(appNode, "fileui_box-file")
      expect(fileDisplay.getDOMNode().innerHTML.indexOf("Aang")).not.toBe(-1);
    });
  });

  describe("Does not regress", function() {
    /*
     * Click a directory, click a file, click up one level in the breadcrumb.  The state 
     * should not start with /.
     */
    it("Bug 1", function() {
      var fileLinks, breadcrumbLinks;

      fileLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-link");
      TestUtils.Simulate.click(fileLinks[2]);
      fileLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-link");
      TestUtils.Simulate.click(fileLinks[0]);
      breadcrumbLinks = TestUtils.scryRenderedDOMComponentsWithClass(appNode, "fileui_box-breadcrumb_link");
      TestUtils.Simulate.click(breadcrumbLinks[1]);
      expect(appNode.state.path).toBe("water/");
    });
  });
});
