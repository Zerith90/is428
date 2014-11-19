<%-- 
    Document   : home
    Created on : Oct 20, 2014, 2:15:57 PM
    Author     : Sherman
--%>
<% if (session.getAttribute("twitter") == null) {

        response.sendRedirect("welcome");
    }%>

<%@page contentType="text/html" %>
<!DOCTYPE html>
<html>
    <head>
        <link href="images/favicon.ico" rel="shortcut icon" type="image/x-icon">

        <%@include file="../static/header.jsp"%>
        <meta http-equiv="Content-Type" content="text/html;">
        <title>TSM</title>
    </head>
    <body>
        <nav class="navbar navbar-inverse" role="navigation">
            <div class="container">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#" id="searchTerm"></a>
                </div>


                <div class="navbar-form navbar-right" role="search">
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="Type in a hashtag or user handle to begin" id="query">
                    </div>
                    <button id="search" class="btn btn-special"><i class="glyphicon glyphicon-search"></i></button>
                    <button id="logout" class="btn btn-default"><i class="glyphicon glyphicon glyphicon-log-out"></i> Logout</button>
                </div>

            </div><!-- /.navbar-collapse -->

        </nav>
        <div id="fullpage">
            <div class="section " id="firstPage">
               
                    <div id="time" class="timeSeries"></div>

                    <div class="stats_wrapper">
                        <ul class="list-group stats" id="overview">

                        </ul>
                        <ul class="list-group stats " id="t5U">

                        </ul>
                        <ul class="list-group stats" id="t5W">

                        </ul>
                    </div>

                    <div id="graph_wrapper">
                        <section class="main">
                            <div class="switch_wrapper init">
                                <div class="switch  demo1" id="userConnections">
                                    <input type="checkbox" id="uc" checked >
                                    <label></label>
                                   
                                </div>
                                 <span class="switchLabel red" id="u2u">User to User Interactions Only</span>
                            </div>
                            <div class="switch_wrapper init">
                                <div class="switch demo1" id="wordConnections">
                                    <input type="checkbox" id="wc" checked>
                                    <label></label>
                                      
                                </div>
                                <span class="switchLabel blue" id="u2w">User to Word Interactions Only</span>
                            </div>
                            <div class="switch_wrapper init">
                                <button class="btn btn-primary" id="reset">Reset Zoom</button>
                            </div>
                        </section>
                        <div id="graph">
                        </div>   
                        <div id="slider">
                            <p>

                            </p>
                            <label for="amount" class="font10 init">Word Occurrence :</label>
                            <input type="text" id="amount" readonly style="border:0; width:20px;color:#1F8EF6; font-size:12px;font-weight:bold;">
                            <div id="slider-vertical" style="height:200px;"></div>


                        </div>
                    </div>
                    <div class="rightBar">
                        <div id="popularBubble"></div>
                        <div id="tweets_wrapper">
                        </div>
                    </div>


              
               
            </div>
            <div class="dots_wrapper">
                <div class="dots">
                    Loading...
                </div>
            </div>

        </div>
        <div class="modal fade" id="userDetails" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                        <h4 class="modal-title" id="username"></h4>
                    </div>
                    <div class="modal-body">

                    </div>

                </div>
            </div>
        </div>
    </body>
</html>
<%@include file="../static/footer.jsp"%>

<script>
    $(document).ready(function() {
        $('#fullpage').fullpage({
            autoScrolling: false,
            anchors: ['firstPage', 'bubble'],
            menu: '#menu',
            slidesNavigation: true,
            loopHorizontal: false,
        });
    });
</script>