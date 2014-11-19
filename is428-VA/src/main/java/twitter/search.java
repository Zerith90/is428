/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package twitter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import twitter4j.Query;
import twitter4j.QueryResult;
import twitter4j.RateLimitStatus;
import twitter4j.Status;
import twitter4j.Twitter;
import twitter4j.TwitterObjectFactory;
import twitter4j.json.DataObjectFactory;

/**
 *
 * @author Sherman
 */
@WebServlet(name = "search", urlPatterns = {"/search"})
public class search extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();
        try {
            System.out.println("search");
            Twitter twitter = (Twitter) request.getSession().getAttribute("twitter");
            String searchTerm = request.getParameter("query");
            Query query = new Query(searchTerm + "+exclude:retweets");
            query.setLang("en");
            query.setCount(100);
            query.setResultType(Query.RECENT);
            QueryResult result = twitter.search(query);
            RateLimitStatus status = null;
            JSONArray statuses = new JSONArray();
            
       
             System.out.println("Remaining request:" +status);
             int count=0;
        //   do {
        
            result = twitter.search(query);
            List<Status> tweets = result.getTweets();
            for (Status tweet : tweets) {
                JSONObject twit = new JSONObject(TwitterObjectFactory.getRawJSON(tweet));
                statuses.put(twit);

                
            }
               status=twitter.getRateLimitStatus().get("/search/tweets");
               System.out.println("Remaining request:" +status + " : " + count);
               System.out.println("Remaining request:" +status.getRemaining());
        count++;
         //  } while ((query = result.nextQuery()) != null || status.getRemaining() >=100);
          
            out.println(statuses);
         
        } catch (Exception ex) {
            JSONArray empty =new JSONArray();
            out.println(empty);
            ex.printStackTrace();
        } finally {
            out.close();
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
