import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

class PsycheServer {
    private static final int TIMEOUT_LENGTH = 600000;
    private static Map<String, Coordinate> ephemerisTable;
    private static Map<String, Double> distanceTable;

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
        ephemerisTable = new LinkedHashMap<>();
        new PsycheServer(port);
    }

    public PsycheServer(int port) {
        ServerSocket server = null;
        try {
            server = new ServerSocket(port);
            System.out.println("Server started on port: " + port);
            updateEphemerisTable();
            updateDistanceTable();
            while (true) {
                try {
                    Socket sock = server.accept();
                    sock.setKeepAlive(true);
                    System.out.println("Socket Request found: " + sock.getInetAddress());
                    System.out.println("Socket Closed: " + sock.isClosed());
                    new Thread(new ClientHandler(sock)).start();
                } catch (IOException e) {
                    System.out.println("Error accepting client connection");
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static void updateEphemerisTable() throws Exception {
        // Fetch ephemeris data for the mission
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
        Map<String, Coordinate> ephemerisTable = new LinkedHashMap<>();
        boolean pastHeader = false;

        while (jsonScanner.hasNext()) {
            String line = jsonScanner.next();

            while (!pastHeader) {
                if (line.contains("$$SOE")) {
                    pastHeader = true;
                    line = line.replace("*","");
                    line = line.replace("$$SOE","");
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
            Coordinate coordinate = new Coordinate(x,y,z);

            ephemerisTable.put(date, coordinate);
        }
        PsycheServer.ephemerisTable = ephemerisTable;
    }

    private static void updateDistanceTable() {
        Set<String> keys = ephemerisTable.keySet();
        Iterator<String> keyIter = keys.iterator();
        distanceTable = new LinkedHashMap<>();


        String key1 = "";
        String key2 = "";
        if(keyIter.hasNext())
            key1 = keyIter.next();
        double runningTotal = 0.0;
        distanceTable.put(key1, runningTotal);

        while(keyIter.hasNext()) {
            key2 = keyIter.next();
            Coordinate cord1 = ephemerisTable.get(key1);
            Coordinate cord2 = ephemerisTable.get(key2);
            double distance = Math.sqrt(Math.pow((cord2.x-cord1.x),2)
                    +Math.pow((cord2.y-cord1.y),2)+Math.pow((cord2.z-cord1.z),2)); //distance formula in km
            distance/=1e6; //Convert km to million km

            runningTotal += distance;

            //Round to 4 decimal places
            BigDecimal bd = new BigDecimal(String.valueOf(runningTotal));
            bd = bd.setScale(4, RoundingMode.HALF_UP);
            runningTotal = bd.doubleValue();

            distanceTable.put(key2, runningTotal);

            if(keyIter.hasNext()) {
                key1 = key2;
            }
        }
    }


    private static class Coordinate {
        private final double x;
        private final double y;
        private final double z;

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




    private static class ClientHandler implements Runnable {
        private final Socket socket;

        public ClientHandler(Socket socket) {
            this.socket = socket;
        }

        @Override
        public void run() {
            System.out.println("Socket Thread Started: " + socket.getInetAddress());
            System.out.println("Socket Closed: " + socket.isClosed());
            try {
                socket.setSoTimeout(TIMEOUT_LENGTH);
            } catch (SocketException e) {
                throw new RuntimeException(e);
            }
            InputStream in = null;
            OutputStream out = null;
            try {
                System.out.println("Socket Closed1: " + socket.isClosed());
                in = socket.getInputStream();
                System.out.println("Socket Closed2: " + socket.isClosed());
                out = socket.getOutputStream();
                System.out.println("Socket Closed3: " + socket.isClosed());
                byte[] response = createResponse(in, socket);
                System.out.println("Socket Closed4: " + socket.isClosed());
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
                    socket.close();
                    System.out.println("Socket closed");
                } catch (IOException e) {
                    System.out.println("Error closing socket: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }
    }

    private static byte[] createResponse(InputStream inStream, Socket socket) {
        StringBuilder builder = new StringBuilder();
        String request = null;
        System.out.println("Socket Closed31: " + socket.isClosed());

        try (BufferedReader in = new BufferedReader(new InputStreamReader(inStream, StandardCharsets.UTF_8))) {
            System.out.println("Socket Closed32: " + socket.isClosed());
            String line;
            boolean done = false;
            System.out.println("Socket Closed33: " + socket.isClosed());
            while (!done && (line = in.readLine()) != null) {
                if (line.isEmpty()) {
                    done = true;
                } else if (line.startsWith("GET")) {
                    int firstSpace = line.indexOf(" ");
                    int secondSpace = line.indexOf(" ", firstSpace + 1);
                    request = line.substring(firstSpace + 2, secondSpace);
                }
            }
            System.out.println("Socket Closed34: " + socket.isClosed());
            if (request == null || request.isEmpty()) {
                builder.append("HTTP/1.1 400 Bad Request\r\n")
                        .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                        .append("<html>Illegal request: no GET</html>");
            } else if (request.contains("psyche?")) {
                System.out.println("Socket Closed35: " + socket.isClosed());
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
                    System.out.println("Socket Closed36: " + socket.isClosed());
                    return builder.toString().getBytes(StandardCharsets.UTF_8);
                } catch (Exception e) {
                    builder.append("HTTP/1.1 500 Internal Server Error\r\n")
                            .append("Content-Type: text/html; charset=utf-8\r\n\r\n")
                            .append("Error: An unexpected error occurred: ").append(e.getMessage());
                }
            }
        } catch (IOException e) {
            return ("HTTP/1.1 500 Internal Server Error\r\n" +
                    "Content-Type: text/html; charset=utf-8\r\n\r\n" +
                    "Error: Unable to process request: " + e.getMessage()).getBytes(StandardCharsets.UTF_8);
        }
        return builder.toString().getBytes(StandardCharsets.UTF_8);
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

    private static String fetchURL(String aUrl) {
        System.out.println("FETCH REQUEST");
        StringBuilder sb = new StringBuilder();
        try {
            URL url = new URL(aUrl);
            URLConnection conn = url.openConnection();
            conn.setReadTimeout(60 * 1000);

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
