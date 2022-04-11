/**
 * Copyright 2021 Jens A. Koch.
 * SPDX-License-Identifier: BSL-1.0
 * This file is part of hikogui.
 */
(function() {
  'use strict';

  var latest_version = @LATEST_VERSION@;

  var versions = @VERSIONS@;

  var url_web = /(hikogui\.org\/docs\/hikogui\/)(main|latest|(\d+\.\d+\.\d+)?)\//;

  var url_dev = /(jakoch\.github\.io\/hikogui\.github\.io\/docs\/hikogui\/)(main|latest|(\d+\.\d+\.\d+)?)\//;

  function build_dropdown(current_version) {
    // display a warning message, when user switches to "main" development branch
    if (current_version == 'main') {
      var alert_div = document.createElement("div");
      alert_div.innerHTML = '⚠️ This documents the <a style="font-family: monospace;" href="https://github.com/hikogui/hikogui/tree/main">main</a> development branch of HikoGUI. It might differ from release versions.';
      alert_div.style.cssText = "color: #856404; background-color: #fff3cd; border-color: #ffeeba; margin: 5px 10px; padding: 5px; border-radius: 1ex; display: inline;"
      var dropdownNode = $("#project_version_dropdown")[0];
      $(alert_div).insertAfter(dropdownNode);
    }

    // display a warning message, when user switches to an "old version"
    if (current_version.localeCompare(latest_version, undefined, { numeric: true, sensitivity: 'base' }) == -1) {
      var oldver_alert_div = document.createElement("div");
      oldver_alert_div.innerHTML = '⚠️ This documents an old version of HikoGUI. <a href="https://hikogui.org/docs/hikogui/'+latest_version+'">Switch to the latest release.</a> Or, select a version from the drop-down menu.';
      oldver_alert_div.style.cssText = "color: #856404; background-color: #fff3cd; border-color: #ffeeba; margin: 5px 10px; padding: 5px; border-radius: 1ex; display: inline;"
      var dropdownNode = $("#project_version_dropdown")[0];
      $(oldver_alert_div).insertAfter(dropdownNode);
    }

    var dropdown = ['<select>'];
    $.each(versions, function(id) {
      var version = versions[id];
      dropdown.push('<option value="' + version + '"');
      if (version.localeCompare(current_version, undefined, { numeric: true, sensitivity: 'base' }) == 0) {
        dropdown.push(' selected="selected">');
      } else {
        dropdown.push('>');
      }
      if (version.localeCompare(latest_version, undefined, { numeric: true, sensitivity: 'base' }) == 0) {
        dropdown.push(version + ' (latest)');
      } else {
        dropdown.push(version);
      }
      dropdown.push('</option>');
    });

    return dropdown.join('');
  }

  function update_url(url, new_version) {
    if(url.includes("hikogui.org")) {
      return url.replace(url_web, 'hikogui.org/docs/hikigui/' + new_version + '/');
    } else {
      return url.replace(url_dev, 'jakoch.github.io/hikogui.github.io/docs/hikigui/' + new_version + '/');
    }
  }

  function on_change_switch_url() {
    var selected = $(this).children('option:selected').attr('value');
    var url = window.location.href;
    var new_url = update_url(url, selected);
    if (new_url != url) {
      window.location.href = new_url;
    }
  }

  $(document).ready(function() {
      var targetNode=$("#projectname")[0];
      targetNode.style.display = "inline";

      var divNode = document.createElement("div");
      divNode.id = "project_version_dropdown";
      divNode.style.cssText = "display: inline; margin-left: 15px;";
      divNode.textContent = "Select Version: ";

      var spanNode = document.createElement("span");
      spanNode.id = "version_dropdown";
      spanNode.textContent = "major.minor.patch";

      divNode.appendChild(spanNode);

      $(divNode).insertAfter(targetNode);

      var match = url_web.exec(window.location.href);
      if (!match) {
        match = url_dev.exec(window.location.href);
      }

      var version = match[2];
      var select = build_dropdown(version);
      spanNode.innerHTML=select;
      $('#version_dropdown select').bind('change', on_change_switch_url);
  });
})();
