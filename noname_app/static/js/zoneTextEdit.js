"use strict";
/**
* Rich-text editing
* (adapted from https://developer.mozilla.org/fr/docs/Rich-Text_Editing_in_Mozilla)
*
*/
var zoneEditBox = {
      initDoc: function(){
        // this.oDoc = document.getElementById("textBox");
        this.sDefTxt = this.oDoc.innerHTML;
        if (document.compForm.switchMode.checked) { setDocMode(true); }
      },
      formatDoc: function(sCmd, sValue){
        if (this.validateMode()) {
          document.execCommand(sCmd, false, sValue);
          this.oDoc.focus();
          if(this.callback){
            this.callback(this.oDoc.innerHTML);
          }
        }
      },
      validateMode: function(){
        if (!document.compForm.switchMode.checked) { return true ; }
        alert("Uncheck \"Show HTML\".");
        this.oDoc.focus();
        return false;
      },
      setDocMode: function(bToSource) {
        var oContent,
            oDoc = this.oDoc;
        if (bToSource) {
          oContent = document.createTextNode(oDoc.innerHTML);
          oDoc.innerHTML = "";
          var oPre = document.createElement("pre");
          oDoc.contentEditable = false;
          oPre.id = "sourceText";
          oPre.contentEditable = true;
          oPre.appendChild(oContent);
          oDoc.appendChild(oPre);
        } else {
          if (document.all) {
            oDoc.innerHTML = oDoc.innerText;
          } else {
            oContent = document.createRange();
            oContent.selectNodeContents(oDoc.firstChild);
            oDoc.innerHTML = oContent.toString();
          }
          oDoc.contentEditable = true;
        }
        oDoc.focus();
        if(this.callback){
          this.callback(oDoc.innerHTML);
        }
      },
      callback: undefined,
      oDoc: undefined,
      sDefTxt: undefined,
      create: function(parent, options={}){
        parent = parent || document.body;
        options.content = options.content || "<p>Lorem ipsum</p>";
        options.id = options.id || "textEditZone";
        this.callback = options.callback;
        let zone = document.createElement("div");
        zone.id = options.id;
        zone.style.width = "480px";
        zone.innerHTML = `<form name="compForm" onsubmit="if(zoneEditBox.validateMode()){this.myDoc.value=zoneEditBox.oDoc.innerHTML;return true;}return false;">
          <input type="hidden" name="myDoc">
          <div class="toolBar">
          <select id="fontSelect" onchange="zoneEditBox.formatDoc('fontname',this[this.selectedIndex].value);this.selectedIndex=0;">
          <option class="heading" selected>- font -</option>
          </select>
          <select onchange="zoneEditBox.formatDoc('fontsize',this[this.selectedIndex].value);this.selectedIndex=0;">
          <option class="heading" selected>- size -</option>
          <option value="1">Very small</option>
          <option value="2">A bit small</option>
          <option value="3">Normal</option>
          <option value="4">Medium-large</option>
          <option value="5">Big</option>
          <option value="6">Very big</option>
          <option value="7">Maximum</option>
          </select>
          <input type="color" onchange="zoneEditBox.formatDoc('forecolor',this.value);"/>
          </div>
          <div class="toolBar">
          <img class="intLink" title="Bold" onclick="zoneEditBox.formatDoc('bold');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" />
          <img class="intLink" title="Italic" onclick="zoneEditBox.formatDoc('italic');" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" />
          <img class="intLink" title="Underline" onclick="zoneEditBox.formatDoc('underline');" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" />
          <img class="intLink" title="Left align" onclick="zoneEditBox.formatDoc('justifyleft');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==" />
          <img class="intLink" title="Center align" onclick="zoneEditBox.formatDoc('justifycenter');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7" />
          <img class="intLink" title="Right align" onclick="zoneEditBox.formatDoc('justifyright');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==" />
          <img class="intLink" style="float:right;" title="Remove formatting" onclick="zoneEditBox.formatDoc('removeFormat')" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg==">
          <img class="intLink" style="float:right;" title="Clean" onclick="if(zoneEditBox.validateMode()&&confirm('Are you sure?')){zoneEditBox.oDoc.innerHTML=zoneEditBox.sDefTxt};if(zoneEditBox.callback){zoneEditBox.callback(zoneEditBox.oDoc.innerHTML);};" src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7" />
          <img class="intLink" style="float:right;" title="Undo" onclick="zoneEditBox.formatDoc('undo');" src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=" />
          <img class="intLink" style="float:right;" title="Redo" onclick="zoneEditBox.formatDoc('redo');" src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==" />
          </div>
          <div id="textBox" contenteditable="true"></div>
          <p id="editMode"><input type="checkbox" name="switchMode" id="switchBox" onchange="zoneEditBox.setDocMode(this.checked);"/> <label for="switchBox">Show HTML</label></p>
          </form>`;
        parent.appendChild(zone);
        this.oDoc = parent.querySelector("#textBox");
        this.oDoc.innerHTML = options.content;
        this.initDoc();
        if(this.callback){
          this.oDoc.onkeyup = () => {
            this.callback(this.oDoc.innerHTML);
          };
        }

        let font_select = d3.select("#fontSelect");
        available_fonts.forEach(function(font){
            font_select.append("option").text(font[0]).attr("value", font[1])
        });
      },
      remove: function(){
        this.oDoc = undefined;
        this.sDefTxt = undefined;
        this.callback = undefined;
      }
    };
