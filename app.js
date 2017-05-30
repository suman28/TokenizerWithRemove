var k = 0,
    i = 0,
    j = 0;
var key;

$(function () {

    var items = [];
    var keywords = [];
    var parse;
    $.when(
        // $.get('/ibi_apps/run.bip?BIP_REQUEST_TYPE=BIP_RUN&BIP_folder=IBFS%253A%252FEDA%252FEDASERVE%252Ftypeahead&BIP_item=procedure_typeahead.fex&windowHandle=436960&IBI_random=4516.2870024981075', function (data) {
        //     parse = JSON.parse(data);
        //     items = parse.records;
        // }),
        // $.get('/ibi_apps/run.bip?BIP_REQUEST_TYPE=BIP_RUN&BIP_folder=IBFS%253A%252FEDA%252FEDASERVE%252Ftypeahead&BIP_item=procedure2.fex&windowHandle=271353&IBI_random=2165.7337772878413', function (data) {
        //     parse = JSON.parse(data);
        //     keywords = parse.records;
        // })


        $.get('data/data.json', function (data) {
            //store records in items array
            items = data.records;
        }),


        //get json from second record
        $.get('data/data1.json', function (data) {
            //store records in keywords array
            keywords = data.records;
        })
    ).then(function () {
        var result = {};
        //concat data from two records into one
        result = items.concat(keywords);
        //rename NAME property to value
        //this is done because tokenfield for bootstrap expects value property
        var newData = renameNameToValue(result);
        configureItems(newData);
    });



    //function to replace NAME and KEYWORD properties to "value"
    function renameNameToValue(data) {
        data.forEach(function (e) {
            if (e.NAME) {
                e.value = e.NAME;
                delete e.NAME;
            }
            if (e.KEYWORD) {
                e.value = e.KEYWORD;
                delete e.KEYWORD;
            }
        });
        return data;
    }

    function configureItems(items) {

        var config = new Bloodhound({
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.value);
            },
            //datumTokenizer: Bloodhound.tokenizers.obj.whitespace('NAME', 'KEYWORD'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: $.map(items, function (item, key) {


                return {
                    // value: item.value || '',
                    //NAME: item.NAME || '',
                    TBNAME: item.TBNAME || '',
                    // KEYWORD: item.KEYWORD || '',
                    value: item.value || ''
                };
            })
        });


        config.initialize();


        $('#typeahead').tokenfield({
            typeahead: [null, {
                name: 'config',
                displayKey: function (item) {
                    if (item) {
                        if (item.value) {
                            return item.value;
                        } else {
                            return item.KEYWORD;
                        }
                    }
                },
                source: config.ttAdapter(),
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'Unable to find any match',
                        '</div>'
                    ].join('\n'),
                    suggestion: function (data) {
                        var _suggestion = '';
                        if (data.TBNAME) {
                            _suggestion = "<div>" +
                                data.value +
                                " in " +
                                data.TBNAME + "</div>";
                        } else {
                            _suggestion = "<div>" +
                                data.value + "</div>";
                        }
                        return _suggestion;
                    }
                }
            }]
        });
    }

    //use this function to manually remove chip from UI 
    function removed(attrs, tokenAttr) {
        var $token;
        $('.token').each(function () {
            $token = $(this);
            $token.map(function () {
                var $token = $(this);
                if ($token.data('attrs').value == tokenAttr) {
                    return $token;
                }
            });
        });
        var options = {
                attrs: attrs,
                relatedTarget: $token.get(0)
            },
            removeEvent = $.Event('tokenfield:removetoken', options)


        $(this).trigger(removeEvent);


        // Remove event can be intercepted and cancelled
        if (removeEvent.isDefaultPrevented()) return;


        var removedEvent = $.Event('tokenfield:removedtoken', options),
            changeEvent = $.Event('change', {
                initiator: 'tokenfield'
            });


        // Remove token from DOM
        $token.remove();
    }

    //to change the styles of chip based on its TBNAME
    function configureBkgColor(e) {
        var target = e.relatedTarget;
        var item = e.attrs;
        if (item.TBNAME === 'employee') {
            $(target).addClass('chip_blue');
            $(target).children().get(1).style.color = 'white';
            $(target).children().get(1).style.opacity = 1;
        } else if (item.TBNAME === 'empdata') {
            $(target).addClass('chip_maroon');
            $(target).children().get(1).style.color = 'white';
            $(target).children().get(1).style.opacity = 1;
        } else {
            $(target).addClass('chip_green');
            $(target).children().get(1).style.color = 'white';
            $(target).children().get(1).style.opacity = 1;
        }
    }



    $('#typeahead')


        .on('tokenfield:createtoken', function (e) {})


        .on('tokenfield:createdtoken', function (event) {
            //change the chip color based on its type
            configureBkgColor(event);
        })

        .on('tokenfield:edittoken', function (e) {})
        .on('tokenfield:removetoken', function (event) {})
        .on('tokenfield:removedtoken', function (event) {
            //document.getElementById("panel6").innerHTML = " ";
            var target = event.relatedTarget;
            var tag = event.attrs;
            //get all tokens 
            var tokens = $('#typeahead').tokenfield('getTokens');
            //build an object with modified chips
            var resultObj = _buildNewString(tokens);
            //get strings of all chips entered as array
            var enteredStringArr = resultObj.string_arr;
            //get keywords position array
            var keywordPosArr = resultObj.keyword_arr;

            //get the index of removed chip
            var index = enteredStringArr.indexOf(tag.value);
            //if chip found
            if (index > -1) {
                //delete it from the array
                enteredStringArr.splice(index, 1);
                //if keyword got removed gets it's index
                var keywordIndex = keywordPosArr.indexOf(index);
                //if it exists remove it from array
                if (keywordIndex > -1) {
                    keywordPosArr.splice(keywordIndex, 1);
                }
            }
            //build an object with modified chips
            _buildNewString(enteredStringArr);
        });
});


function _buildNewString(tokens) {
    var actionVarArr = [];
    var keywordArr = [];
    var resultObj = {};
    var cc = 0;
    //if tokens exists
    if (tokens) {
        if (tokens.length > 0) {
            for (var bb = 0; bb < tokens.length; bb++) {
                //if token belongs to employee table_name push it to actionVarArr
                //actionVarArr holds the strings of all chips entered till now
                if (tokens[bb].TBNAME === 'employee') {
                    actionVarArr[bb] = tokens[bb].value;
                } else if (tokens[bb].TBNAME === 'empdata') {
                    return;
                } else {
                    //if token is a keyword, get the index and push it to keywordArr
                    //keywordArr holds the positions of all keywords
                    actionVarArr[bb] = tokens[bb].value;
                    keywordArr[cc] = bb;
                    cc++;
                }
            }
        }
    }
    resultObj = {
        string_arr: actionVarArr,
        keyword_arr: keywordArr
    };
    return resultObj;
}

function buildKeywordStrings(enteredVal, keywrdPosArr, tokens) {
    var result_keywrd_Arr = [];
    var result_str = '';
    var resultObj = {};
    if (keywrdPosArr.length === 0) {
        return;
    }
    //if no. of keywords are one in entered query, then do this
    if (keywrdPosArr.length === 1) {
        //if the keyword is at last position
        if (keywrdPosArr[0] === (tokens.length - 1)) {
            //push the keyword value to result_str
            result_str = tokens[tokens.length - 1].value;
            //make that object isKeyStr as true
            //isKeyStr --  property to recognize whether an object is a keyword string or normal action variable
            //we're appending isKeyStr property to those properties which are keyword strings
            tokens[tokens.indexOf(tokens[tokens.length - 1])].isKeyStr = true;
        } else {
            //if the keyword is not at last position
            for (var i = keywrdPosArr[0]; i < tokens.length - 1; i++) {
                if (tokens[keywrdPosArr[0]].value === 'COUNT OF') {
                    //this is a special check for "COUNT OF", if "COUNT OF" is entered, while sending it to server make it CNT.
                    result_str += ' ' + 'CNT.' + ' ' + enteredVal[i + 1];
                } else {
                    result_str += ' ' + tokens[keywrdPosArr[0]].value + ' ' + enteredVal[i + 1];
                }
                //add isKeyStr property to each keyword_str
                tokens[keywrdPosArr[0]].isKeyStr = true;
                tokens[enteredVal.indexOf(enteredVal[i + 1])].isKeyStr = true;
            }
        }

        result_keywrd_Arr.push(result_str);
    }
     //if no. of keywords are more than one in entered query, then do this 
    else {
        //loop through the keywrdPosArr length no.of times
        //if number of keywords in query are three, this loop will executes thrice
        for (var k = 0; k < keywrdPosArr.length; k++) {
            //query string to be formed
            result_str = '';
            //get the first keyword position, assign to from variable
            var from = keywrdPosArr[k];
            //get the second keyword position
            //if the second keyword is at last position, the get the length of tokens and assign to "to" variable
            var to = keywrdPosArr[k + 1] ? keywrdPosArr[k + 1] : (tokens.length);
            //if the keyword is at last position, then just push the string into result_arr and make its isKeyStr property as true
            if (from === (to - 1)) {
                result_str = tokens[from].value;
                tokens[tokens.indexOf(tokens[from])].isKeyStr = true;
            } else {
                //if the keyword is not at last position, then loop through the array and push the string into result_arr and make its isKeyStr property as true
                for (var j = from; j < to - 1; j++) {
                    if (tokens[from].value === 'COUNT OF') {
                        result_str += ' ' + 'CNT.' + ' ' + enteredVal[j + 1];
                    } else {
                        result_str += ' ' + tokens[from].value + ' ' + enteredVal[j + 1];
                    }
                    tokens[tokens.indexOf(tokens[from])].isKeyStr = true;
                    tokens[tokens.indexOf(tokens[j + 1])].isKeyStr = true;
                }
            }
            result_keywrd_Arr.push(result_str);
        }
    }
    resultObj = {
        token: tokens,
        arr: result_keywrd_Arr
    };
    return resultObj;
}

//to build actionVariable string
function buildActionVar(tokenObj) {
    var filteredArr = [];
    if (tokenObj) {
        //loop through all tokens and push only items which don't have isKeyStr
        //items which have isKeyStr will be considered as KeywordStrings
        for (var x = 0; x < tokenObj.length; x++) {
            if (!tokenObj[x].isKeyStr) {
                filteredArr.push(tokenObj[x]);
            } else {
                //do nothing
            }
        }
    }
    return filteredArr;
}


//Begin function button1_onclick
function button1_onclick(event) {

    var _actionVar = '';
    var _byStr = '';
    var _action = 'PRINT';
    var _whereStr = '';
    var keyword = [];

    var tokens = $('#typeahead').tokenfield('getTokens');
    //build the query
    var resultObj = _buildNewString(tokens);
    //get the array of strings entered
    var enteredStringArr = resultObj.string_arr;
    //get the array of positions of keywords
    var keywordPosArr = resultObj.keyword_arr;

    var result_obj = buildKeywordStrings(enteredStringArr, keywordPosArr, tokens);
    if (result_obj) {
        var keywordBuilderArr = result_obj.arr;
        var modifiedTokens = result_obj.token;
        var actionVarBuilderArr = buildActionVar(modifiedTokens);
        //form actionVariable
        for (var ml = 0; ml < actionVarBuilderArr.length; ml++) {
            _actionVar = _actionVar + ' ' + actionVarBuilderArr[ml].value;
        }

        for (var l = 0; l < keywordBuilderArr.length; l++) {
            if (keywordBuilderArr[l].startsWith(" BY")) {
                _byStr = keywordBuilderArr[l];
            } else if (keywordBuilderArr[l].startsWith(" WHERE")) {
                _whereStr = keywordBuilderArr[l];
            } else if (keywordBuilderArr[l].startsWith("IS EQUAL") &&
                (enteredStringArr.indexOf("IS EQUAL") === (enteredStringArr.indexOf("WHERE") + 2))) {
                _whereStr += ' EQ ';
            } else if (keywordBuilderArr[l].startsWith("IS LESS THAN") &&
                (enteredStringArr.indexOf("IS LESS THAN") === (enteredStringArr.indexOf("WHERE") + 2))) {
                _whereStr += ' LT ';
            } else if (keywordBuilderArr[l].startsWith("IS GREATER THAN") &&
                (enteredStringArr.indexOf("IS GREATER THAN") === (enteredStringArr.indexOf("WHERE") + 2))) {
                _whereStr += ' GT ';
            } else if (keywordBuilderArr[l].startsWith("IS NOT EQUAL TO") &&
                (enteredStringArr.indexOf("IS NOT EQUAL TO") === (enteredStringArr.indexOf("WHERE") + 2))) {
                _whereStr += ' NQ ';
            } else if (keywordBuilderArr[l].startsWith(" CNT.")) {
                _action = "SUM";
                _actionVar = keywordBuilderArr[l];
            } else {
                if ((enteredStringArr.indexOf(keywordBuilderArr[l]) === (enteredStringArr.indexOf("WHERE") + 3))) {
                    _whereStr += keywordBuilderArr[l];
                }
            }
        }
    }

    var dynamicurl = "&FEXTYPE=TABLE&DATABASE=EMPLOYEE&ACTION=" + _action + "&ACTIONVARIABLE=" + _actionVar + "&BYSTRING=" + _byStr + "&WHERESTRING=" + _whereStr;

    ajaxcall(dynamicurl);
}
//End function button1_onclick


var _url = "/ibi_apps/WFServlet?IBIF_ex=";
var _ibiapp = "dynamicfex/";
var _procedure = "procedure_submit";


function ajaxcall(dynamicurl) {
    alert(dynamicurl);
    $.ajax({
        type: "GET",
        url: _url + _ibiapp + _procedure + "&rnd=" + Math.random() + dynamicurl,
        dataType: "html",
        success: function (_data) {
            $("#panel6").empty();
            $("#panel6").append(_data);
        }
    });
}


//Begin function combobox1_onchange
function combobox1_onchange(event) {
    var eventObject = event ? event : window.event;
    var ctrl = eventObject.target ? eventObject.target : eventObject.srcElement;
    // TODO: Add your event handler code here




}
//End function combobox1_onchange