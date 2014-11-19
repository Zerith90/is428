package twitter;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import twitter4j.auth.RequestToken;
import twitter4j.conf.ConfigurationBuilder;

/**
 *
 * @author Sherman
 */
@WebServlet(urlPatterns = {"/signin"})
public class signin extends HttpServlet {

    TwitterFactory tf = null;
    Twitter twitter = null;
    private static String twitter_consumer_key = "shermantan";
    private static String twitter_consumer_secret = "migueltansiongmin";

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

            initConfig();
            request.getSession().setAttribute("twitter", twitter);

            StringBuffer callbackURL = request.getRequestURL();
            int index = callbackURL.lastIndexOf("/");
            callbackURL.replace(index, callbackURL.length(), "").append("/callback");
            System.out.println(callbackURL);
            RequestToken requestToken = twitter.getOAuthRequestToken(callbackURL.toString());
            request.getSession().setAttribute("requestToken", requestToken);
            response.sendRedirect(requestToken.getAuthenticationURL());

        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {

            out.close();
        }
    }

    public void initConfig() {

        if (System.getenv("OPENSHIFT_APP_NAME") != null) {
            twitter_consumer_key = "tansiongmmin";
            twitter_consumer_secret = "miguelRiigen";
            System.out.println("tw33tboard");
        } else {
            System.out.println("localhost");
        }
        ConfigurationBuilder cb = new ConfigurationBuilder();
System.out.println(twitter_consumer_key);
        cb.setJSONStoreEnabled(true);
        cb.setDebugEnabled(true)
                .setOAuthConsumerKey(twitter_consumer_key)
                .setOAuthConsumerSecret(twitter_consumer_secret);
  
        tf = new TwitterFactory(cb.build());
        twitter = tf.getInstance();
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
