/*
 * Our React components.  This is the component hierarchy:
 * FileUI
 *   BreadcrumbBar
 *     Breadcrumb
 *   FileUITable
 *     FileUIRow
 *       FileIcon
 *   FileIcon
 *
 * The data for our files and directories is stored in an object.  As expected,
 * leaf nodes are files, while the rest of the nodes are directories.  The following
 * is the hierarchy of test data:
 * benders
 *   earth
 *     beifong
 *       suyin
 *       toph
 *   fire
 *     zuko
 *   water
 *     katara
 *   aang
 * See /js/data.js for a detailed description of the structure of the data.
 *
 * Our only state is the path to the currect file or directory.  Everything else can be
 * computed.  FileUI owns this state since both BreadcrumbBar and FileUITable need access
 * to it in order to render.
 *
 * When FileUI is first rendered, path is empty so we show the contents of the bender directory.
 * When we click a file or directory, we add it's name to the path and re-render. If we click 
 * fire, then the path is set to "fire/" and we show the contents of the fire directory.  If
 * we then click zuko, the path is set to "earth/zuko/" and we show the contents of the zuko file.
 *
 * The links in the BreadcrumbBar work in a similar fashion.  If our path is "fire/zuko/"
 * and we click the fire Breadcrumb then we set path to "fire/" and show the contents of the 
 * fire directory.  The function that is responsible for turning the path state into the correct
 * position in the data object is FileUI.getDataForState.
 */

var FileUI = React.createClass({
  /*
   * Our initial state is an empty path since we want to first view the top level directory.
   * @parameter None
   * @return {object} The inital state.
   */
  getInitialState: function() {
    return {path: ""};
  },


  /*
   * We use the componentDidMount function to setup the listener that watches for popstate
   * events.  When that happens, it means a user has used the browser's back/forward buttons
   * and we should change the state and re-render.
   * @parameter None
   * @return Nothing
   */
  componentDidMount: function() {
    window.addEventListener("popstate", function(event) {
      this.setState(event.state);
    }.bind(this));
  },


  /*
   * Get the directory or file to display based on the current state.
   * @parameter {object} The current state.
   * @return {object} Either a directory or file to display.
   */
  getDataForState: function(state) {
    var path = state.path;
    var topLevelDirectory = Object.keys(this.props.files)[0];
    var data = this.props.files[topLevelDirectory];
    path.split("/").forEach(function(pathSegment) {
      if (!pathSegment) {
        return;
      }
      data = data.files[pathSegment];
    });
    return data;
  },


  /*
   * The user has performed an action that has changed the path so a state change is required.
   * @parameter {string} The new path to add to the state.
   * @return Nothing
   */
  handlePathChange: function(path) {
    var newState = {path: path};
    this.setState(newState);
    window.history.pushState(newState, "", "#" + path);
  },


  render: function() {
    var data = this.getDataForState(this.state);
    var mainContent;
    // check for === true so we don't get false positive on a directory named "directory".
    if (data.directory === true) {
      mainContent = <FileUITable files={data.files}
                                 path={this.state.path}
                                 onFileClick={this.handlePathChange} />
    } else {
      mainContent = <FileDisplay content={data.content} />
    }

    return (
      <div className="fileui_box">
        <BreadcrumbBar repoName={this.props.repoName}
                       path={this.state.path}
                       onCrumbClick={this.handlePathChange} />
        {mainContent}
      </div>
    );
  }
});


var BreadcrumbBar = React.createClass({
  /*
   * This just passes data from below BreadcrumbBar to above BreadcrumbBar.
   * @parameter Implicit -- just passes the arguments variable up.
   * @return Nothing
   */
  handleCrumbClick: function() {
    this.props.onCrumbClick.apply(undefined, arguments);
  },


  render: function() {
    // The path that an individual Breadcrumb leads to.  We will be adding to this string
    // as we iterate through each Breadcrumb.
    var breadcrumbPath = "";

    // Generate Breadcrumbs for every part of the path.  Does not include the top level Breadcrumb.
    var breadcrumbNodes = this.props.path
      .split("/")
      .filter(function(name) {
        // Don't create Breadcrumbs for empty bits of the path.
        return name ? true : false;
      })
      .map(function(name, index, array) {
        // The last Breadcrumb in the BreadcrumbBar shouldn't be a link.
        var isLink = index < array.length - 1;

        breadcrumbPath += name + "/";

        return(
          <Breadcrumb name={name}
                      key={name}
                      path={breadcrumbPath}
                      isLink={isLink}
                      onCrumbClick={this.handleCrumbClick} />
        );
      }.bind(this));

    return (
      <ul className="fileui_box-breadcrumb_bar">
        <Breadcrumb name={this.props.repoName}
                    key={this.props.repoName}
                    path=""
                    isLink={true}
                    onCrumbClick={this.handleCrumbClick} />
        {breadcrumbNodes}
      </ul>
    );
  }
});


var Breadcrumb = React.createClass({
  /*
   * User clicked a Breadcrumb so we must pass the new state up to whoever owns it.
   * @parameter {object} The click event.
   * @return Nothing
   */
  handleCrumbClick: function(event) {
    event.preventDefault();
    this.props.onCrumbClick(event.target.dataset.path);
  },


  render: function() {
    if (this.props.isLink) {
      return (
        <li className="fileui_box-breadcrumb">
          <a className="fileui_box-breadcrumb_link"
             href=""
             data-path={this.props.path}
             onClick={this.handleCrumbClick}>{this.props.name}</a>
        </li>
      );
    } else {
      return (
        <li className="fileui_box-breadcrumb">{this.props.name}</li>
      );
    }
  }
});


var FileUITable = React.createClass({
  /*
   * This just passes data from below FileUITable to above FileUITable.
   * @parameter Implicit -- just passes the arguments variable up.
   * @return Nothing
   */
  handleFileClick: function() {
    this.props.onFileClick.apply(undefined, arguments);
  },


  /*
   * Take a path like a/b/c/ and remove c/.
   * @parameter {string} The path to modify.
   * @return {string} The modified path.
   */
  removeALevelFromPath: function(path) {
    var newPath = path
                  .replace(/\/$/, "") // Remove trailing slash.
                  .split("/")
                  .filter(function(segment, index, array) {
                     return (!segment || index >= array.length - 1) ? false: true
                   })
                  .join("/");
    return newPath ? newPath + "/" : "";
  },


  render: function() {
    var fileNodes = [];

    // If we're not at the top level directory, render a double dot link to go up one level.
    if (this.props.path) {
      var newPath = this.removeALevelFromPath(this.props.path);
      fileNodes.push(<FileUIRow key=".."
                                name=".."
                                path={newPath}
                                modified=""
                                directory={true}
                                onFileClick={this.handleFileClick} />);
    }

    for (var file in this.props.files) {
      fileNodes.push(<FileUIRow key={this.props.files[file].name}
                                name={this.props.files[file].name}
                                path={this.props.path}
                                modified={this.props.files[file].modified}
                                directory={this.props.files[file].directory === true}
                                onFileClick={this.handleFileClick} />);
    }

    return (
      <table className="fileui_box-table"><tbody>
        {fileNodes}
      </tbody></table>
    );
  }
});


var FileUIRow = React.createClass({
  /*
   * User clicked a FileUIRow so we must pass the new state up to whoever owns it.
   * @parameter {object} The click event.
   * @return Nothing
   */
  handleRowClick: function(event) {
    event.preventDefault();

    var newPath = event.target.dataset.path;
    // Go up. New state when clicking a FileUIRow link is it's path plus it's name.
    // God down. If this FileUIRow is a double dot link, the new state is just it's path.
    if (this.props.name != "..") {
      newPath += this.props.name + "/";
    }

    this.props.onFileClick(newPath);
  },


  render: function() {
    var icon = this.props.directory ?
                 <FileIcon className="fileui_box-icon icon-folder" /> :
                 <FileIcon className="fileui_box-icon icon-file-text2" />;

    return (
      <tr className="fileui_box-row">
        <td className="fileui_box-cell icon">
          {icon}
        </td>
        <td className="fileui_box-cell name">
          <a className="fileui_box-link" href="" data-path={this.props.path} onClick={this.handleRowClick}>
            {this.props.name}
          </a>
        </td>
        <td className="fileui_box-cell modified">
          {this.props.modified}
        </td>
      </tr>
    );
  }
});


var FileIcon = React.createClass({
  render: function() {
    return (
      <span className={this.props.className}></span>
    );
  }
});


var FileDisplay = React.createClass({
  render: function() {
    return (
      <div className="fileui_box-file">{this.props.content}</div>
    );
  }
});


/*
 * Our test data is stored in the global variable "files".  Given it's structure, the repository
 * name is the first properties name.
 */
React.render(
  <FileUI files={files} repoName={Object.keys(files)[0]} />,
  document.getElementById("content"),
  window.runTests // Jasmine tests
);
