import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Initializes a Server to interact with Horizons API
 * to calculate current distance traveled and total distance
 * traveled in the mission.
 * @author Emily Dinaro
 * @version 11/6/2024
 */
class PsycheServer {
    private static final int TIMEOUT_LENGTH = 600000;
    private static final Map<String, Coordinate> ephemerisTable = new LinkedHashMap<>();
    private static final Map<String, Double> distanceTable = new LinkedHashMap<>();

    /**
     * Initializes the server called with command.
     * Validates the parameter inputs
     * Gradle PsycheServer -PPort={port-number}
     * @param args port number
     */
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

    /**
     * Private constructor to initialize server.
     * Updates ephemeris table - a table of coordinates centered on the sun
     * Updates distance table - a table of distance traveled by date
     * @param port - port the server operates on
     */
    private PsycheServer(int port) {
        try (ServerSocket server = new ServerSocket(port)) {
            updateEphemerisTable();
            updateDistanceTable();
            System.out.println(getMissionDistance());
            while (true) {
                try {
                    Socket sock = server.accept();
                    sock.setKeepAlive(true);
                    new Thread(new ClientHandler(sock)).start();
                } catch (IOException e) {
                    System.out.println("Error accepting client connection");
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Server initialization failed: ", e);
        }
    }

    /**
     * Returns the distance traveled in Million Kilometers
     * @return - current distance traveled in Million Kilometers
     */
    private static Double getCurrentDistance() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MMM-dd");
        LocalDateTime now = LocalDateTime.now();
        return distanceTable.get(dtf.format(now));
    }

    /**
     * Returns the total distance to be traveled in the mission in Million Kilometers
     * @return - the total distance to be traveled in the mission in Million Kilometers
     */
    private static Double getMissionDistance() {
        return distanceTable.get("2029-Jun-16");
    }

    /**
     * Populates the Ephemeris LinkedHashMap table to be populated with data pulled from the horizons
     * API
     */
    private static void updateEphemerisTable() {
        String json = fetchURL("https://ssd.jpl.nasa.gov/api/horizons.api?format=text" +
                "&COMMAND=%27-255%27" +
                "&OBJ_DATA=%27NO%27" +
                "&MAKE_EPHEM=%27YES%27" +
                "&EPHEM_TYPE=%27VECTOR%27" +
                "&VEC_TABLE=%271%27" +
                "&CSV_FORMAT=%27yes%27" +
                "&CENTER=%27@sun%27" +
                "&START_TIME=%272023-OCT-14%27" +
                "&STOP_TIME=%272029-06-16%27" +
                "&STEP_SIZE=%271%20d%27");

        Scanner jsonScanner = new Scanner(json);
        boolean pastHeader = false;
        ephemerisTable.clear();

        while (jsonScanner.hasNext()) {
            String line = jsonScanner.next();
            while (!pastHeader) {
                if (line.contains("$$SOE")) {
                    pastHeader = true;
                    line = line.replace("$$SOE", "").trim();
                    jsonScanner.useDelimiter(",");
                    break;
                }
                line = jsonScanner.next();
            }
            if (line.contains("$$EOE")) {
                break;
            }
            String date = jsonScanner.next().split(" ")[2];
            double x = Double.parseDouble(jsonScanner.next());
            double y = Double.parseDouble(jsonScanner.next());
            double z = Double.parseDouble(jsonScanner.next());
            ephemerisTable.put(date, new Coordinate(x, y, z));
        }
        jsonScanner.close();
    }

    /**
     * Updates the distance table from the ephemeris data, populates the LinkedHashMap object to
     * Store distance to date in "yyyy-MMM-dd" to "#.####" format
     */
    private static void updateDistanceTable() {
        if (ephemerisTable.isEmpty()) {
            System.err.println("Warning: ephemerisTable is empty. Cannot calculate distances.");
            return;
        }

        Iterator<String> keyIter = ephemerisTable.keySet().iterator();
        distanceTable.clear();
        String key1 = keyIter.next();
        distanceTable.put(key1, 0.0);

        double runningTotal = 0.0;
        while (keyIter.hasNext()) {
            String key2 = keyIter.next();
            Coordinate cord1 = ephemerisTable.get(key1);
            Coordinate cord2 = ephemerisTable.get(key2);
            double distance = Math.sqrt(Math.pow((cord2.x - cord1.x), 2)
                    + Math.pow((cord2.y - cord1.y), 2) + Math.pow((cord2.z - cord1.z), 2)) / 1e6;

            runningTotal += distance;
            runningTotal = new BigDecimal(runningTotal).setScale(4, RoundingMode.HALF_UP).doubleValue();
            distanceTable.put(key2, runningTotal);
            key1 = key2;
        }
    }

    /**
     * API interface access method
     * @param aUrl the url to access
     * @return the json interface
     */
    private static String fetchURL(String aUrl) {
        StringBuilder sb = new StringBuilder();
        try {
            URL url = new URL(aUrl);
            URLConnection conn = url.openConnection();
            conn.setConnectTimeout(60 * 1000);
            conn.setReadTimeout(60 * 1000);

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    sb.append(line);
                }
            }
        } catch (Exception ex) {
            System.err.println("Exception in URL request: " + ex);
            ex.printStackTrace();
        }
        return sb.toString();
    }

    /**
     * Coordinate class, getters and setters for the X, Y, Z coords of ephemeris data
     */
    private static class Coordinate {
        private final double x, y, z;
        public Coordinate(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        @Override
        public String toString() {
            return "Coordinate{x=" + x + ", y=" + y + ", z=" + z + '}';
        }
    }

    /**
     * The client handler class, this class takes client sockets and writes the JSON, it provides the interface for
     * interaction with the Server.
     */
    private static class ClientHandler implements Runnable {
        private final Socket socket;

        public ClientHandler(Socket socket) {
            this.socket = socket;
        }
        @Override
        public void run() {
            try (BufferedOutputStream out = new BufferedOutputStream(socket.getOutputStream());
                 InputStream in = socket.getInputStream()) {

                System.out.println("HERE RYAN");
                socket.setSoTimeout(TIMEOUT_LENGTH);
                byte[] response = createResponse(in);
                if (response == null || response.length == 0) {
                    response = "HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nServer Error".getBytes(StandardCharsets.UTF_8);
                }
                out.write(response);
                out.flush();

            } catch (IOException e) {
                System.err.println("Error handling client connection: " + e.getMessage());
                e.printStackTrace();
            } finally {
                try {
                    socket.close();
                    System.out.println("Socket closed");
                } catch (IOException e) {
                    System.err.println("Error closing socket: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        /**
         * Parse request - generates return of requested data
         * @param inStream
         * @return
         */
        private static byte[] createResponse(InputStream inStream) {
            StringBuilder builder = new StringBuilder();
            String request = null;
            try (BufferedReader in = new BufferedReader(new InputStreamReader(inStream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = in.readLine()) != null && !line.isEmpty()) {
                    if (line.startsWith("GET")) {
                        int firstSpace = line.indexOf(" ");
                        int secondSpace = line.indexOf(" ", firstSpace + 1);
                        request = line.substring(firstSpace + 2, secondSpace);
                    }
                }
                if (request == null) {
                    builder.append("HTTP/1.1 400 Bad Request\r\n")
                            .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                            .append("<html>Illegal request: no GET</html>");
                } else if (request.contains("distance?")) {
                    Map<String, String> query_pairs = splitQuery(request.replace("distance?", ""));
                    String stopTime = query_pairs.get("STOP_TIME");

                    if (stopTime == null) {
                        builder.append("HTTP/1.1 400 Bad Request\r\n")
                                .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                                .append("Error 400: STOP_TIME is required.");
                    } else {
                        String distance = "Current Distance: " + getCurrentDistance();
                        String totalDistance = "Mission Total Distance: " + getMissionDistance();
                        builder.append("HTTP/1.1 200 OK\r\n")
                                .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                                .append(distance + " " + totalDistance);
                    }
                }
            } catch (IOException e) {
                builder.append("HTTP/1.1 500 Internal Server Error\r\n")
                        .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                        .append("Error: Unable to process request: ").append(e.getMessage());
            }
            return builder.toString().getBytes(StandardCharsets.UTF_8);
        }

        /**
         * Helper class to parse parameters to url request
         * @param query
         * @return
         */
        private static Map<String, String> splitQuery(String query) {
            Map<String, String> queryPairs = new LinkedHashMap<>();
            if (query == null || query.isEmpty()) {
                return queryPairs;
            }
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                String value = idx == -1 ? "" : URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                queryPairs.put(key, value);
            }
            return queryPairs;
        }
    }
}
