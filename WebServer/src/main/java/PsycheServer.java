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
        updateEphemerisTable();
        updateDistanceTable();
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

}
