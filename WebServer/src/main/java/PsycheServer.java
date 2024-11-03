import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.net.ssl.SSLContext;
import javax.net.ssl.HttpsURLConnection;

class PsycheServer {
    public static void main(String[] args) {
        if (args.length < 1 || args[0] == null) {
            System.out.println("Invalid arguments: server must be started with a port number.");
            return;
        }
        int port;
        try {
            port = Integer.parseInt(args[0]);
        } catch (NumberFormatException e) {
            System.err.println("Invalid port number. Please provide a valid integer.");
            e.printStackTrace();
            return;
        }
        new PsycheServer(port);
    }

    public PsycheServer(int port) {
        ServerSocket server = null;
        SSLContext sslContext = null;
        try {
            sslContext = SSLContext.getInstance("TLSv1.2", "SunJSSE");
            sslContext.init(null, null, null);
        } catch (NoSuchAlgorithmException | NoSuchProviderException | KeyManagementException e) {
            throw new RuntimeException(e);
        }


        try {
            server = new ServerSocket(port);
            System.out.println("Server started on port: " + port);
            while (true) {
                try {
                    Socket sock = server.accept();
                    new Thread(new ClientHandler(sock)).start();
                } catch (IOException e) {
                    System.out.println("Error accepting client connection");
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private static Map<String, String> splitQuery(String query) {
        Map<String, String> queryPairs = new LinkedHashMap<>();
        if (query == null || query.isEmpty()) {
            return queryPairs;
        }
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx == -1)
                queryPairs.put(URLDecoder.decode(pair, StandardCharsets.UTF_8), "");
            else {
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                queryPairs.put(key, value);
            }
        }
        return queryPairs;
    }

    private static class ClientHandler implements Runnable {
        private final Socket socket;

        public ClientHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            InputStream in = null;
            OutputStream out = null;
            try {
                in = socket.getInputStream();
                out = socket.getOutputStream();
                byte[] response = createResponse(in);
                out.write(response);
                System.out.println("Response written to output stream");
                out.flush();
                System.out.println("Output stream flushed");
            } catch (IOException e) {
                System.out.println("Error handling client connection: " + e.getMessage());
                e.printStackTrace();
            } finally {
                try {
                    if (out != null) {
                        out.close();
                        System.out.println("Output stream closed");
                    }
                    if (in != null) {
                        in.close();
                        System.out.println("Input stream closed");
                    }
                    socket.close();  // Close socket after interaction
                    System.out.println("Socket closed");
                } catch (IOException e) {
                    System.out.println("Error closing socket");
                    e.printStackTrace();
                }
            }
        }
    }

    private static byte[] createResponse(InputStream inStream) {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(inStream, StandardCharsets.UTF_8))) {
            StringBuilder builder = new StringBuilder();
            String request = null;
            boolean done = false;
            while (!done) {
                String line = in.readLine();
                if (line == null || line.isEmpty()) {
                    done = true;
                } else if (line.startsWith("GET")) {
                    int firstSpace = line.indexOf(" ");
                    int secondSpace = line.indexOf(" ", firstSpace + 1);
                    request = line.substring(firstSpace + 2, secondSpace);
                }
            }
            if (request == null || request.isEmpty()) {
                builder.append("HTTP/1.1 400 Bad Request\r\n")
                        .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                        .append("<html>Illegal request: no GET</html>");
            } else if (request.contains("psyche?")) {
                try {
                    Map<String, String> query_pairs = splitQuery(request.replace("psyche?", ""));
                    String stepSize = query_pairs.get("STEP_SIZE");
                    String stopTime = query_pairs.get("STOP_TIME");

                    if (stepSize == null) {
                        builder.append("HTTP/1.1 400 Bad Request\r\n")
                                .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                                .append("Error 400: STEP_SIZE is required.");
                    } else {
                        String json = fetchURL(
                                "https://ssd.jpl.nasa.gov/api/horizons.api?format=text" +
                                        "&COMMAND='-255'" +
                                        "&OBJ_DATA='NO'" +
                                        "&MAKE_EPHEM='YES'" +
                                        "&EPHEM_TYPE='OBSERVER'" +
                                        "&CENTER='@399'" +
                                        "&START_TIME='2023-OCT-14'" +
                                        "&STOP_TIME=" + stopTime +
                                        "&STEP_SIZE=" + stepSize
                        );

                        builder.append("HTTP/1.1 200 OK\r\n")
                                .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                                .append(json);
                    }
                } catch (Exception e) {
                    builder.append("HTTP/1.1 500 Internal Server Error\r\n")
                            .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                            .append("Error: An unexpected error occurred: ").append(e.getMessage());
                }
            }
            return builder.toString().getBytes(StandardCharsets.UTF_8);
        } catch (IOException e) {
            return ("HTTP/1.1 500 Internal Server Error\r\n" +
                    "Content-Type: text/html; charset=utf-8\r\n\r\n" +
                    "Error: Unable to process request: " + e.getMessage()).getBytes(StandardCharsets.UTF_8);
        }
    }

    private static String fetchURL(String aUrl) {
        StringBuilder sb = new StringBuilder();
        try {
            URL url = new URL(aUrl);
            URLConnection conn = url.openConnection();
            conn.setReadTimeout(60 * 1000);  // Adjusted read timeout

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
            }
        } catch (Exception ex) {
            System.out.println("Exception in URL request: " + ex);
            ex.printStackTrace();
        }

        return sb.toString();
    }
}
