////////////////////////////////////////////////////////////////////////
// Browse and upload buttons + related actions (conversion + displaying)
////////////////////////////////////////////////////////////////////////
var target_layer_on_add = false,
    joined_dataset = [];

$(document).ready(function() {
    var files;
    $('input[type=file]').on('change', prepareUpload);
    function prepareUpload(event){
      files = event.target.files;
    };

    $('#submit_form').submit(function(e, options) {
        e.stopPropagation();
        e.preventDefault();
        $form = $(e.target);
        if(files.length == 1 && strContains(files[0].name, 'topojson')){
            handle_TopoJSON_files(files);
            }
        else if(files.length == 1 && (strContains(files[0].name, 'geojson')
                                || strContains(files[0].name, 'zip'))){

            handle_single_file(files);
        }
        else if(strContains(files[0].name.toLowerCase(), '.csv') || strContains(files[0].name.toLowerCase(), '.xls')
                    || strContains(files[0].name.toLowerCase(), '.tsv') || strContains(files[0].name.toLowerCase(), 'txt')) {
            handle_dataset(files)
        }
        else if(files.length >= 4){
            var filenames = [];
            for (i=0; i<files.length; i++) filenames[i] = files[i].name;
            var res = strArraysContains(filenames, ['.shp', '.dbf', '.shx', '.prj']);
            if(res.length >= 4){
                var ajaxData = new FormData();
                alert('I am gonna handle this...');
                ajaxData.append("action", "submit_form");
                $.each($("input[type=file]"), function(i, obj) {
                    $.each(obj.files, function(j, file){
                        ajaxData.append('file['+j+']', file);
                        console.log(file);
                    });
                });
                console.log(ajaxData);
                 $.ajax({
                    url: '/convert_to_topojson',
                    data: ajaxData,
                    type: 'POST',
                    success: function(data) {add_layer_fun(data);},
                    error: function(error) {console.log(error); }
                    });
                console.log($(e.target)); console.log(files); console.log(this);
                }
            else {
                alert('All mandatory files (.shp, .dbf, .shx, .prj) have been provided for reading a Shapefile');
                }
        }
    });
});

////////////////////////////////////////////////////////////////////////
// Some jQuery functions to handle drag-and-drop events :
////////////////////////////////////////////////////////////////////////

$(document).on('dragenter', '#section1,#section3', function() {
            target_layer_on_add = false
            $(this).css('border', '3px dashed green');
            return false;
});
$(document).on('dragover', '#section1,#section3', function(e){
            e.preventDefault();
            e.stopPropagation();
            $(this).css('border', '3px dashed green');
            return false;
});
$(document).on('dragleave', '#section1,#section3', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).css('border', '');
            return false;
});
$(document).on('drop', '#section1,#section3', function(e) {
   var files = e.originalEvent.dataTransfer.files;

   if(this.id === "section1") target_layer_on_add = true;

   if(!(e.originalEvent.dataTransfer.files.length == 1)){
        console.log(files);
        var filenames = [];
        for(i=0; i < files.length; i++){filenames[i] = files[i].name;}
        var result = strArraysContains(filenames, ['.shp', '.dbf', '.shx', '.prj']);
        e.preventDefault();e.stopPropagation();
        console.log(filenames);
        console.log(result);
        if(result.length == 4){
            $(this).css('border', '3px dashed red');
            alert('All mandatory files (.shp, .dbf, .shx, .prj) have been provided for reading a Shapefile');
            $(this).css('border', '');
            handle_shapefiles(files);
        }else {
            $(this).css('border', '3px dashed red');
            alert('ShapeFiles have to be updated in a Zip Folder (containing the 4 mandatory files : .shp, .dbf, .prj and .shx)');
            $(this).css('border', '');
        }
    }
   else if(strContains(files[0].name.toLowerCase(), 'topojson')){
           e.preventDefault();e.stopPropagation();
           $(this).css('border', '');
           // Most direct way to add a layer :
           handle_TopoJSON_files(files);
   }
   else if(strContains(files[0].name.toLowerCase(), 'geojson') 
            || strContains(files[0].type.toLowerCase(), 'application/zip')){
           e.preventDefault();e.stopPropagation();
           $(this).css('border', '');
           // Send the file to the server for conversion :
           handle_single_file(files);
   }
  else if(strContains(files[0].name.toLowerCase(), '.csv') || strContains(files[0].name.toLowerCase(), '.xls')
            || strContains(files[0].name.toLowerCase(), '.tsv') || strContains(files[0].name.toLowerCase(), 'txt')) {
        alert('Dataset provided');
        e.preventDefault();e.stopPropagation();
        $(this).css('border', '');
        handle_dataset(files);
   }
  else {
        $(this).css('border', '3px dashed red');
        alert('Invalid datasource (No GeoJSON/TopoJSON/zip/Shapefile detected)');
        $(this).css('border', '');
    }
});

////////////////////////////////////////////////////////////////////////
// Functions to handles files according to their type
////////////////////////////////////////////////////////////////////////

// Now some functions to handle the dropped-file(s) :
// - By trying directly to add it if it's a TopoJSON :

function handle_TopoJSON_files(files) {
    var f = files[0],
        name = files[0].name,
        reader = new FileReader();
    reader.onloadend = function(){
        var text = reader.result;
        console.log(text);
        add_layer_fun(text);
        $.ajax({
                   type: 'POST',
                   url: '/cache_topojson', 
                   data: {file: [name, text]},
                   success: function() {}
        });
        }
    reader.readAsText(f);
};

function handle_dataset(files){
  for (i = 0, f = files[i]; i != files.length; ++i) {
    var reader = new FileReader();
    var name = f.name;
    reader.onload = function(e) {
      var data = e.target.result;
      joined_dataset.push(d3.csv.parse(data))
    };
    reader.readAsText(f);
  }
}

// - By ziping the zipfile to send them to the server :
// Currently not working
function handle_shapefiles(files){
    var datas = [];
    var ziped = new JSZip();
    var formData = new FormData();
    for(var i=0; i < files.length; i++){
        var reader = new FileReader();
        var file = files[i];
        reader.onloadend = function(evt){
            if (evt.target.readyState == FileReader.DONE) {
                datas.push(evt.target.result);
                ziped.file(file.name, datas[i]);
                }
            };
        reader.readAsArrayBuffer(file);
    }
    console.log(datas);
       
    var content = ziped.generate({type: "base64"});
    console.log(content);
    $.ajax({
            type: 'POST',
            url: '/convert_to_topojson', 
            data: {file: ['data:application/zip;base64', files[0].name.split('.')[0]+'.zip', content]},
            success: function(data) {add_layer_fun(data) ;},
            error: function(x){console.log(x);}
        });
};


// - By sending it to the server for conversion (GeoJSON to TopoJSON)
function handle_single_file(files) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function handleReaderLoad(evt) {
            var data = evt.target.result.split(',');
            var dtype = data[0];  // TODO : display an indeterminate progress bar while waiting for server reply
            data = data[1];
            $.ajax({
                       type: 'POST',
                       url: '/convert_to_topojson', 
                       data: {file: [dtype, file.name, data]},
                       success: function(data) {add_layer_fun(data);}
            });
        };
        reader.readAsDataURL(file);
};

// Add the TopoJSON to the 'svg' element :

function add_layer_fun(text){
    parsedJSON = JSON.parse(text);
    console.log(parsedJSON)
    if(parsedJSON.Error){  // Server returns a JSON reponse like {"Error":"The error"} if something went bad during the conversion
        alert(parsedJSON.Error);
        return;
    }
    var layers_names = Object.getOwnPropertyNames(parsedJSON.objects);
    var type;
    // Loop over the layers to add them all ?
    // Probably better open an alert asking to the user which one to load ?
    for(i=0; i < layers_names.length; i++){
        if(strContains(parsedJSON.objects[layers_names[i]].geometries[0].type, 'oint')) type = 'Point';
        else if(strContains(parsedJSON.objects[layers_names[i]].geometries[0].type, 'tring')) type = 'Line';
        else if(strContains(parsedJSON.objects[layers_names[i]].geometries[0].type, 'olygon')) type = 'Polygon';

        map.append("g").attr("id", layers_names[i])
              .selectAll(".subunit")
              .data(topojson.feature(parsedJSON, parsedJSON.objects[layers_names[i]]).features)
              .enter().append("path")
              .attr("d", path)
              .style("stroke", "red")
              .style("stroke-opacity", .4)
              .style("fill", function(){
                  if(type != 'Line') return("beige");
                  else return(null); // Some conditional styling (to avoid weird effect with linestring)
                  })
              .style("fill-opacity", function(){
                  if(type != 'Line') return(0.5);
                  else return(0);
                  })
              .attr("height", "100%")
              .attr("width", "100%");
        d3.select("#layer_menu")
              .append('p').html('<a href>- ' + layers_names[i]+"</a>");
        try {
            var bounds = d3.geo.bounds(parsedJSON.objects[layers_names[i]]);
            var centroid = d3.geo.centroid(parsedJSON.objects[layers_names[i]]);
            console.log(bounds);
            console.log(centroid);
        } catch(err){
            console.log(err);
            console.log(path.bounds(parsedJSON.arcs));
            console.log(path.centroid(parsedJSON.arcs));
        }

        class_name = target_layer_on_add ? "ui-state-default sortable_target " + layers_names[i] : "ui-state-default " + layers_names[i]
        layers_listed = layer_list.node()
        li = document.createElement("li");
        li.setAttribute("class", class_name);
        li.innerHTML = type + " - " + layers_names[i] + button_style + button_trash + button_active;
        layers_listed.insertBefore(li, layers_listed.childNodes[0])
        if(target_layer_on_add) d3.select('#input_geom').html("User geometry : <b>"+layers_names[i]+"</b> <i>("+type+")</i>");
    }
    binds_layers_buttons();
    /*
    d3.selectAll(".style_button").on("click", function(){handle_click_layer(this.parentElement.innerHTML.split(" <butt")[0])});
    d3.selectAll(".trash_button").on("click", remove_layer);
    d3.selectAll(".active_button").on("change", handle_active_layer)
    */
    alert('Layer successfully added to the canvas');
};

// Some helpers

function strContains(string1, substring){
    return string1.indexOf(substring) >= 0;
};

function strArraysContains(ArrString1, ArrSubstrings){
    var result = [];
    for(i=0; i < ArrString1.length; i++){
        for(j=0; j < ArrSubstrings.length; j++){
            if(strContains(ArrString1[i], ArrSubstrings[j])){
            result[result.length] = ArrSubstrings[j];
            }
        }
    }
    return result;
};