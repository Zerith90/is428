$(document).ready(function() {
    initLogout();
    $('#search').click(function() {
        initSearch();
    })

    $("#query").on("keyup", function(event) {
        if (event.keyCode == 13) {
            initSearch();
        }
    })
})
var red = "#FF4D6D";
var blue = "#1998FF";
var grey = "rgba(150, 150, 150, 0.75)";
var networkClicked = false;
var tweet = [], timeSeries = [];
var nodesData = null;
var edgesData = null;
var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
        punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
        wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
        discard = /^(https?:)/,
        numbers = /^[0-9]+$/,
        htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
        userTag = /^@?([a-f0-9]{6}|[a-f0-9]{3})$/
matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;
function initLogout() {
    $('#logout').click(function() {
        window.location.href = "welcome"
    })
}
function initSearch() {
    $query = $("#query").val();
    $(".dots_wrapper").show();
    $('#searchTerm').text($query)
    $.get("search", {query: $query}, function(success) {
        console.log(success)
        if (success.length == 0) {
            sweetAlert("Oops...", "You have exceeded your rate limit!", "error");


            $(".dots_wrapper").hide();

            return false;
        }

        tweet = success
        initTimeSeries(tweet);
        initWordGraph(tweet);
        initSentiments(tweet);
        initPopularity(tweet);
        resetZoom()
        $(".dots_wrapper").hide();
        $(".init").velocity({opacity: 1});
    }, 'json');
}

function initSentiments(tweets) {
    var data = [];
    var sentiments = []
    d3.csv("sentiments/sentiment.csv", function(sents) {

        $.each(sents, function(k, v) {
            sentiments[v.word] = v.score;
        })

        $.each(tweets, function(k, v) {
            var score = 0
            v.text.split(false ? /\n/g : wordSeparators).forEach(function(word) {
                word = $.trim(word.toLowerCase())
                if (discard.test(word) || word.toLowerCase() == $("#query").val() || word == "RT" || word == "")
                    return;
                word = word.replace(punctuation, "");
                if (stopWords.test(word.toLowerCase()) || numbers.test(word.toLowerCase()))
                    return;
                if (isNaN(sentiments[word])) {
                    return
                }
                if (sentiments[word] != undefined) {
                    score += Number(sentiments[word])
                }
            })

            data.push([v.id, v.text, Number(moment(v.created_at).zone("+8:00")), score])

        })

        data.sort(function(a, b) {
            return a[2] - b[2]
        })
        var temp = []
        $.each(data, function(k, v) {
            /*    if (v[3] < 0) {
             temp.push({x: v[2], y: v[3], color: "red"})
             } else {
             temp.push({x: v[2], y: v[3], color: "green"})
             }*/
            temp.push({y: v[3], x: v[2]})
        })


        $('#sentiments').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },
            xAxis: {
                type: 'datetime',
                ordinal: false,
                //tickInterval: 3600 * 1000 * 12,
                opposite: true,
                lineWidth: 0,
                minorGridLineWidth: 0,
                lineColor: 'transparent',
                minorTickLength: 0,
                tickLength: 0,
                events: {
                    afterSetExtremes: function(event) {
                        var min = event.min
                        var max = event.max
                        var detailData = [];
                        if (min == 'undefined' && max == 'undefined') {
                            initWordGraph(tweet)
                        } else {
                            $.each(tweet, function() {
                                if (Number(moment(this.created_at).zone("+8:00")) > min && Number(moment(this.created_at).zone("+8:00")) < max) {
                                    detailData.push(this);
                                }
                            });
                            if (detailData.length > 0) {
                                initWordGraph(detailData)
                            } else {

                                return false
                            }
                        }



                    }
                }
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                    name: 'Sentiments',
                    data: temp
                }]
        });
    });


}
function initTweets(tweets, type, word) {

    var content = '<div class="col-md-6" id="one"></div><div class="col-md-6" id="two"></div>'
    $("#tweets_wrapper").empty().append(content);
    var count = 0;
    console.log(word)
    $.each(tweets, function(k, v) {

        var finalText = "";
        var hasWord = 0;
        if (type == 2 && v.user.screen_name.toLowerCase() != word.substring(1)) {

            return
        }


        var text = v.text.split(" ");
        $.each(text, function(k, v) {
            var t = v;



            if (v.charAt(0) == "#") {

                if (word != undefined && v.toLowerCase() == word.toLowerCase()) {

                    hasWord += 1
                    v = '<span class="yellow">' + t + '</span>'
                }
                v = '<a target="_blank" href="https://twitter.com/hashtag/' + t.substring(1) + '?src=hash">' + v + '</a>'

            } else if (v.charAt(0) == "@") {

                if (word != undefined && v.substring(1).toLowerCase() == word.toLowerCase()) {
                    hasWord += 1
                    v = '<span class="yellow">' + t + '</span>'
                }
                v = '<a target="_blank"  href="https://twitter.com/' + t.substring(1) + '">' + v + '</a>'

            } else if (discard.test(v)) {
                v = '<a target="_blank"  href="' + t + '">' + t + '</a>'

            }
            if (word) {

                if (punctuation.test(v.charAt(0)) && v.charAt(0) != "<") {
                    v = v.substring(1)
                }
                if (punctuation.test(v.charAt(v.length - 1)) && v.charAt(0) != "<") {
                    v = v.substring(0, v.length - 1)
                }
                if ($.trim(v.toLowerCase()) == $.trim(word.toLowerCase())) {
                    v = v.replace(punctuation, "");
                    hasWord += 1

                    v = '<span class="yellow">' + t + '</span>'
                }
            }

            finalText += v + " "
        })

        if (type == 1) {

            if (hasWord == 0) {

                return
            }
        }
        var q = "";

        q += '<blockquote class="twitter-tweet"';
        q += 'data-link-color="#55acee" lang="es">';
        q += '<div class="tweet-header">';
        q += '<img class="profile_img" src="' + v.user.profile_image_url + '"/>' + v.user.name + ' (@' + v.user.screen_name + ')';
        q += '</div>';
        q += '<p lang="en">' + finalText + '</p>';
        q += '<br>';
        q += '<span class="livestamp" data-livestamp="' + Number(moment(v.created_at).zone("+8:00")) / 1000 + '"></span>';
        q += '</blockquote>';
        if (count % 2 == 0) {
            $(q).appendTo($("#one"))
        } else {
            $(q).appendTo($("#two"))
        }
        count += 1
    });
    $(".twitter-tweet").velocity("transition.slideUpBigIn", {stagger: 10})


}
function initWordGraph(tweets) {
    initTweets(tweets)
    network = null;
    var stats = {};
    var defaultWordMin = 1;
    var wordArray = [];
    var wordLinks = [], nodes = [], edges = [], nodeTemp = [], time = [], userCounter = []
    var e = new Date().getTime()
    $.each(tweets, function(k, v) {
        var tempLink = [], wordSeq = []
        time.push(Number(moment(v.created_at).zone("+8:00")));
        userCounter[v.user.screen_name.toLowerCase()] = (userCounter[v.user.screen_name.toLowerCase()] || 0) + 1
        v.text.split(false ? /\n/g : wordSeparators).forEach(function(word) {
            word = $.trim(word.toLowerCase())
            if (discard.test(word) || word.toLowerCase() == $("#query").val() || word == "RT" || word == "")
                return;
            word = word.replace(punctuation, "");
            if (stopWords.test(word.toLowerCase()) || numbers.test(word.toLowerCase()))
                return;
            if (word.length != 0) {
                tempLink.push(word)
                wordArray[word] = (Number(wordArray[word]) || 0) + 1
            }
            if (nodeTemp[v.user.screen_name.toLowerCase()] != undefined) {
                nodeTemp[v.user.screen_name.toLowerCase()].count = Number(nodeTemp[v.user.screen_name.toLowerCase()].count) + 1
            } else {
                var mi = v.user.profile_image_url.lastIndexOf("_");
                var t = v.user.profile_image_url.lastIndexOf(".");
                var ext = v.user.profile_image_url.substring(t, v.user.profile_image_url.length)
                var edit = v.user.profile_image_url.substring(0, mi) + "_bigger" + ext
                nodeTemp[v.user.screen_name.toLowerCase()] = {count: 1, image: edit, label: v.user.name, user: v.user}

            }
            if (nodeTemp[v.user.screen_name.toLowerCase()].words != undefined) {
                nodeTemp[v.user.screen_name.toLowerCase()].words[word] = (Number(nodeTemp[v.user.screen_name.toLowerCase()].words[word]) || 0) + 1
            } else {
                nodeTemp[v.user.screen_name.toLowerCase()].words = []
                nodeTemp[v.user.screen_name.toLowerCase()].words[word] = (Number(nodeTemp[v.user.screen_name.toLowerCase()].words[word]) || 0) + 1
            }
            wordSeq.push(word)
        });
        wordLinks.push(wordSeq)
        if (v.in_reply_to_screen_name != null) {
            edges.push({from: "user" + v.user.screen_name, to: "user" + v.in_reply_to_screen_name, type: "user", style: "arrow", color: red})
        }
    })

    var wordCountHighest = 0;

    for (var word in wordArray) {
        if (wordArray[word] > wordCountHighest) {
            wordCountHighest = wordArray[word]
        }
        if (word.length > 3) {
            if (word.charAt(0) == '@') {
//green -- replaced with user image]
                var userExist = false
                for (var node in nodeTemp) {

                    if (node == word.substring(1)) {
                        userExist = true
                        // return false
                    }
                }

                if (!userExist) {
                    /**
                     * Create user mentioned in the convo but did not participate in the convo
                     */

                    stats.Tags = (stats.Tags || 0) + 1;
                    nodes.push({id: word.toLowerCase(), label: word, shape: "image", image: "images/user.png", color: "#16DB0F", group: "tag", fontSize: 42, radius: 20})
                }
            } else {
                /**
                 * Create word node
                 */

                nodes.push({id: word.toLowerCase(), label: word, defaultColor: blue, color: blue, fontSize: wordArray[word] * 24, size: wordArray[word], group: "word"})

            }
        }
    }

    for (var user in nodeTemp) {

        var ud = nodeTemp[user].user
        stats.Users = (stats.Users || 0) + 1

        nodes.push({id: "user" + user, group: "users", label: nodeTemp[user].label, shape: "image", image: nodeTemp[user].image,
            title: "", widthMin: 10, widthMax: 10, radius: 20, group:"user"})
        for (var word in nodeTemp[user].words) {

            if (nodeTemp[word.substring(1)] != undefined) {
                /**
                 * if user is in the convo as well
                 */
                edges.push({from: "user" + user, to: "user" + word.substring(1), width: nodeTemp[user].words[word], type: "user", style: "arrow", color: red})
            } else {
                if (word.charAt(0) != "@") {
                    /**
                     * Those word is a mentioned word
                     */
                    edges.push({from: "user" + user, to: word.toLowerCase(), width: nodeTemp[user].words[word], color: blue, type: "word"})
                } else {
                    /**
                     * This word points to a user but the user is not in the convo
                     */
                    edges.push({from: "user" + user, to: word.toLowerCase(), width: nodeTemp[user].words[word], type: "user", style: "arrow", color: red})
                }
            }
        }
    }
    /**
     * 
     * Add stats to left corner
     */
    time.sort(function(a, b) {
        return b - a
    })
    var tempWord = [], tempUsers = []
    for (var word in wordArray) {
        if (word.length > 3 && word.charAt(0) != ("@" || "#")) {
            tempWord.push([word, wordArray[word]])
        }
    }
    for (var user in userCounter) {
        tempUsers.push([user, userCounter[user]])
    }
    tempWord.sort(function(a, b) {
        return b[1] - a[1]
    })
    tempUsers.sort(function(a, b) {
        return b[1] - a[1]
    })
    var t = '<li class="list-group-item font12 first"><i class="fa fa-globe"></i> Overview</li>'

    t += '<li class="list-group-item"><span class="badge">' + tweets.length + '</span>Total Tweets:</li>'

    $('#overview').empty().append(t)
    $.each(stats, function(k, v) {
        var content = ""
        content += '<li class="list-group-item">'
        content += '<span class="badge">' + v + '</span>'
        content += k
        content += '</li><div class="side_navdivider"></div>'
        $('#overview').append(content)
    })
    var content = ""
    content += '<li class="list-group-item">'

    content += 'Batch first: '
    content += '<span data-livestamp="' + (Number(moment(time[time.length - 1]).zone("+8:00")) / 1000) + '"></span>'
    content += '</li>'
    content += '<li class="list-group-item" >'

    content += 'Last Tweeted: '
    content += '<span data-livestamp="' + (Number(moment(time[0]).zone("+8:00")) / 1000) + '"></span>'
    content += '</li>'
    $('#overview').append(content);
    var top5Words = "";
    top5Words += '<li class="list-group-item font12 first"><i class="fa fa-wordpress"></i>  Words Mentioned</li> <div class="scrollable" id="scrollW"></div>';
    $('#t5U').empty().append(top5Words);
    for (var i = 0; i < tempWord.length; i++) {
        var content = ""
        content += '<li class="list-group-item word">'
        content += '<span class="badge">' + tempWord[i][1] + '</span>'
        content += '<span class="statId">' + tempWord[i][0] + '</span>'
        content += '</li><div class="side_navdivider"></div>'
        $('#scrollW').append(content)
    }

    var top5Users = "";
    top5Users += '<li class="list-group-item font12 first"><i class="fa fa-users"></i>  Users in the conversation</li><div class="scrollable" id="scrollU"></div>';
    $('#t5W').empty().append(top5Users);
    for (var i = 0; i < tempUsers.length; i++) {
        var content = ""
        content += '<li class="list-group-item user">'
        content += '<span class="badge">' + tempUsers[i][1] + '</span>'
        content += '<span class="statId statIdUser">@' + tempUsers[i][0] + '</span>'
        content += '</li><div class="side_navdivider"></div>'
        $('#scrollU').append(content)
    }
    initStatsClick();
    nodesData = null;
    edgesData = null;
    nodesData = new vis.DataSet();
    edgesData = new vis.DataSet();


    var container = document.getElementById('graph');

    nodesData.add(nodes)
    edgesData.add(edges)
    var data = {
        nodes: nodesData,
        edges: edgesData,
    };
    var options = {
        nodes: {
            shape: 'dot',
            fontColor: "#222",
        },
        edges: {
            width: 0.15,
            color: '#1998FF'

        },
        tooltip: {
            delay: 200,
            fontSize: 12,
            color: {
                background: "#fff"
            }
        },
        hideEdgesOnDrag: true,
        //  hideNodesOnDrag:true,
        smoothCurves: false,
        stabilize: true,
        physics: {barnesHut: {gravitationalConstant: -3500, centralGravity: 0.001, springConstant: 0.01, springLength: 1250, damping: 0.5}},
    };
    var d = new Date().getTime();

    network = new vis.Network(container, data, options);
    initFilter();
    $("#slider-vertical").slider({
        orientation: "vertical",
        range: "min",
        min: 1,
        max: wordCountHighest,
        value: 1,
        slide: function(event, ui) {
            $("#amount").val(ui.value);
        },
        stop: function(event, ui) {
            var allNodes = nodes;
            var allEdges = edges
            var updateN = [];
            var includeNodes = [];
            var userN = []
            for (var node in allNodes) {

                if (allNodes[node].size >= ui.value) {
                    updateN.push(allNodes[node])
                    includeNodes[allNodes[node].id] = 1
                }

            }

            for (var edge in  allEdges) {
                if (includeNodes[allEdges[edge].to] == 1) {
                    for (var node in allNodes) {
                        if (allNodes[node].id == allEdges[edge].from) {
                            updateN.push(allNodes[node])
                        }
                    }

                }
            }


            //  nodesData.update(update);

            nodesData.clear()
            nodesData.update(updateN);

        }
    });
    $("#amount").val($("#slider-vertical").slider("value"));
    network.on("click", function(props) {

        var allNodes = nodesData.get({returnType: "Object"});
        var allEdges = edgesData.get();
        var nodeClicked = props.nodes[0];
        var appendedNodes = [], updateArray = [];
        for (var nodeId in allNodes) {
            if (allNodes[nodeId].group === "word") {
                allNodes[nodeId].color = blue;
                allNodes[nodeId].fontSize = allNodes[nodeId].size * 24

            } else {
                allNodes[nodeId].color = "#16DB0F"
            }
        }
        for (var edges in allEdges) {
            if (allEdges[edges].type != "reply") {
                allEdges[edges].color = blue
            }
        }

        getAppendedNodes(nodeClicked);
        selectTweets(nodeClicked);
        if (props.nodes.length == 0) {
            networkClicked = false
            $("#uc,#wc").prop('checked', true);
            $("#wc").parent(".switch").siblings(".switchLabel").removeClass("grey").addClass("blue")
            $("#uc").parent(".switch").siblings(".switchLabel").removeClass("grey").addClass("red")
            for (var nodeId in allNodes) {
                if (allNodes[nodeId].group == "word") {
                    allNodes[nodeId].color = blue
                    allNodes[nodeId].fontSize = allNodes[nodeId].size * 24
                } else {
                    allNodes[nodeId].color = "#16DB0F"
                }
                allNodes[nodeId].clicked = false;
            }
            for (var edges in allEdges) {
                allEdges[edges].clicked = false
                allEdges[edges].color = blue
                if (allEdges[edges].style == "arrow") {
                    allEdges[edges].color = "red"
                }
            }
        } else {
            networkClicked = true
            for (var nodeId in allNodes) {
                if (appendedNodes[allNodes[nodeId].id] != 1) {

                    allNodes[nodeId].color = grey
                    allNodes[nodeId].fontSize = 0
                } else {
                    allNodes[nodeId].clicked = true;
                }
            }
        }
        for (nodeId in allNodes) {
            if (allNodes.hasOwnProperty(nodeId)) {
                updateArray.push(allNodes[nodeId]);
            }
        }

        edgesData.update(allEdges)
        nodesData.update(updateArray);

        function getAppendedNodes(id) {
            /**
             * id exists when user clicks on a node
             * Does not exist when user clicks on blank space or *cancels*
             */
            if (id) {
                /**
                 * Search for tags and users
                 */
                if (allNodes[id].group != "word") {
                    for (var edges in allEdges) {
                        if (allEdges[edges].from == id || allEdges[edges].to == id) {
                            /**
                             * Find nodes that are to and from this node of interest
                             */
                            appendedNodes[allEdges[edges].to] = 1;
                            appendedNodes[allEdges[edges].from] = 1
                            if (allEdges[edges].style == "arrow") {
                                allEdges[edges].color = red

                            }
                            allEdges[edges].clicked = true
                        } else {
                            /**
                             * Nodes that are not connected to the NOI
                             */
                            allEdges[edges].color = grey

                        }
                    }
                } else {

                    appendedNodes[id] = 1
                    for (var edges in allEdges) {
                        if (allEdges[edges].to != id) {

                            allEdges[edges].color = grey

                        }
                    }
                }
            }
        }
    });


}
function resetZoom() {
    $('#reset').click(function() {

        /*
         var allNodes = nodesData.get();
         var allEdges = edgesData.get();
         
         for (var edge in allEdges) {
         if (allEdges[edge].style == "arrow") {
         allEdges[edge].color = red
         } else {
         allEdges[edge].color = blue
         }
         }
         for (var node in allNodes) {
         allNodes[node].color = blue
         allNodes[node].fontSize = allNodes[node].size * 24
         }
         edgesData.update(allEdges)
         nodesData.update(allNodes);*/
        network.zoomExtent({duration: 500, easingFunction: "easeInOutQuad"})
    })
}
function focus(ob) {
    networkClicked = true
    var allNodes = nodesData.get();
    var allEdges = edgesData.get();

    /**
     * user
     */
    var userid = ob;
    var connected = []
    console.log(userid)
    connected[userid] = 1
    for (var edge in allEdges) {
        if (allEdges[edge].to == userid || allEdges[edge].from == userid) {
            connected[allEdges[edge].to] = 1
            connected[allEdges[edge].from] = 1

            allEdges[edge].clicked = true
            if (allEdges[edge].style == "arrow") {
                allEdges[edge].color = red
            } else {
                allEdges[edge].color = blue
            }
            allEdges[edge].clicked = true;
        } else {
            allEdges[edge].color = grey
        }
    }
    for (var node in allNodes) {
        if (connected[allNodes[node].id] != 1) {
            allNodes[node].color = grey;
            if (allNodes[node].group == "word") {
                allNodes[node].fontSize = 0;
            }
        } else {
            allNodes[node].color = blue;
            allNodes[node].clicked = true;
            if (allNodes[node].group == "word") {
                allNodes[node].fontSize = allNodes[node].size * 24
            }
        }
    }
    edgesData.update(allEdges)
    nodesData.update(allNodes);

}
function initFilter() {
    $('#wc').change(function() {
        if ($(this).is(":checked")) {
            $(this).parent(".switch").siblings(".switchLabel").removeClass("grey").addClass("blue")
            var allNodes = nodesData.get();
            var allEdges = edgesData.get();
            for (var edge in allEdges) {
                if (allEdges[edge].type == "word") {
                    if (networkClicked) {
                        if (allEdges[edge].clicked) {
                            allEdges[edge].color = blue;
                        } else {
                            allEdges[edge].color = grey;
                        }
                    } else {
                        allEdges[edge].color = blue;
                    }
                }
            }
            for (var node in allNodes) {
                if (allNodes[node].group == "word") {
                    if (networkClicked) {
                        if (allNodes[node].clicked) {
                            allNodes[node].color = blue;
                            allNodes[node].fontSize = allNodes[node].size * 24;
                        } else {
                            allNodes[node].color = grey;
                            allNodes[node].fontSize = 0;
                        }
                    } else {
                        allNodes[node].color = blue;
                        allNodes[node].fontSize = allNodes[node].size * 24;
                    }
                }
            }
            edgesData.update(allEdges);
            nodesData.update(allNodes);
        } else {
            $(this).parent(".switch").siblings(".switchLabel").removeClass("blue").addClass("grey")
            var allNodes = nodesData.get();
            var allEdges = edgesData.get();
            for (var edge in allEdges) {
                if (allEdges[edge].type === "word") {
                    allEdges[edge].color = grey;
                }
            }
            var temp = []
            for (var node in allNodes) {
                if (allNodes[node].group === "word") {

                    allNodes[node].color = grey;
                    allNodes[node].fontSize = 0;
                }
            }
            edgesData.update(allEdges);
            nodesData.update(allNodes);
            console.log(nodesData)
        }

    });
    $('#uc').change(function() {

        if ($(this).is(":checked")) {
            $(this).parent(".switch").siblings(".switchLabel").removeClass("grey").addClass("red");
            var allEdges = edgesData.get();
            for (var edge in allEdges) {
                if (allEdges[edge].type == "user") {
                    if (networkClicked) {
                        if (allEdges[edge].clicked) {
                            allEdges[edge].color = red;
                        } else {
                            allEdges[edge].color = grey;
                        }
                    } else {
                        allEdges[edge].color = red;
                    }
                }
            }
            edgesData.update(allEdges)
        } else {
            $(this).parent(".switch").siblings(".switchLabel").removeClass("red").addClass("grey")
            var allEdges = edgesData.get();
            for (var edge in allEdges) {
                if (allEdges[edge].type == "user") {
                    allEdges[edge].color = grey
                }
            }
            edgesData.update(allEdges)
        }

    });
}
function initStatsClick() {
    var ops = {
        scale: 0.5,
        offset: {x: 0, y: 0},
        animation: {
            duration: 500
        }
    }
    $('.stats li.list-group-item').click(function() {
        var word = $(this).find('.statId').text().toLowerCase()

        if ($(this).hasClass('word')) {
            focus(word)
            initTweets(tweet, 1, word)
            network.focusOnNode(word, ops)
        } else {
            initTweets(tweet, 2, word)
            focus("user" + word.substring(1))
            network.focusOnNode("user" + word.substring(1), ops)

        }
    })
}
function selectTweets(tweets) {
    var selected = []
    if (tweets) {
        if (tweets.substring(0, 4) == "user") {
            $(".twitter-tweet").velocity("transition.slideUpBigOut", {stagger: 10})
            $.each(tweet, function(k, v) {

                if (tweets.substring(4).toLowerCase() == v.user.screen_name.toLowerCase()) {
                    selected.push(v)
                }
            })
            initTweets(selected)

        } else {

            initTweets(tweet, 1, tweets)
        }
    } else {
        initTweets(tweet)
    }
}
function initTimeSeries(tweet) {
    timeSeries.length = 0;
    $.each(tweet, function(k, v) {

        $time = Number(moment(v.created_at).add(8, 'h'))


        timeSeries.push([Number($time), 1])

    })
    timeSeries.sort(function(a, b) {
        return a[0] - b[0]
    })


    $('#time').highcharts("StockChart", {
        chart: {
            type: 'column',
            zoomType: 'x',
            margin: 0,
            spacing: [0, 0, 0, 0],
            backgroundColor: 'rgba(0,0,0,0.85)'
        },
        credits: false,
        exporting: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false,
        },
        xAxis: {
            type: 'datetime',
            ordinal: false,
            //tickInterval: 3600 * 1000 * 12,
            opposite: true,
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            minorTickLength: 0,
            tickLength: 0,
            events: {
                afterSetExtremes: function(event) {
                    var min = event.min
                    var max = event.max
                    var detailData = [];
                    if (min == 'undefined' && max == 'undefined') {
                        initWordGraph(tweet)
                    } else {
                        $.each(tweet, function() {
                            if (Number(moment(this.created_at).add(8, 'h')) > min && Number(moment(this.created_at).add(8, 'h')) < max) {
                                detailData.push(this);
                            }
                        });
                        if (detailData.length > 0) {
                            initWordGraph(detailData)
                        } else {

                            return false
                        }
                    }



                }
            },
            labels: {
                enabled: true,
                overflow: "justify",
                style: {
                    color: '#fff',
                    fontWeight: 'bold'
                },
                y: 30
            },
            gridLineWidth: 0,
            title: {
                text: null
            },
        },
        yAxis: {
            title: {
                text: null
            },
            min: 0,
        },
        title: {
            text: null
        },
        series: [{
                name: 'No. Of tweets',
                data: timeSeries,
                cursor: 'pointer',
                pointInterval: 3600 * 1000 * 6, // one day,
                marker: {
                    enabled: true,
                    radius: 3
                },
                shadow: true,
                tooltip: {
                    valueDecimals: 0
                },
                dataGrouping: {
                    approximation: "sum",
                    forced: true,
                    smoothed: true,
                }
            }]
    });
}


var stabalizingOption = {
    nodes: {
        shape: 'dot',
        fontColor: "#222",
    },
    edges: {
        width: 0.15,
        inheritColor: "from"
    },
    tooltip: {
        delay: 200,
        fontSize: 12,
        color: {
            background: "#fff"
        }
    },
    smoothCurves: {dynamic: true, type: "continuous", roundness: 0.1},
    stabilize: true,
    physics: {barnesHut: {gravitationalConstant: -600, centralGravity: 0.06, springConstant: 0001, springLength: 150, damping: 0.5}},
};
function cleanDuration(seconds)
{
    console.log(seconds)
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400);
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    return numyears + " years " + numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
}

function initPopularity(tweets) {

    var people = [];
    var exist = false;


    $.each(tweets, function(k, v) {
        var currentUserID = v.user.id;
        var currentUserNumber = 0;

        for (var i = 0; i < people.length; i++) {
            if (people[i].id == currentUserID) {
                exist = true;
                currentUserNumber = i;
            }
        }

        if (exist) {
            //change retweet and favourites count
            var wordPresenceNewCount = Number(people[currentUserNumber].data[0][0]) + 1;
            var popularity = Number(people[currentUserNumber].data[0][1]) + v.retweet_count + v.favorite_count;
            //add on to wordpresence count
            people[currentUserNumber].data[0][1] = Number(popularity);
            people[currentUserNumber].data[0][0] = Number(wordPresenceNewCount);
        }
        var point = {
            events: {
                click: function() {
                    console.log(this);
                    var i = this.series.name.indexOf("@")
                    var user = this.series.name;
                    var count = 0;
                    var userD = [];
                    var userA = null;

                    $.each(tweet, function(k, v) {

                        if (v.user.screen_name == user.substring(i + 1, user.length)) {
                            var q = ""
                            console.log(v);
                            userA = v.user
                            $.each(v.user, function(key, value) {
                                switch (key) {
                                    case "name":
                                        userD[0] = {k: "Name:", v: value};
                                        break;
                                    case "description":
                                        userD[1] = {k: "Description:", v: value};
                                        break;
                                    case "screen_name":
                                        userD[2] = {k: "Twitter Link:", v: '<a target="_blank" href="https://twitter.com/' + value + '">@' + value + '</a>'};
                                        break;
                                    case "time_zone":
                                        userD[3] = {k: "Origin:", v: value};
                                        break;
                                    case "statuses_count":
                                        userD[4] = {k: 'Status Count:', v: value};
                                        break;
                                    case "followers_count":
                                        userD[5] = {k: 'Followers Count:', v: value};
                                        break;
                                }
                            })
                            $.each(userD, function(k, v) {
                                q += "<tr>"
                                q += "<td>" + v.k
                                q += "</td>"
                                q += "<td>" + v.v
                                q += "</td>"
                                q += "</tr>"
                            })

                            var mc = "";
                            mc += '<div id="userTweets">'
                            mc += '<div class="banner"></div>'
                            mc += '<div class="profileImage"></div>'
                            mc += '<div class="paddingSide10"><table class="table table-hover" id="userTable">'

                            mc += '</table></div>'
                            mc += '</div>'
                            $(".modal-body").empty().append(mc);
                            $("#userTable").empty().append(q);
                            $("#username").text(userA.name);
                            if (userA.profile_banner_url) {
                                $('.banner').empty().append('<img class="banner_url" src="' + userA.profile_banner_url + '"/>')
                            }
                            var mi = userA.profile_image_url.lastIndexOf("_");
                            var t = userA.profile_image_url.lastIndexOf(".");
                            var ext = userA.profile_image_url.substring(t, userA.profile_image_url.length)
                            var edit = userA.profile_image_url.substring(0, mi) + ext
                            $('.profileImage').empty().append('<img class="pImg" src="' + edit + '"/>')
                            if (userA.entities.url && userA.entities.url.urls.length > 0) {
                                var q1 = "<tr>"
                                q1 += "<td>" + "Personal Link:"
                                q1 += "</td>"
                                q1 += "<td>" + '<a target="_blank" + href="' + userA.entities.url.urls[0].expanded_url + '">' + userA.name + '</a>'
                                q1 += "</td>"
                                q1 += "</tr>"
                                $("#userTable").append(q1);
                            }
                            $('#userDetails').modal("show")
                            initTweets(tweet, 2, "@" + userA.screen_name.toLowerCase());

                            return false
                        }
                    })


                },
                mouseOver: function() {
                    var ops = {
                        scale: 1,
                        offset: {x: 0, y: 0},
                        animation: {
                            duration: 500
                        }
                    }
                    var user = this.series.name;
                    var at = user.indexOf("@");
                    var r = user.substring(at + 1, user.length)
                    console.log(user)
                    console.log(r)
                    focus("user" + r.toLowerCase())
                    network.focusOnNode("user" + r.toLowerCase(), ops)
                },
            }
        }
        if (!exist) {
            var userID = v.user.id;
            var username = v.user.name + " @" + v.user.screen_name;
            var z = v.user.followers_count;
            var y = v.retweet_count + v.favorite_count; // popularity use average
            var x = 1;
            var dataset = [[x, y, z]];
            var person = {id: userID, name: username, data: dataset, point: point};
            people.push(person);
        }

        exist = false;

    });


    if (people.length != 0) {
        console.log(people)
        //draw chart
        $('#popularBubble').highcharts({
            chart: {
                type: 'bubble',
                zoomType: 'xy'
            },
            credits: false,
            plotOptions: {
                series: {
                    color: blue,
                    marker: {
                        states: {
                            hover: {
                                lineWidthPlus: 2,
                                lineColor: blue
                            }
                        }
                    }
                },
            },
            label: {
                style: {
                    color: '#222'
                }
            },
            legend: {
                enabled: false
            },
            title: {
                text: 'Users in the conversation',
                style: {
                    color: '#222'
                }
            },
            xAxis: {
                title: {
                    text: 'Number of Tweets'
                },
                tickColor: '#000',
                labels: {
                    style: {
                        color: '#222',
                        font: '11px Trebuchet MS, Verdana, sans-serif'
                    }
                },
            },
            yAxis: {
                title: {
                    text: 'Popularity'
                },
                labels: {
                    style: {
                        color: '#222',
                        font: '11px Trebuchet MS, Verdana, sans-serif'
                    }
                },
                gridLineColor: 'transparent'
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: 'Popularity:{point.y}<br>Number of Tweets: {point.x}<br>Number of Followers:{point.z}'
            },
            series: people
        });
    }
    else {
        var q = "";
        q += '<p lang="en"> No Tweet results.</p>';
        q += '<br>';

        $(q).appendTo($("#popularBubble"));
    }

}
