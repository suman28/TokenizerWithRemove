var emparray = [];
var k = 0,
    count = 0;
var syskey;
var temparray = [];
var isKeywordEntered = false;
$(function() {


    var items = [];
    var keywords = [];
    var parse;
    $.when(
        $.get('/ibi_apps/run.bip?BIP_REQUEST_TYPE=BIP_RUN&BIP_folder=IBFS%253A%252FEDA%252FEDASERVE%252Ftypeahead&BIP_item=procedure_typeahead.fex&windowHandle=196429&IBI_random=2283.980321947214', function(data) {
            parse = JSON.parse(data);
            items = parse.records;


        }),
        $.get('/ibi_apps/run.bip?BIP_REQUEST_TYPE=BIP_RUN&BIP_folder=IBFS%253A%252FEDA%252FEDASERVE%252Ftypeahead&BIP_item=procedure2.fex&windowHandle=271353&IBI_random=2165.7337772878413', function(data) {
            parse = JSON.parse(data);
            keywords = parse.records;
        })

        // //get json from first record
        // $.get('../data/data.json', function(data) {
        //     //store records in items array
        //     items = data.records;
        // }),

        // //get json from second record
        // $.get('../data/data1.json', function(data) {
        //     //store records in keywords array
        //     keywords = data.records;
        // })
    ).then(function() {


        var result = {};
        result = items.concat(keywords);
        configureItems(result);
    })


    function configureItems(items) {


        for (var i in items) {
            if (items.hasOwnProperty(i)) {
                items[i].value = i;
            }
        }


        var config = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('NAME', 'KEYWORD'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: $.map(items, function(item, key) {


                return {
                    value: item.value,
                    NAME: item.NAME || '',
                    TBNAME: item.TBNAME || '',
                    KEYWORD: item.KEYWORD || ''
                };
            })
        });


        config.initialize();


        var elt = $('#typeahead');
        elt.materialtags({
            itemValue: 'value',
            itemText: function(item) {


                if (item) {
                    if (item.NAME) {
                        return item.NAME;
                    } else {
                        return item.KEYWORD;
                    }
                }
            },


            tagClass: function(item) {
                if (item.KEYWORD) {
                    return 'chip chip_green';
                } else if (item.TBNAME === 'employee') {
                    return 'chip chip_blue';
                } else if (item.TBNAME === 'empdata') {
                    return 'chip chip_maroon';
                } else {
                    return 'chip chip_yellow';
                }
            },
            typeaheadjs: {
                name: 'config',


                displayKey: function(item) {
                    if (item) {
                        if (item.NAME) {
                            return item.NAME;
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
                    suggestion: function(data) {


                        if (data.TBNAME) {
                            var _suggestion = "<div>" +
                                data.NAME +
                                " in " +
                                data.TBNAME + "</div>";
                        } else {
                            var _suggestion = "<div>" +
                                data.KEYWORD + "</div>";
                        }


                        return _suggestion;
                    }
                }
            }
        });
    }




    $('#typeahead').on('itemAdded', function(event) {
        var tag = event.item;
        if (!isKeywordEntered) {
            if (tag.TBNAME === 'employee') {
                emparray.push(tag.NAME);
            } else if (tag.KEYWORD) {
                temparray.push(tag.KEYWORD);
                isKeywordEntered = true;
            }
        } else {
            if (tag.TBNAME === 'employee') {
                temparray.push(tag.NAME);
            } else if (tag.KEYWORD) {
                temparray.push(tag.KEYWORD);
            }
        }

    });


    $('input').on('itemRemoved', function(event) {
        document.getElementById("panel6").innerHTML = "";
    });
});


function _onsubmit() {


}





function button1_onclick(event) {
    var eventObject = event ? event : window.event;
    var ctrl = eventObject.target ? eventObject.target : eventObject.srcElement;
    // TODO: Add your event handler code here
    console.log(emparray);
    var _actionVar = '';
    var _byStr = '';

    _actionVar = emparray.join(' ');

    _byStr = temparray.join(' ');
    console.log(_actionVar);
    console.log(_byStr);

    var dynamicurl = "&FEXTYPE=TABLE&DATABASE=EMPLOYEE&ACTION=%20&ACTIONVARIABLE=%20&BYSTRING=" + byfield + "&WHERESTRING=%20";
    //alert(dynamicurl);
    ajaxcall(dynamicurl);


}
var _url = "/ibi_apps/WFServlet?IBIF_ex=";
var _ibiapp = "dynamicfex/";
var _procedure = "procedure_submit";




function ajaxcall(dynamicurl) {
    alert(dynamicurl);
    $.ajax({
        type: "GET",
        url: _url + _ibiapp + _procedure + "&rnd=" + Math.random() + dynamicurl,
        dataType: "html",
        success: function(_data) {
            $("#panel6").empty();
            $("#panel6").append(_data);
        }
    });
}