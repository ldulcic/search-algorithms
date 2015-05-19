$( "#myframe" ).load(function(){

    var full = false;
    var framD3 = d3.select("#myframe");
    var fram = document.getElementById("myframe");
    var myDiv = document.getElementsByClassName("col-md-5")[0];
    var navBar = document.getElementsByClassName("navbar")[0];
    var graph = document.getElementsByClassName("alg-section")[0];
    fram.contentDocument.getElementById("fullscreen").addEventListener("click", function() {
        if (full) {
           graph.style.paddingTop = "100px";
           navBar.style.padding = "20px 0";
           myDiv.style.display = "inline";
           framD3.classed("col-md-12",false).classed("col-md-7",true);
           full = false;
        } else {
           graph.style.paddingTop = "50px";
            navBar.style.padding = "0";
            myDiv.style.display = "none";
            framD3.classed("col-md-7",false).classed("col-md-12",true);
            full = true;
        }
    }, false);
});
