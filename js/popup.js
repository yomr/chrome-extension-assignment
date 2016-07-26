// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function getBrowsersJSON(callback){
  var url = 'https://www.browserstack.com/list-of-browsers-and-platforms.json?product=live'
  var x = new XMLHttpRequest();

  x.open('GET', url);
  x.responseType = 'json';
  x.onload = function() {
    callback(x.response);
  }
  x.send();
}

function loadDeviceType(keys){

  var $el = $("#device-type");
  $el.empty(); // remove old options
  $el.append($("<option selected disabled hidden></option>")
          .text('Select Device type'));
  $.each(keys, function(index, value) {
      $el.append($("<option></option>").attr("value", value).text(value));
  });
  $el.prop("disabled", false);
  $('#loading').hide();
}

function loadOSList(device, browserList){
  var valuesToProcess = browserList[device];
  var $el = $("#os-list");
  $el.empty(); // remove old options
  $el.append($("<option selected disabled hidden></option>")
          .text('Pick OS'));
  $.each(valuesToProcess, function(index, value) {
      $el.append($("<option></option>").attr("value", index).text(value['os_display_name']));
  });
  $el.prop("disabled", false);
  $("#browser-list").empty().append("<option selected disabled hidden>Select OS first</option>");
}

function loadBrowserList(device, os_index, browserList){
  var $el = $("#browser-list");
  $el.empty(); // remove old options

  if(device == 'desktop'){
    var valuesToProcess = browserList[device][os_index]['browsers'];
    $el.append($("<option selected disabled hidden></option>")
            .text('Pick browser'));
  }else{
    var valuesToProcess = browserList[device][os_index]['devices'];
    $el.append($("<option selected disabled hidden></option>")
            .text('Pick mobile'));
  } 
  
  $.each(valuesToProcess, function(index, value) {
      $el.append($("<option></option>").attr("value", index).text(value['display_name']));
  });
  $el.prop("disabled", false);

}



function isUrlValid(url) {
  return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function startSession(startObject){
  var bsUrl = 'https://browserstack.com/start#';
  $.each(startObject, function(key, value){
    if(value == undefined){
      $('#invalid-error').show();
      return;  
    }
    bsUrl += key+ '=' + value + '&';
  });
  bsUrl += 'start=true';
  chrome.tabs.create({ url: bsUrl });
}


function validateAndStartSession(browserList){
  var device, os_index, browser_index, os, os_version, browser, browser_version;
  var invalid = false
  var device = $("#device-type").val();
  var os_index = $("#os-list").val();
  var browser_index = $("#browser-list").val();
  var url = $('#url').val();
  if(device == undefined || os_index == undefined || browser_index == undefined){
    $('#invalid-error').show();
    invalid = true;
  }
  if (url == undefined && !isUrlValid(url)){
    $('#invalid-url').show();
    invalid = true;
  }
  if(invalid){
    return;
  }else{
    var startObject = {};
    startObject['os'] = browserList[device][os_index]['os'];
    
    if(device == 'desktop'){
      startObject['os_version'] = browserList[device][os_index]['os_version'];
      startObject['browser'] = browserList[device][os_index]['browsers'][browser_index]['browser'];
      startObject['browser_version'] = browserList[device][os_index]['browsers'][browser_index]['browser_version'];
    }else{
      startObject['os_version'] = browserList[device][os_index]['devices'][browser_index]['os_version'];
      startObject['device'] = browserList[device][os_index]['devices'][browser_index]['device'];
    }
    startObject['url'] = url
    startSession(startObject);
  }
}

function uibindings(browserList){
  
  $("#device-type").change(function(){
    var device = this.value; //get drop1 's selected value
    loadOSList(device, browserList);
  });

  $("#os-list").change(function(){
    var device = $("#device-type").val();
    var os_index = this.value; //get drop1 's selected value
    loadBrowserList(device, os_index, browserList);
  });

  $("#browser-list").change(function(){
    $('#url').prop("disabled", false);
  });


  $('#submit').click(function(){
    $('#invalid-error').hide();
    $('#invalid-url').hide();
    validateAndStartSession(browserList);
  });

  $('#url').on('input', function() {
      var empty = false; 
      if ($('#url').val().length == 0) {
          empty = true;
      }
      if (empty) {
          $('input[type="submit"]').prop('disabled', true);
      } else {
          $('input[type="submit"]').prop('disabled', false);
      }
  });

}

function loadAndRender(browserList){
  uibindings(browserList);
  loadDeviceType(Object.keys(browserList));
}

document.addEventListener('DOMContentLoaded', function() {
  getBrowsersJSON(loadAndRender);
});

