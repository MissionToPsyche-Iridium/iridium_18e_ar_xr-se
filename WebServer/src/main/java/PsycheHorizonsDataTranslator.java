import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
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
class PsycheHorizonsDataTranslator {
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
        generateDistanceDatabase();
    }

    private static void generateDistanceDatabase() {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        try {
            builder = factory.newDocumentBuilder();
        } catch (ParserConfigurationException e) {
            throw new RuntimeException(e);
        }

        Document document = builder.newDocument();
        Element root = document.createElement("PsycheDistanceDatabase");
        document.appendChild(root);

        Set<String> distance = distanceTable.keySet();
        for(String date : distance) {
            Element eEntry = document.createElement("entry");

            Element eDate = document.createElement("date");
            eDate.appendChild(document.createTextNode(date));

            Element eDistance = document.createElement("distance");
            eDistance.appendChild(document.createTextNode(String.valueOf(distanceTable.get(date))));

            eEntry.appendChild(eDate);
            eEntry.appendChild(eDistance);

            root.appendChild(eEntry);
        }

        try {
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource source = new DOMSource(document);
            StreamResult result = new StreamResult("../satellite_experience/assets/xml/distance.xml");
            transformer.transform(source, result);
        } catch (TransformerException e) {
            throw new RuntimeException(e);
        }

        System.out.println("XML file created successfully!");
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
