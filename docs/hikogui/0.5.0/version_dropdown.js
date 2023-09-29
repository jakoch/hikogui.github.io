/**
 * Copyright 2021-2023 Jens A. Koch.
 * SPDX-License-Identifier: BSL-1.0
 * This file is part of hikogui.
 */
(function () {
  'use strict';

  var latest_version = "0.8.1";

  var versions = ["main","bug-msvs-20220928","modules-part1","msvc-bug-20221214","msvc-bug-20230706","msvs-bug-20230428","msvs-bug-20230503","msvs-bug-20230517","new-window-widget","phrase-mask-chars","ranged-int","text","0.8.1","0.8.0","0.7.0","0.6.0","0.5.1","0.5.0","0.4.0","0.3.0","0.2.3","0.2.2","0.2.1","0.2.0","0.1.0"];

  function get_dropdown_node() {
    return $("#project_version_dropdown")[0];
  }

  // General function to create an alert message
  function get_div_alert_message(message) {
    var alert_div = document.createElement("div");
    alert_div.innerHTML = message;
    alert_div.style.cssText = "color: #856404; background-color: #fff3cd; border-color: #ffeeba; margin: 5px 10px; padding: 5px; border-radius: 1ex; display: inline;";
    return alert_div;
  }

  // Function to display a warning message, when user switches to "main" development branch
  function display_main_branch_warning(current_version) {
    if (current_version == 'main') {
      var message = '⚠️ This documents the <a href="https://github.com/hikogui/hikogui/tree/main">main</a> development branch of HikoGUI. It might differ from release versions.';
      var alert_div = get_div_alert_message(message);
      $(alert_div).insertAfter(get_dropdown_node());
    }
  }

  // Function to display a warning message, when user switches to an "old version"
  function display_old_version_warning(current_version, latest_version) {
    if (is_valid_release_version(current_version) && current_version !== latest_version) {
      var message = '⚠️ This documents an old version of HikoGUI. Switch to the <a href="https://hikogui.org/docs/hikogui/' + latest_version + '">latest</a> release. Or, select a version from the drop-down menu.';
      var alert_div = get_div_alert_message(message);
      $(alert_div).insertAfter(get_dropdown_node());
    }
  }

  function is_valid_release_version(version) {
    var versionPattern = /^\d+\.\d+\.\d+$/;
    return version.match(versionPattern);
  }

  function update_url(url, new_version) {
    return url.includes('/docs/hikogui/') ? url.replace(/\/docs\/hikogui\/[^/]+/, '/docs/hikogui/' + new_version) : url;
  }

  function on_change_switch_url() {
    var selected = $('#version_dropdown select').val();
    var current_url = window.location.href;
    var new_url = update_url(current_url, selected);
    if (new_url != current_url) {
      window.location.href = new_url;
    }
  }

  function build_dropdown(current_version) {
    var dropdown = ['<select>'];

    // add option for the "main" branch as "latest development" branch on top
    dropdown.push('<option value="main">main (latest dev)</option>');

    // Group: Released Versions
    dropdown.push('<optgroup label="Releases">');
    versions.filter(version => is_valid_release_version(version)).forEach(function (version) {
      dropdown.push('<option value="' + version + '"')
      if (version === current_version) {
        dropdown.push(' selected="selected">');
      } else {
        dropdown.push('>');
      }
      dropdown.push(version)
      // mark latest version
      if (version === latest_version) {
        dropdown.push(' (latest)');
      }
      dropdown.push('</option>');
    });
    dropdown.push('</optgroup>');


    // Group: Feature Branches
    dropdown.push('<optgroup label="Feature Branches">');
    versions.filter(version => !is_valid_release_version(version) && version !== "main").forEach(function (version) {
      dropdown.push('<option value="' + version + '"')
      if (version === current_version) {
        dropdown.push(' selected="selected">');
      } else {
        dropdown.push('>');
      }
      dropdown.push(version);
      // mark latest version
      //if(version === 'main') { dropdown.push(' (latest dev)'); }
      dropdown.push('</option>');
    });
    dropdown.push('</optgroup>');

    dropdown.push('</select>');

    return dropdown.join('');
  }

  function get_current_version_from_url() {
    var url = window.location.href;
    // sort versions in descending order to match the most specific version first
    versions.sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) * -1;
    });
    for (var version of versions) {
        if (url.includes('/' + version + '/')) {
            return version;
        }
    }
    return "main"; // default to "main", if no version is found
  }

  $(document).ready(function () {
    var targetNode = $("#projectname")[0];
    targetNode.style.display = "inline";

    var divNode = document.createElement("div");
    divNode.id = "project_version_dropdown";
    divNode.style.cssText = "display: inline; margin-left: 60px;";
    divNode.textContent = "Select Version: ";

    var spanNode = document.createElement("span");
    spanNode.id = "version_dropdown";

    var current_version = get_current_version_from_url();
    spanNode.innerHTML = build_dropdown(current_version);

    divNode.appendChild(spanNode);
    $(divNode).insertAfter(targetNode);

    $('#version_dropdown select').bind('change', on_change_switch_url);

    display_main_branch_warning(current_version);
    display_old_version_warning(current_version, latest_version);
  });
})();
