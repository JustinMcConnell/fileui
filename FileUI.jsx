var FileUI = React.createClass({
  getInitialState: function() {
    return {path: ""};
  },

  componentDidMount: function() {
    window.addEventListener("popstate", function(event) {
      this.setState(event.state);
    }.bind(this));
  },

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
  handleCrumbClick: function(event) {
    this.props.onCrumbClick.apply(undefined, arguments);
  },

  render: function() {
    // The path that an individual Breadcrumb leads to.
    var breadcrumbPath = "";

    var breadcrumbNodes = this.props.path
      .split("/")
      .filter(function(name) {
        return name ? true : false;
      })
      .map(function(name, index, array) {
        // The last Breadcrumb in the BreadcrumbBar shouldn't be a link.
        var isLink = index < array.length - 1;

        breadcrumbPath += "/" + name;

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
  handleFileClick: function() {
    this.props.onFileClick.apply(undefined, arguments);
  },

  render: function() {
    var fileNodes = [];
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
  handleChange: function(event) {
    event.preventDefault();
    this.props.onFileClick(event.target.dataset.path + this.props.name + "/");
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
          <a className="fileui_box-link" href="" data-path={this.props.path} onClick={this.handleChange}>
            {this.props.name}
          </a>
        </td>
        <td className="fileui_box-cell modified">{this.props.modified}</td>
      </tr>
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

var FileIcon = React.createClass({
  render: function() {
    return (
      <span className={this.props.className}></span>
    );
  }
});

React.render(
  <FileUI files={files} repoName={Object.keys(files)[0]} />,
  document.getElementById("content"),
  window.runTests
);
